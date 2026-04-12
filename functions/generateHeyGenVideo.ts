// PureTask HeyGen Video Generation Engine v1.0
// Picks queued drafts → generates videos → scores → auto-posts if ≥ 7.5
// Platform logic: TikTok/Reels = 15s/30s 9:16 | Facebook/LinkedIn = 30s/45s 16:9 | YouTube = 45s 9:16

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const HEYGEN_API_KEY = Deno.env.get("HEYGEN_API_KEY");
const AYRSHARE_API_KEY = Deno.env.get("AYRSHARE_API_KEY");
const HEYGEN_BASE = "https://api.heygen.com";
const AYRSHARE_BASE = "https://app.ayrshare.com/api";

// Default PureTask avatar + voice
const DEFAULT_AVATAR_ID = "Abigail_expressive_2024112501";
const DEFAULT_VOICE_ID = "PXNEIUJiwgmsriDe9m6P"; // addison carter - Voice 1

// Platform config: which script + aspect ratio to use
const PLATFORM_VIDEO_CONFIG: Record<string, { script: "script_15sec"|"script_30sec"|"script_45sec"; aspect_ratio: string; use_avatar: boolean }> = {
  tiktok:    { script: "script_30sec", aspect_ratio: "9:16", use_avatar: false },
  instagram: { script: "script_30sec", aspect_ratio: "9:16", use_avatar: false },
  facebook:  { script: "script_45sec", aspect_ratio: "16:9", use_avatar: true  },
  linkedin:  { script: "script_45sec", aspect_ratio: "16:9", use_avatar: true  },
  youtube:   { script: "script_45sec", aspect_ratio: "9:16", use_avatar: false },
};

// Which pillar uses avatar vs VO-only
function shouldUseAvatar(pillar: string, platform: string): boolean {
  const avatarPillars = ["Trust", "Recruitment"];
  const avatarPlatforms = ["facebook", "linkedin"];
  return avatarPillars.includes(pillar) || avatarPlatforms.includes(platform);
}

// Build HeyGen payload
function buildHeyGenPayload(draft: any, platform: string, config: typeof PLATFORM_VIDEO_CONFIG[string]) {
  const script = draft[config.script] || draft.script_30sec || draft.script_15sec || "";
  if (!script) return null;

  const useAvatar = shouldUseAvatar(draft.pillar || "", platform);
  const [w, h] = config.aspect_ratio === "9:16" ? [720, 1280] : [1280, 720];

  const payload: any = {
    video_inputs: [
      {
        character: useAvatar ? {
          type: "avatar",
          avatar_id: DEFAULT_AVATAR_ID,
          avatar_style: "normal"
        } : {
          type: "talking_photo",
          talking_photo_id: DEFAULT_AVATAR_ID
        },
        voice: {
          type: "text",
          input_text: script,
          voice_id: DEFAULT_VOICE_ID,
          speed: 1.0
        },
        background: {
          type: "color",
          value: "#FFFFFF"
        }
      }
    ],
    dimension: { width: w, height: h },
    caption: true, // always subtitles on
    title: draft.title || "PureTask Video"
  };

  return payload;
}

// Call HeyGen to generate a video
async function generateVideo(payload: any): Promise<{ video_id: string } | { error: string }> {
  try {
    const res = await fetch(`${HEYGEN_BASE}/v2/video/generate`, {
      method: "POST",
      headers: {
        "X-Api-Key": HEYGEN_API_KEY!,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.data?.video_id) return { video_id: data.data.video_id };
    return { error: data.message || data.error || "HeyGen generation failed" };
  } catch (e: any) {
    return { error: e.message };
  }
}

// Poll HeyGen for video status (up to 10 min)
async function pollVideoStatus(video_id: string): Promise<{ status: string; video_url?: string; error?: string }> {
  const maxAttempts = 20; // 20 x 30s = 10 min
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 30000)); // wait 30 seconds
    try {
      const res = await fetch(`${HEYGEN_BASE}/v1/video_status.get?video_id=${video_id}`, {
        headers: { "X-Api-Key": HEYGEN_API_KEY! }
      });
      const data = await res.json();
      const status = data.data?.status;
      if (status === "completed") return { status: "completed", video_url: data.data.video_url };
      if (status === "failed") return { status: "failed", error: data.data?.error || "Generation failed" };
      // still processing — keep polling
    } catch (e: any) {
      return { status: "failed", error: e.message };
    }
  }
  return { status: "failed", error: "Timeout after 10 minutes" };
}

// Score the video on v3.0 rubric
function scoreVideo(draft: any, script: string, platform: string): { clarity: number; relatability: number; conversion: number; avg: number; notes: string } {
  let clarity = 8;
  let relatability = 8;
  let conversion = 8;
  const issues: string[] = [];

  // Check URL on script
  if (!script.includes("puretask.co")) { clarity -= 2; issues.push("No URL in script"); }
  // Check CTA at end
  const lastSentence = script.split(".").filter(Boolean).pop() || "";
  if (!lastSentence.toLowerCase().includes("visit") && !lastSentence.toLowerCase().includes("book") && !lastSentence.toLowerCase().includes("puretask")) {
    conversion -= 3; issues.push("No CTA in final scene");
  }
  // Check hook speed (first sentence should be punchy — under 12 words)
  const firstSentence = script.split(".")[0] || "";
  if (firstSentence.split(" ").length > 12) { relatability -= 2; issues.push("Hook too slow (>12 words)"); }
  // Check stats usage
  const hasStats = /4\.9|10,000|98%|2,400|6 hours|80.85/.test(script);
  if (!hasStats) { conversion -= 1; issues.push("Missing brand stats"); }
  // Check platform-specific copy exists
  const platField = `platform_${platform}`;
  if (!draft[platField]) { clarity -= 2; issues.push(`No ${platform} copy`); }
  // Check generic language
  if (/are you tired|cleaning is hard|do you hate/i.test(script)) { relatability -= 2; issues.push("Generic hook detected"); }

  // Clamp scores
  clarity = Math.max(1, Math.min(10, clarity));
  relatability = Math.max(1, Math.min(10, relatability));
  conversion = Math.max(1, Math.min(10, conversion));
  const avg = (clarity + relatability + conversion) / 3;

  return {
    clarity,
    relatability,
    conversion,
    avg,
    notes: issues.length ? `Video penalties: ${issues.join(", ")}` : "Clean score — no penalties"
  };
}

// Post video to Ayrshare
async function postVideoToAyrshare(platforms: string[], caption: string, videoUrl: string): Promise<{ ok: boolean; posted: string[]; failed: string[] }> {
  const posted: string[] = [];
  const failed: string[] = [];

  for (const platform of platforms) {
    try {
      // Instagram: trim to 5 hashtags
      let finalCaption = caption;
      if (platform === "instagram") {
        const hashtagMatches = caption.match(/#\w+/g) || [];
        if (hashtagMatches.length > 5) {
          const keep = hashtagMatches.slice(0, 5);
          finalCaption = caption.replace(/#\w+/g, "").trim() + "\n\n" + keep.join(" ");
        }
      }

      const body: any = {
        post: finalCaption,
        platforms: [platform === "x" ? "twitter" : platform],
        mediaUrls: [videoUrl]
      };

      const res = await fetch(`${AYRSHARE_BASE}/post`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
          "Content-Type": "application/json",
          "User-Agent": "curl/7.88.1"
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.status === "success" || data.postIds) {
        posted.push(platform);
      } else {
        failed.push(platform);
        console.log(`Ayrshare ${platform} failed:`, JSON.stringify(data));
      }
    } catch (e: any) {
      failed.push(platform);
      console.log(`Ayrshare ${platform} error:`, e.message);
    }
  }

  return { ok: posted.length > 0, posted, failed };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    // Can pass specific draft_id or leave empty to auto-pick queued drafts
    const { draft_id, max_videos = 3, target_platforms = ["tiktok", "instagram"] } = body;

    const db = base44.asServiceRole.entities;

    // Get drafts to process
    let draftsToProcess: any[] = [];
    if (draft_id) {
      const d = await db.ContentDraft.get(draft_id);
      if (d) draftsToProcess = [d];
    } else {
      // Auto-pick: queued drafts with scripts ready, prioritize by pillar balance
      const allDrafts = await db.ContentDraft.list();
      const queued = allDrafts.filter((d: any) =>
        d.heygen_status === "Queued" &&
        (d.script_30sec || d.script_15sec || d.script_45sec) &&
        d.status === "Approved"
      );
      // Prioritize: vary pillars, pick top scoring first
      const sorted = queued.sort((a: any, b: any) => {
        const aAvg = ((a.clarity_score||7) + (a.relatability_score||7) + (a.conversion_score||7)) / 3;
        const bAvg = ((b.clarity_score||7) + (b.relatability_score||7) + (b.conversion_score||7)) / 3;
        return bAvg - aAvg;
      });
      draftsToProcess = sorted.slice(0, max_videos);
    }

    if (draftsToProcess.length === 0) {
      return Response.json({ ok: true, message: "No queued drafts with scripts found", processed: 0 });
    }

    const results: any[] = [];

    for (const draft of draftsToProcess) {
      const draftResult: any = { draft_id: draft.id, title: draft.title, videos: [] };

      // Generate one video per target platform (different aspect ratios)
      const platformsToGenerate = new Set<string>();

      // Pick platforms based on draft content availability
      for (const plat of target_platforms) {
        const platField = `platform_${plat}`;
        if (draft[platField] || draft.platform_tiktok || draft.platform_instagram) {
          platformsToGenerate.add(plat);
        }
      }

      // Dedupe by aspect ratio — only generate each ratio once
      const generatedRatios = new Set<string>();

      for (const platform of platformsToGenerate) {
        const config = PLATFORM_VIDEO_CONFIG[platform] || PLATFORM_VIDEO_CONFIG.tiktok;
        const ratioKey = config.aspect_ratio;

        if (generatedRatios.has(ratioKey)) {
          // Already generating this ratio — reuse for this platform
          draftResult.videos.push({ platform, status: "reusing", aspect_ratio: ratioKey });
          continue;
        }
        generatedRatios.add(ratioKey);

        const script = draft[config.script] || draft.script_30sec || draft.script_15sec || "";
        if (!script) {
          draftResult.videos.push({ platform, status: "skipped", reason: "No script available" });
          continue;
        }

        // Score the video BEFORE generating
        const score = scoreVideo(draft, script, platform);
        console.log(`[HeyGen] Draft: ${draft.title} | Platform: ${platform} | Score: ${score.avg.toFixed(1)}`);

        if (score.avg < 7.5) {
          // Don't generate — would fail anyway
          await db.ContentDraft.update(draft.id, {
            heygen_status: "Failed",
            editor_notes: `Pre-generation score check failed (${score.avg.toFixed(1)}). ${score.notes}`
          });
          draftResult.videos.push({ platform, status: "rejected_pre_score", score: score.avg, notes: score.notes });
          continue;
        }

        // Build payload and generate
        const payload = buildHeyGenPayload(draft, platform, config);
        if (!payload) {
          draftResult.videos.push({ platform, status: "skipped", reason: "Could not build payload" });
          continue;
        }

        console.log(`[HeyGen] Generating video for ${draft.title} (${platform} ${ratioKey})...`);

        // Mark as generating
        await db.ContentDraft.update(draft.id, { heygen_status: "Generating" });

        const genResult = await generateVideo(payload);
        if ("error" in genResult) {
          await db.ContentDraft.update(draft.id, {
            heygen_status: "Failed",
            editor_notes: `HeyGen API error: ${genResult.error}`
          });
          draftResult.videos.push({ platform, status: "generation_failed", error: genResult.error });
          continue;
        }

        // Store video_id immediately
        await db.ContentDraft.update(draft.id, { heygen_video_id: genResult.video_id });

        // Poll for completion
        console.log(`[HeyGen] Polling video ${genResult.video_id}...`);
        const pollResult = await pollVideoStatus(genResult.video_id);

        if (pollResult.status !== "completed" || !pollResult.video_url) {
          await db.ContentDraft.update(draft.id, {
            heygen_status: "Failed",
            editor_notes: `HeyGen polling failed: ${pollResult.error || "unknown"}`
          });
          draftResult.videos.push({ platform, status: "poll_failed", error: pollResult.error });
          continue;
        }

        const videoUrl = pollResult.video_url;
        console.log(`[HeyGen] Video ready: ${videoUrl}`);

        // Store CDN URL and mark completed
        await db.ContentDraft.update(draft.id, {
          heygen_status: "Completed",
          video_cdn_url: videoUrl
        });

        // Now post to applicable platforms
        const platformsForPost = Array.from(platformsToGenerate).filter(p => {
          return PLATFORM_VIDEO_CONFIG[p]?.aspect_ratio === ratioKey;
        });

        const caption = draft[`platform_${platform}`] || draft.platform_instagram || draft.platform_tiktok || draft.primary_caption || "";

        const postResult = await postVideoToAyrshare(platformsForPost, caption, videoUrl);

        // Update posted_platforms
        const existingPosted = draft.posted_platforms ? draft.posted_platforms.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
        const allPosted = [...new Set([...existingPosted, ...postResult.posted])];

        await db.ContentDraft.update(draft.id, {
          status: postResult.ok ? "Posted" : "Approved",
          posted_platforms: allPosted.join(", ")
        });

        draftResult.videos.push({
          platform,
          status: "completed",
          video_url: videoUrl,
          score: score.avg,
          posted_to: postResult.posted,
          failed_platforms: postResult.failed
        });
      }

      results.push(draftResult);
    }

    return Response.json({
      ok: true,
      processed: results.length,
      results
    });

  } catch (error: any) {
    console.error("[HeyGen Function Error]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
