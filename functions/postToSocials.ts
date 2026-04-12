// PureTask Post to Socials v2.0
// Fixes: proper posted_platforms tracking, Instagram 5-hashtag trim, TikTok video-only guard

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const AYRSHARE_API_KEY = Deno.env.get("AYRSHARE_API_KEY");
const AYRSHARE_BASE = "https://app.ayrshare.com/api";

const PLATFORM_MAP: Record<string, string> = {
  "Facebook": "facebook",
  "Instagram": "instagram",
  "TikTok": "tiktok",
  "LinkedIn": "linkedin",
  "X": "twitter",
  "Pinterest": "pinterest",
  "Threads": "threads"
};

const CONTENT_FIELD_MAP: Record<string, string> = {
  "Facebook": "platform_facebook",
  "Instagram": "platform_instagram",
  "TikTok": "platform_tiktok",
  "LinkedIn": "platform_linkedin",
  "X": "platform_x",
  "Pinterest": "platform_pinterest",
  "Threads": "platform_instagram" // fallback to IG copy for Threads
};

// Trim Instagram captions to max 5 hashtags (Ayrshare plan limit)
function trimInstagramHashtags(text: string): string {
  const hashtagMatches = text.match(/#\w+/g) || [];
  if (hashtagMatches.length <= 5) return text;
  const keep = hashtagMatches.slice(0, 5);
  const noHashtags = text.replace(/#\w+/g, "").trim();
  return noHashtags + "\n\n" + keep.join(" ");
}

// Parse existing posted_platforms — handles both "[]" JSON and "Facebook, LinkedIn" string
function parsePostedPlatforms(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const str = String(raw).trim();
  if (str === "[]" || str === "") return [];
  // Try JSON parse
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  // Try comma-separated
  return str.split(",").map(s => s.trim()).filter(Boolean);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const { draft_id, platforms, schedule_date, media_url } = body;

    if (!draft_id) return Response.json({ error: "draft_id is required" }, { status: 400 });

    const db = base44.asServiceRole.entities;
    const draft = await db.ContentDraft.get(draft_id);
    if (!draft) return Response.json({ error: "Draft not found" }, { status: 404 });

    const targetPlatforms: string[] = platforms ||
      (draft.scheduled_platforms ? draft.scheduled_platforms.split(",").map((s: string) => s.trim()) : []);

    if (targetPlatforms.length === 0) return Response.json({ error: "No platforms specified" }, { status: 400 });

    const posted: string[] = [];
    const failed: string[] = [];
    const details: Record<string, any> = {};

    for (const platform of targetPlatforms) {
      const ayrPlatform = PLATFORM_MAP[platform];
      const contentField = CONTENT_FIELD_MAP[platform];

      if (!ayrPlatform) {
        failed.push(platform);
        details[platform] = { error: "Unknown platform mapping" };
        continue;
      }

      // TikTok requires a video URL — skip if none available
      if (platform === "TikTok" && !media_url && !draft.video_cdn_url) {
        failed.push(platform);
        details[platform] = { error: "TikTok requires a video URL. Generate HeyGen video first." };
        continue;
      }

      let postText = draft[contentField] || draft.primary_caption || draft.hook || "";

      if (!postText) {
        // Auto-generate minimal copy from primary_caption if field empty
        postText = draft.primary_caption || draft.hook || "";
        if (!postText) {
          failed.push(platform);
          details[platform] = { error: "No content for this platform" };
          continue;
        }
      }

      // Instagram: enforce 5 hashtag max
      if (platform === "Instagram") {
        postText = trimInstagramHashtags(postText);
      }

      // Build Ayrshare request
      const ayrBody: any = {
        post: postText,
        platforms: [ayrPlatform]
      };

      // Attach media if available
      const videoUrl = media_url || draft.video_cdn_url;
      const imageUrl = draft.image_url;

      if (platform === "TikTok" && videoUrl) {
        ayrBody.mediaUrls = [videoUrl];
      } else if (imageUrl) {
        ayrBody.mediaUrls = [imageUrl];
      }

      // Schedule if date provided
      if (schedule_date) {
        ayrBody.scheduleDate = schedule_date;
      }

      try {
        const res = await fetch(`${AYRSHARE_BASE}/post`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
            "Content-Type": "application/json",
            "User-Agent": "curl/7.88.1"
          },
          body: JSON.stringify(ayrBody)
        });

        const data = await res.json();
        details[platform] = data;

        if (data.status === "success" || data.postIds || (data.data && data.data.id)) {
          posted.push(platform);
          console.log(`[PostToSocials] ✅ ${platform} posted successfully`);
        } else {
          failed.push(platform);
          console.log(`[PostToSocials] ❌ ${platform} failed:`, JSON.stringify(data));
        }
      } catch (err: any) {
        failed.push(platform);
        details[platform] = { error: err.message };
        console.log(`[PostToSocials] ❌ ${platform} error:`, err.message);
      }
    }

    // ── FIX: Properly update posted_platforms ──
    // Merge with any existing posted platforms
    const existingPosted = parsePostedPlatforms(draft.posted_platforms);
    const allPosted = [...new Set([...existingPosted, ...posted])];

    const newStatus = posted.length > 0
      ? (schedule_date ? "Scheduled" : "Posted")
      : draft.status;

    await db.ContentDraft.update(draft_id, {
      status: newStatus,
      posted_platforms: allPosted.join(", "), // Store as clean comma-separated string
      ...(schedule_date ? { scheduled_date: schedule_date } : {})
    });

    console.log(`[PostToSocials] Draft ${draft_id} → status: ${newStatus} | posted to: ${allPosted.join(", ")}`);

    return Response.json({
      ok: posted.length > 0,
      draft_id,
      posted_to: posted,
      failed,
      all_posted_platforms: allPosted,
      status: newStatus,
      schedule_date: schedule_date || null,
      details
    });

  } catch (error: any) {
    console.error("[PostToSocials Error]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
