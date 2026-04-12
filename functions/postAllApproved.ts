// postAllApproved.ts v2.0 — Batched Ayrshare posting with timeout handling
// Posts all Approved ContentDrafts to their respective platforms via Ayrshare
// Runs every 3 hours, posts 5 drafts at a time to avoid timeouts
// Call with POST {} to post next batch, or { limit: 10 } to change batch size

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const AYRSHARE_KEY = Deno.env.get("AYRSHARE_API_KEY")!;
const AYRSHARE_URL = "https://app.ayrshare.com/api/post";
const FALLBACK_IMG  = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&q=80";

const PLATFORM_FIELDS: Record<string, string> = {
  facebook:  "platform_facebook",
  instagram: "platform_instagram",
  linkedin:  "platform_linkedin",
  tiktok:    "platform_tiktok",
  twitter:   "platform_x",
  pinterest: "platform_pinterest",
};

function trimHashtags(caption: string, max = 5): string {
  const tags = (caption.match(/#\w+/g) || []);
  if (tags.length <= max) return caption;
  const base = caption.replace(/#\w+/g, "").trim();
  return base + "\n\n" + tags.slice(0, max).join(" ");
}

async function postOne(platform: string, caption: string, mediaUrl: string): Promise<string> {
  const cap = platform === "instagram" ? trimHashtags(caption) : caption;
  const body = { post: cap, platforms: [platform], mediaUrls: [mediaUrl] };
  try {
    const res = await fetch(AYRSHARE_URL, {
      method: "POST",
      headers: { "Authorization": `Bearer ${AYRSHARE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const errs = (data.errors || []).map((e: any) => e.message || "unknown").join("; ");
    const ok = (data.status === "success" || (data.postIds?.length > 0)) && !errs;
    return ok ? "OK" : `FAIL: ${errs.slice(0, 80)}`;
  } catch (e: any) {
    return `ERR: ${e.message?.slice(0, 60)}`;
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const batchSize = body.limit || 5; // Post 5 drafts per run = ~30-40s total

  const db = base44.asServiceRole.entities;
  
  // Get only Approved drafts that haven't been posted yet
  const allDrafts = await db.ContentDraft.list({ limit: 500 });
  const toPost = allDrafts.filter((d: any) => 
    d.status === "Approved" && 
    (!d.posted_platforms || d.posted_platforms === "" || d.posted_platforms === "[]")
  );

  console.log(`[postAllApproved] Found ${toPost.length} unposted Approved drafts. Posting next ${Math.min(batchSize, toPost.length)}...`);

  const results: any[] = [];
  let totalOk = 0, totalFail = 0;

  // Process only first N drafts this run
  for (let i = 0; i < Math.min(batchSize, toPost.length); i++) {
    const draft = toPost[i];
    const media = draft.video_cdn_url || draft.image_url || FALLBACK_IMG;
    const draftResult: any = { id: draft.id, title: draft.title, platforms: {} };
    const postedPlatforms: string[] = [];

    for (const [platform, field] of Object.entries(PLATFORM_FIELDS)) {
      const caption = draft[field];
      if (!caption) continue;

      const result = await postOne(platform, caption, media);
      draftResult.platforms[platform] = result;

      if (result === "OK") {
        totalOk++;
        postedPlatforms.push(platform);
      } else {
        totalFail++;
      }

      // 1.5s delay between posts to avoid rate limits
      await new Promise(r => setTimeout(r, 1500));
    }

    // Update DB — mark posted platforms and change status to "Posted"
    if (postedPlatforms.length > 0) {
      await db.ContentDraft.update(draft.id, {
        posted_platforms: postedPlatforms.join(","),
        status: "Posted",
      });
    }

    results.push(draftResult);
    console.log(`[postAllApproved] ${draft.title}: ${JSON.stringify(draftResult.platforms)}`);
  }

  const remaining = toPost.length - batchSize;

  return Response.json({
    ok: true,
    batch_size: batchSize,
    drafted_posted_this_run: Math.min(batchSize, toPost.length),
    total_ok: totalOk,
    total_fail: totalFail,
    remaining_approved_drafts: Math.max(0, remaining),
    next_run_will_post: Math.min(batchSize, remaining),
    results,
  });
});
