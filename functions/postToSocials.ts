import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const AYRSHARE_API_KEY = Deno.env.get("AYRSHARE_API_KEY");
const AYRSHARE_BASE = "https://app.ayrshare.com/api";

// Map our platform names to Ayrshare platform keys
const PLATFORM_MAP: Record<string, string> = {
  "Facebook": "facebook",
  "Instagram": "instagram",
  "TikTok": "tiktok",
  "LinkedIn": "linkedin",
  "X": "twitter",
  "Pinterest": "pinterest"
};

// Map our platform names to which content field to use
const CONTENT_FIELD_MAP: Record<string, string> = {
  "Facebook": "platform_facebook",
  "Instagram": "platform_instagram",
  "TikTok": "platform_tiktok",
  "LinkedIn": "platform_linkedin",
  "X": "platform_x",
  "Pinterest": "platform_pinterest"
};

async function postToAyrshare(platforms: string[], post: string, scheduleDate?: string) {
  const body: Record<string, any> = {
    post,
    platforms,
  };

  if (scheduleDate) {
    body.scheduleDate = scheduleDate;
  }

  const res = await fetch(`${AYRSHARE_BASE}/post`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return await res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { draft_id, platforms, schedule_date } = body;

    if (!draft_id) {
      return Response.json({ error: "draft_id is required" }, { status: 400 });
    }

    // Load the draft
    const draft = await base44.asServiceRole.entities.ContentDraft.get(draft_id);
    if (!draft) {
      return Response.json({ error: "Draft not found" }, { status: 404 });
    }

    const targetPlatforms: string[] = platforms || 
      (draft.scheduled_platforms ? draft.scheduled_platforms.split(", ") : []);

    if (targetPlatforms.length === 0) {
      return Response.json({ error: "No platforms specified" }, { status: 400 });
    }

    const results: Record<string, any> = {};
    const postedPlatforms: string[] = [];
    const failedPlatforms: string[] = [];

    // Post to each platform individually so we can use platform-specific copy
    for (const platform of targetPlatforms) {
      const ayrPlatform = PLATFORM_MAP[platform];
      const contentField = CONTENT_FIELD_MAP[platform];

      if (!ayrPlatform) {
        failedPlatforms.push(platform);
        results[platform] = { error: "Unknown platform" };
        continue;
      }

      // Use platform-specific copy, fall back to primary caption
      const postText = draft[contentField] || draft.primary_caption || draft.hook || "";

      if (!postText) {
        failedPlatforms.push(platform);
        results[platform] = { error: "No content for this platform" };
        continue;
      }

      try {
        const ayrRes = await postToAyrshare([ayrPlatform], postText, schedule_date);
        results[platform] = ayrRes;
        if (ayrRes.status === "success" || ayrRes.postIds) {
          postedPlatforms.push(platform);
        } else {
          failedPlatforms.push(platform);
        }
      } catch (err: any) {
        results[platform] = { error: err.message };
        failedPlatforms.push(platform);
      }
    }

    // Update draft status
    const newStatus = postedPlatforms.length > 0 
      ? (schedule_date ? "Scheduled" : "Posted") 
      : draft.status;

    await base44.asServiceRole.entities.ContentDraft.update(draft_id, {
      status: newStatus,
      posted_platforms: postedPlatforms.join(", "),
      scheduled_platforms: targetPlatforms.join(", "),
      ...(schedule_date ? { scheduled_date: schedule_date } : {})
    });

    return Response.json({
      ok: true,
      draft_id,
      posted_to: postedPlatforms,
      failed: failedPlatforms,
      schedule_date: schedule_date || null,
      results
    });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
