// PureTask HeyGen Video Poller v1.0
// Checks status of all "Processing" HeyGen videos
// When complete, saves video_cdn_url to ContentDraft and marks Completed
// Runs every 15 minutes via automation

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const HEYGEN_API_KEY = Deno.env.get("HEYGEN_API_KEY");
const HEYGEN_BASE = "https://api.heygen.com";

async function checkVideoStatus(video_id: string): Promise<{ status: string; video_url?: string; error?: string }> {
  try {
    const res = await fetch(`${HEYGEN_BASE}/v1/video_status.get?video_id=${video_id}`, {
      headers: { "X-Api-Key": HEYGEN_API_KEY! },
    });
    const data = await res.json();
    const status = data.data?.status;
    if (status === "completed") return { status: "completed", video_url: data.data.video_url };
    if (status === "failed") return { status: "failed", error: data.data?.error || "Video generation failed" };
    return { status: status || "processing" };
  } catch (e: any) {
    return { status: "error", error: e.message };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    // Find all drafts with Processing HeyGen status
    const allDrafts = await db.ContentDraft.list();
    const processing = allDrafts.filter((d: any) =>
      d.heygen_status === "Processing" && d.heygen_video_id
    );

    if (processing.length === 0) {
      return Response.json({ ok: true, message: "No videos currently processing", checked: 0 });
    }

    console.log(`[HeyGen Poller] Checking ${processing.length} videos...`);

    const results: any[] = [];

    for (const draft of processing) {
      const result = await checkVideoStatus(draft.heygen_video_id);
      console.log(`[HeyGen Poller] ${draft.title}: ${result.status}`);

      if (result.status === "completed" && result.video_url) {
        await db.ContentDraft.update(draft.id, {
          heygen_status: "Completed",
          video_cdn_url: result.video_url,
          editor_notes: `[HeyGen Poller] ✅ Completed ${new Date().toISOString()} | URL: ${result.video_url}`,
        });
        results.push({ title: draft.title, status: "completed", video_url: result.video_url });
        console.log(`[HeyGen Poller] ✅ Saved CDN URL for: ${draft.title}`);
      } else if (result.status === "failed") {
        await db.ContentDraft.update(draft.id, {
          heygen_status: "Failed",
          editor_notes: `[HeyGen Poller] ❌ Failed ${new Date().toISOString()}: ${result.error}`,
        });
        results.push({ title: draft.title, status: "failed", error: result.error });
      } else {
        // Still processing — just log it
        results.push({ title: draft.title, status: result.status });
      }
    }

    const completed = results.filter(r => r.status === "completed").length;
    const failed = results.filter(r => r.status === "failed").length;
    const stillProcessing = results.filter(r => !["completed","failed"].includes(r.status)).length;

    return Response.json({
      ok: true,
      checked: processing.length,
      completed,
      failed,
      still_processing: stillProcessing,
      results,
    });
  } catch (e: any) {
    console.error("[HeyGen Poller] Fatal error:", e.message);
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
});
