// permanentImageUploader — Downloads expiring DALL-E URLs and re-uploads to permanent CDN
// Fixes the #1 system risk: all DALL-E image URLs expire after 2 hours

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const body = await req.json().catch(() => ({}));
    const { batch_size = 10 } = body;

    // Get all drafts with DALL-E temp URLs (blob.core.windows.net) 
    const all = await db.ContentDraft.list({ limit: 200 });
    const needsUpload = all.filter((d: any) => 
      d.image_url && 
      (d.image_url.includes('blob.core.windows.net') || d.image_url.includes('oaidalleapiprodscus'))
    ).slice(0, batch_size);

    if (needsUpload.length === 0) {
      return Response.json({ ok: true, message: "All images already on permanent CDN", processed: 0 });
    }

    const results: any[] = [];

    for (const draft of needsUpload) {
      try {
        // Download the image
        const imgRes = await fetch(draft.image_url);
        if (!imgRes.ok) {
          // URL expired — mark for regeneration
          await db.ContentDraft.update(draft.id, { 
            image_url: null,
            editor_notes: (draft.editor_notes || '') + ' | image_url expired — needs regen'
          });
          results.push({ id: draft.id, title: draft.title, status: 'expired — cleared for regen' });
          continue;
        }

        const buffer = await imgRes.arrayBuffer();
        const uint8 = new Uint8Array(buffer);

        // Upload to Base44 permanent storage via multipart form
        const formData = new FormData();
        const blob = new Blob([uint8], { type: 'image/png' });
        formData.append('file', blob, `puretask-${draft.id}.png`);

        const uploadRes = await base44.storage.upload(blob, `puretask-${draft.id}.png`, 'image/png');
        const permanentUrl = uploadRes?.url || uploadRes?.file_url || null;

        if (permanentUrl) {
          await db.ContentDraft.update(draft.id, { image_url: permanentUrl });
          results.push({ id: draft.id, title: draft.title, status: '✅ permanent CDN', url: permanentUrl.slice(0, 60) });
        } else {
          results.push({ id: draft.id, title: draft.title, status: '❌ upload failed' });
        }
      } catch (e: any) {
        results.push({ id: draft.id, title: draft.title, status: '❌ error: ' + e.message.slice(0, 50) });
      }
    }

    return Response.json({ ok: true, processed: results.length, results });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});
