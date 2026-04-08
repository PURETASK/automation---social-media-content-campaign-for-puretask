import { base44 } from '@base44/core';

const BRAND_PREFIX = `Professional lifestyle photography for a home cleaning marketplace. 
Clean minimal aesthetic. White and light gray tones. Bright natural lighting. 
Aspirational, magazine-quality. No text overlays. No clutter. Warm tones. Modern home interiors.`;

export default async function generateImages(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { draft_ids, size = '1792x1024', batch_size = 3 } = body;

  const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not set' }), { status: 500 });
  }

  // Fetch drafts that need images
  let drafts = [];
  if (draft_ids && Array.isArray(draft_ids)) {
    for (const id of draft_ids) {
      const draft = await base44.asServiceRole.entities.ContentDraft.get(id);
      if (draft) drafts.push(draft);
    }
  } else {
    // Auto-fetch pending drafts with image_prompt but no generated image
    const all = await base44.asServiceRole.entities.ContentDraft.filter({
      status: 'Pending Approval'
    });
    drafts = all.filter((d: any) => d.image_prompt && !d.editor_notes?.includes('IMAGE_GENERATED'))
                .slice(0, batch_size);
  }

  const results = [];

  for (const draft of drafts) {
    try {
      const fullPrompt = `${BRAND_PREFIX} ${draft.image_prompt}`;
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: fullPrompt,
          n: 1,
          size: size,
          quality: 'hd',
          style: 'natural'
        })
      });

      const data = await response.json();
      
      if (data.data?.[0]?.url) {
        const imageUrl = data.data[0].url;
        const revisedPrompt = data.data[0].revised_prompt;
        
        // Update the draft with the image URL
        await base44.asServiceRole.entities.ContentDraft.update(draft.id, {
          editor_notes: (draft.editor_notes || '') + `\nIMAGE_GENERATED: ${imageUrl}\nRevised prompt: ${revisedPrompt?.slice(0, 100)}`
        });

        results.push({
          draft_id: draft.id,
          title: draft.title,
          success: true,
          image_url: imageUrl,
          pillar: draft.pillar,
          audience: draft.audience
        });
      } else {
        results.push({
          draft_id: draft.id,
          title: draft.title,
          success: false,
          error: data.error?.message || 'No image returned'
        });
      }

      // Rate limit: 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (e) {
      results.push({
        draft_id: draft.id,
        title: draft.title,
        success: false,
        error: String(e)
      });
    }
  }

  const succeeded = results.filter(r => r.success).length;
  return new Response(JSON.stringify({
    generated: succeeded,
    failed: results.length - succeeded,
    results
  }), { headers: { 'Content-Type': 'application/json' } });
}
