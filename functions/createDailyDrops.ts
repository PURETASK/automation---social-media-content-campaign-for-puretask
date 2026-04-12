// PureTask Daily Content Drops v3.0
// FIXED: Actually pulls Approved drafts with images and posts them via Ayrshare
// Old version just created DB records — did nothing. This is the real pipeline.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const AYRSHARE_API_KEY = Deno.env.get("AYRSHARE_API_KEY");
const AYRSHARE_BASE = "https://app.ayrshare.com/api";

// Platform posting windows (PT) — which platforms get posts today
const PLATFORM_SCHEDULE: Record<string, number[]> = {
  // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  Facebook:   [1, 2, 3, 4, 5],       // Mon–Fri
  Instagram:  [1, 3, 5],             // Mon, Wed, Fri
  LinkedIn:   [1, 2, 3, 4, 5],       // Mon–Fri
  Pinterest:  [0, 1, 2, 3, 4, 5, 6], // Every day (evening)
  X:          [1, 2, 3, 4, 5],       // Mon–Fri
};

const PLATFORM_MAP: Record<string, string> = {
  Facebook: "facebook",
  Instagram: "instagram",
  LinkedIn: "linkedin",
  Pinterest: "pinterest",
  X: "twitter",
};

const CONTENT_FIELD_MAP: Record<string, string> = {
  Facebook:  "platform_facebook",
  Instagram: "platform_instagram",
  LinkedIn:  "platform_linkedin",
  Pinterest: "platform_pinterest",
  X:         "platform_x",
};

function trimInstagramHashtags(text: string): string {
  const tags = text.match(/#\w+/g) || [];
  if (tags.length <= 5) return text;
  const noTags = text.replace(/#\w+/g, "").trim();
  return noTags + "\n\n" + tags.slice(0, 5).join(" ");
}

function parsePostedPlatforms(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const str = String(raw).trim();
  if (!str || str === "[]") return [];
  try { const p = JSON.parse(str); if (Array.isArray(p)) return p; } catch {}
  return str.split(",").map((s: string) => s.trim()).filter(Boolean);
}

async function postToAyrshare(platform: string, text: string, imageUrl: string | null): Promise<{ ok: boolean; data: any }> {
  const ayrPlatform = PLATFORM_MAP[platform];
  const body: any = { post: text, platforms: [ayrPlatform] };
  if (imageUrl) body.mediaUrls = [imageUrl];

  try {
    const res = await fetch(`${AYRSHARE_BASE}/post`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const ok = data.status === "success" || !!data.postIds || !!(data.data?.id);
    return { ok, data };
  } catch (e: any) {
    return { ok: false, data: { error: e.message } };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const body = await req.json().catch(() => ({}));
    const {
      max_posts = 3,          // max drafts to post per run
      require_image = true,   // only post drafts that have image_url
      force_platforms = null, // override platform schedule (e.g. ["Facebook","Instagram"])
      dry_run = false,        // if true: log what would post but don't actually post
    } = body;

    // Get day of week (PT)
    const nowPT = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    const dow = nowPT.getDay(); // 0=Sun ... 6=Sat

    // Determine which platforms are active today
    const activePlatforms = force_platforms || Object.keys(PLATFORM_SCHEDULE).filter(p => PLATFORM_SCHEDULE[p].includes(dow));
    console.log(`[DailyDrops] Day ${dow} — active platforms: ${activePlatforms.join(", ")}`);

    // Pull all Approved drafts
    const allDrafts = await db.ContentDraft.list();
    const eligible = allDrafts.filter((d: any) => {
      if (d.status !== "Approved") return false;
      if (require_image && !d.image_url) return false; // must have image
      const alreadyPosted = parsePostedPlatforms(d.posted_platforms);
      // Must have at least one active platform not yet posted
      const remaining = activePlatforms.filter((p: string) => !alreadyPosted.includes(p));
      return remaining.length > 0;
    });

    console.log(`[DailyDrops] ${eligible.length} eligible drafts found`);

    if (eligible.length === 0) {
      return Response.json({ ok: true, message: "No eligible drafts to post today.", posted: 0 });
    }

    // Priority order: Spring > Seniors > City > Recruitment > Trust > Convenience > Proof > Transformation
    const PILLAR_PRIORITY: Record<string, number> = {
      "Spring 2026": 0, "Seniors Campaign": 1, "City Launch Series": 2,
      "Cleaner Recruitment Campaign": 3, Trust: 4, Convenience: 5, Proof: 6, Transformation: 7,
    };

    eligible.sort((a: any, b: any) => {
      const pa = PILLAR_PRIORITY[a.campaign_tag] ?? PILLAR_PRIORITY[a.pillar] ?? 8;
      const pb = PILLAR_PRIORITY[b.campaign_tag] ?? PILLAR_PRIORITY[b.pillar] ?? 8;
      return pa - pb;
    });

    const toPost = eligible.slice(0, max_posts);
    const results: any[] = [];

    for (const draft of toPost) {
      const alreadyPosted = parsePostedPlatforms(draft.posted_platforms);
      const platformsToHit = activePlatforms.filter((p: string) => !alreadyPosted.includes(p));
      const draftResults: Record<string, any> = {};
      const posted: string[] = [];
      const failed: string[] = [];

      console.log(`[DailyDrops] Posting: "${draft.title}" → ${platformsToHit.join(", ")}`);

      for (const platform of platformsToHit) {
        const contentField = CONTENT_FIELD_MAP[platform];
        let text = draft[contentField] || draft.primary_caption || "";

        if (!text) { failed.push(platform); continue; }
        if (platform === "Instagram") text = trimInstagramHashtags(text);

        if (dry_run) {
          draftResults[platform] = { dry_run: true, text: text.slice(0, 100) + "..." };
          posted.push(platform);
          continue;
        }

        const { ok, data } = await postToAyrshare(platform, text, draft.image_url || null);
        draftResults[platform] = data;
        if (ok) {
          posted.push(platform);
          console.log(`[DailyDrops] ✅ ${platform}`);
        } else {
          failed.push(platform);
          console.log(`[DailyDrops] ❌ ${platform}:`, JSON.stringify(data).slice(0, 200));
        }

        await new Promise(r => setTimeout(r, 1000)); // rate limit between platforms
      }

      // Update draft status in DB
      if (posted.length > 0) {
        const allPosted = [...new Set([...alreadyPosted, ...posted])];
        await db.ContentDraft.update(draft.id, {
          status: "Posted",
          posted_platforms: allPosted.join(", "),
        });
      }

      results.push({
        id: draft.id,
        title: draft.title,
        pillar: draft.pillar,
        posted_to: posted,
        failed,
        platforms: draftResults,
      });

      await new Promise(r => setTimeout(r, 2000));
    }

    const totalPosted = results.filter(r => r.posted_to.length > 0).length;

    return Response.json({
      ok: true,
      day_of_week: dow,
      active_platforms: activePlatforms,
      drafts_processed: toPost.length,
      drafts_posted: totalPosted,
      dry_run,
      results,
    });

  } catch (error: any) {
    console.error("[DailyDrops Error]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
