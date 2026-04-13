// postAllApproved v3.0 — NEVER posts without a real image. Blocks generic fallbacks.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const AYRSHARE_KEY = Deno.env.get("AYRSHARE_API_KEY")!;
const AYRSHARE_URL = "https://app.ayrshare.com/api/post";

// Known bad fallback URLs — NEVER post these
const BLOCKED_IMAGE_PATTERNS = [
  "unsplash.com",
  "photo-1558618666", // the spray bottle
  "photo-1584820927", // cleaner at door (manual fallback we set)
  "photo-1609220136", // family (manual fallback we set)
];

function isBlockedImage(url: string | null | undefined): boolean {
  if (!url) return true;
  return BLOCKED_IMAGE_PATTERNS.some(p => url.includes(p));
}

const PLATFORM_FIELDS: Record<string, string> = {
  facebook:  "platform_facebook",
  instagram: "platform_instagram",
  linkedin:  "platform_linkedin",
  tiktok:    "platform_tiktok",
  pinterest: "platform_pinterest",
  // twitter excluded — not connected in Ayrshare
};

function trimHashtags(cap: string, max = 5): string {
  const tags = cap.match(/#\w+/g) || [];
  if (tags.length <= max) return cap;
  return cap.replace(/#\w+/g, "").trim() + "\n\n" + tags.slice(0, max).join(" ");
}

async function postOne(platform: string, caption: string, media: string): Promise<string> {
  const cap = platform === "instagram" ? trimHashtags(caption) : caption;
  try {
    const res = await fetch(AYRSHARE_URL, {
      method: "POST",
      headers: { "Authorization": `Bearer ${AYRSHARE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ post: cap, platforms: [platform], mediaUrls: [media] }),
    });
    const d = await res.json();
    const errs = (d.errors || []).map((e: any) => e.message || "").join("; ");
    return (d.status === "success" || d.postIds?.length > 0) && !errs ? "OK" : `FAIL:${errs.slice(0, 120)}`;
  } catch (e: any) { return `ERR:${e.message?.slice(0,80)}`; }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const db = base44.asServiceRole.entities;
  const body = await req.json().catch(() => ({}));
  const batchSize: number = body.batch_size || 5;

  const all = await db.ContentDraft.list();

  // Only post if: Approved + no posted_platforms + has a REAL non-blocked image
  const unposted = all.filter((d: any) => {
    if (d.status !== "Approved") return false;
    const pp = d.posted_platforms;
    if (pp && pp !== "" && pp !== "[]") return false;
    return true;
  });

  const withImage = unposted.filter((d: any) => !isBlockedImage(d.image_url) && !isBlockedImage(d.video_cdn_url));
  const missingImage = unposted.filter((d: any) => isBlockedImage(d.image_url) && isBlockedImage(d.video_cdn_url));

  const batch = withImage.slice(0, batchSize);
  console.log(`[postAllApproved v3] ${unposted.length} unposted. ${withImage.length} have real images. ${missingImage.length} blocked (no real image). Posting batch of ${batch.length}.`);

  let totalOk = 0, totalFail = 0;
  const results: any[] = [];
  const fails: any[] = [];

  for (const draft of batch) {
    const media = draft.video_cdn_url || draft.image_url;
    const postedPlats: string[] = [];

    for (const [platform, field] of Object.entries(PLATFORM_FIELDS)) {
      const cap = draft[field];
      if (!cap) continue;
      const result = await postOne(platform, cap, media);
      if (result === "OK") { totalOk++; postedPlats.push(platform); }
      else { totalFail++; fails.push({ title: draft.title, platform, error: result }); }
      await new Promise(r => setTimeout(r, 1200));
    }

    if (postedPlats.length > 0) {
      await db.ContentDraft.update(draft.id, { posted_platforms: postedPlats.join(","), status: "Posted" });
      console.log(`[postAllApproved v3] ✅ "${draft.title}" → ${postedPlats.join(", ")}`);
    } else {
      console.log(`[postAllApproved v3] ❌ "${draft.title}" — all platforms failed`);
    }
    results.push({ title: draft.title, platforms: postedPlats });
  }

  return Response.json({
    ok: true,
    posted_this_run: batch.length,
    total_ok: totalOk,
    total_fail: totalFail,
    remaining_with_image: Math.max(0, withImage.length - batchSize),
    blocked_missing_image: missingImage.length,
    blocked_titles: missingImage.map((d: any) => d.title),
    fails,
    results,
  });
});