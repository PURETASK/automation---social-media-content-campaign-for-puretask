// postAllApproved v2.0 — posts all Approved drafts to Ayrshare, marks Posted in DB
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const AYRSHARE_KEY = Deno.env.get("AYRSHARE_API_KEY")!;
const BASE = "https://app.ayrshare.com/api/post";
const FALLBACK = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&q=80";

const FIELDS: Record<string, string> = {
  facebook:  "platform_facebook",
  instagram: "platform_instagram",
  linkedin:  "platform_linkedin",
  tiktok:    "platform_tiktok",
  pinterest: "platform_pinterest",
  // twitter excluded — not connected to Ayrshare
};

function trimTags(cap: string, n = 5): string {
  const tags = cap.match(/#\w+/g) || [];
  if (tags.length <= n) return cap;
  return cap.replace(/#\w+/g, "").trim() + "\n\n" + tags.slice(0, n).join(" ");
}

async function postOne(platform: string, caption: string, media: string): Promise<string> {
  const cap = platform === "instagram" ? trimTags(caption) : caption;
  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Authorization": `Bearer ${AYRSHARE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ post: cap, platforms: [platform], mediaUrls: [media] }),
    });
    const d = await res.json();
    const errs = (d.errors || []).map((e: any) => e.message || "").join("; ");
    return (d.status === "success" || d.postIds?.length > 0) && !errs ? "OK" : `FAIL:${errs.slice(0, 80)}`;
  } catch (e: any) {
    return `ERR:${e.message?.slice(0, 60)}`;
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const db = base44.asServiceRole.entities;
  const body = await req.json().catch(() => ({}));
  const dryRun = body.dry_run === true;
  const limitTo: string | null = body.limit_to || null; // optional: post only specific pillar

  const allDrafts = await db.ContentDraft.list();
  let approved = allDrafts.filter((d: any) => d.status === "Approved");
  if (limitTo) approved = approved.filter((d: any) => d.pillar === limitTo);

  let totalOk = 0, totalFail = 0;
  const results: any[] = [];
  const fails: any[] = [];

  for (const draft of approved) {
    const media = draft.video_cdn_url || draft.image_url || FALLBACK;
    const postedPlats: string[] = [];
    const platResults: Record<string, string> = {};

    for (const [platform, field] of Object.entries(FIELDS)) {
      const cap = draft[field];
      if (!cap) continue;
      if (dryRun) { platResults[platform] = "DRY_RUN"; continue; }

      const result = await postOne(platform, cap, media);
      platResults[platform] = result;
      if (result === "OK") { totalOk++; postedPlats.push(platform); }
      else { totalFail++; fails.push({ title: draft.title, platform, error: result }); }

      await new Promise(r => setTimeout(r, 1500));
    }

    if (!dryRun && postedPlats.length > 0) {
      const existing = draft.posted_platforms
        ? draft.posted_platforms.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];
      const merged = [...new Set([...existing, ...postedPlats])];
      await db.ContentDraft.update(draft.id, {
        posted_platforms: merged.join(","),
        status: "Posted"
      });
    }

    results.push({ id: draft.id, title: draft.title, platforms: platResults });
    console.log(`[postAllApproved] ${draft.title} →`, JSON.stringify(platResults));
  }

  return Response.json({
    ok: true, dry_run: dryRun,
    total_approved: approved.length,
    total_ok: totalOk, total_fail: totalFail,
    fails, results
  });
});
