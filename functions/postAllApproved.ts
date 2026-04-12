// postAllApproved.ts
// Posts all Approved ContentDrafts to their respective platforms via Ayrshare
// Runs each draft sequentially with a 2s delay between posts
// Call with POST {} to start, or { dry_run: true } to preview without posting

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
  const dryRun = body.dry_run === true;

  const db = base44.asServiceRole.entities;
  const allDrafts = await db.ContentDraft.list();
  const approved = allDrafts.filter((d: any) => d.status === "Approved");

  const results: any[] = [];
  let totalOk = 0, totalFail = 0;

  for (const draft of approved) {
    const media = draft.video_cdn_url || draft.image_url || FALLBACK_IMG;
    const draftResult: any = { id: draft.id, title: draft.title, platforms: {} };
    const postedPlatforms: string[] = [];

    for (const [platform, field] of Object.entries(PLATFORM_FIELDS)) {
      const caption = draft[field];
      if (!caption) continue;

      if (dryRun) {
        draftResult.platforms[platform] = "DRY_RUN";
        continue;
      }

      const result = await postOne(platform, caption, media);
      draftResult.platforms[platform] = result;

      if (result === "OK") {
        totalOk++;
        postedPlatforms.push(platform);
      } else {
        totalFail++;
      }

      await new Promise(r => setTimeout(r, 2000)); // 2s between posts
    }

    // Update DB — mark posted platforms
    if (!dryRun && postedPlatforms.length > 0) {
      const existing = draft.posted_platforms
        ? (Array.isArray(draft.posted_platforms) ? draft.posted_platforms : [draft.posted_platforms])
        : [];
      const merged = [...new Set([...existing, ...postedPlatforms])];
      await db.ContentDraft.update(draft.id, {
        posted_platforms: merged.join(","),
        status: "Posted",
      });
    }

    results.push(draftResult);
    console.log(`[postAllApproved] ${draft.title}: ${JSON.stringify(draftResult.platforms)}`);
  }

  return Response.json({
    ok: true,
    dry_run: dryRun,
    total_drafts: approved.length,
    total_ok: totalOk,
    total_fail: totalFail,
    results,
  });
});
