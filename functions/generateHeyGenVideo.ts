// PureTask HeyGen Video Generation Engine v3.0 — VIDEO AGENT ONLY
// Uses /v1/video_agent/generate exclusively — full scenes, B-roll, motion graphics, music
// NEVER use /v2/video/generate — that produces raw VO-only output (horrible quality)
//
// How it works:
//   1. Pick queued Approved drafts that have video_prompt populated
//   2. Build a rich scene-by-scene Video Agent prompt from the draft data
//   3. Submit to /v1/video_agent/generate with avatar_id + voice_id in config
//   4. Poll for completion (Video Agent takes 5–15 min)
//   5. Save video_cdn_url to ContentDraft, mark heygen_status = Completed
//
// Automation: Wednesday 9am PT (automation ID: 69dae0c83e06a07ea5224230)

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const HEYGEN_API_KEY = Deno.env.get("HEYGEN_API_KEY");
const HEYGEN_BASE = "https://api.heygen.com";

// PureTask default avatar + voice — always use these unless draft specifies otherwise
const DEFAULT_AVATAR_ID = "Abigail_expressive_2024112501";
const DEFAULT_VOICE_ID  = "PXNEIUJiwgmsriDe9m6P"; // addison carter - Voice 1

// Brand constants injected into every prompt
const BRAND = {
  url:    "https://www.puretask.co",
  blue:   "#0099FF",
  white:  "#FFFFFF",
  dark:   "#1A1A2E",
  stats:  "10,000+ happy clients · 4.9★ · 98% satisfaction · 2,400+ verified cleaners · 50+ cities",
};

// Pillar → avatar decision: Trust + Recruitment use avatar; everything else VO-only
function useAvatar(pillar: string): boolean {
  return ["Trust", "Recruitment"].includes(pillar);
}

// Pillar → aspect ratio: Recruitment/Trust for LinkedIn/FB = 16:9; everything else 9:16
function aspectRatio(pillar: string): string {
  return ["Trust", "Recruitment"].includes(pillar) ? "16:9" : "9:16";
}

// Pillar → duration
function videoDuration(pillar: string): string {
  return ["Trust", "Recruitment"].includes(pillar) ? "45 seconds" : "30 seconds";
}

// Build the Video Agent prompt from a ContentDraft record
// This is the core of the system — richer prompt = better video
function buildVideoAgentPrompt(draft: any): string {
  const avatar     = useAvatar(draft.pillar || "");
  const ratio      = aspectRatio(draft.pillar || "");
  const duration   = videoDuration(draft.pillar || "");
  const avatarLine = avatar
    ? `Use the Abigail avatar (professional, warm, expressive). Place her on a clean PureTask branded background (${BRAND.blue} or ${BRAND.white}).`
    : `Voice-over only — NO avatar. Use lifestyle stock footage and motion graphics throughout.`;

  // Use the draft's video_prompt as the core scene direction if populated
  const sceneDirection = draft.video_prompt
    ? `\n\nSCENE DIRECTION FROM BRIEF:\n${draft.video_prompt}`
    : "";

  // Use the best available script
  const script = draft.script_30sec || draft.script_45sec || draft.script_15sec || draft.hook || "";

  // Build platform-aware caption note
  const primaryCaption = draft.primary_caption || draft.platform_instagram || draft.platform_facebook || "";

  return `Create a ${duration} ${ratio} vertical video for PureTask — a home cleaning marketplace.

BRAND IDENTITY:
- Primary color: ${BRAND.blue} (use for text highlights, CTAs, badges, overlays)
- Background/text: ${BRAND.white} and ${BRAND.dark}
- Visual style: Clean, bright, modern, lifestyle-authentic. Premium but warm. NEVER dark/moody/corporate/cluttered.
- Brand stats available to use: ${BRAND.stats}
- Website: ${BRAND.url} — MUST appear visually on screen in the outro

AUDIENCE & MESSAGE:
- Pillar: ${draft.pillar || "Convenience"}
- Audience: ${draft.audience || "Busy Homeowners"}
- Hook: ${draft.hook || ""}
- Core message: ${draft.title || ""}

AVATAR/VO:
${avatarLine}

VOICE STYLE:
Warm, natural, conversational — like a real person talking to a friend. Never corporate or stiff. Confident and direct.

SCRIPT TO FOLLOW:
${script}
${sceneDirection}

PRODUCTION REQUIREMENTS:
- Subtitles/captions: ALWAYS ON throughout the entire video
- Intro card: PureTask logo + pillar tagline (0.5 seconds)
- Outro card: PureTask logo + "${BRAND.url}" + CTA (last 3–4 seconds)
- "${BRAND.url}" MUST be visible as text on screen in the outro — no exceptions
- Music: Subtle, modern, lifestyle underscore. Uplifting but not hype. Matches the emotional arc.
- Use motion graphics for stats, checklists, comparisons — animated, clean, branded
- Use stock footage for lifestyle scenes (clean homes, happy families, bright interiors)
- Before/after contrast where relevant (messy → clean, stressed → relaxed)
- CTA in final scene: "Visit ${BRAND.url}" or "Book at ${BRAND.url}"

VISUAL STYLE GUIDE:
Use minimal, clean styled visuals. ${BRAND.blue}, ${BRAND.dark}, and ${BRAND.white} as main colors. Leverage motion graphics as B-roll overlays. Use AI-generated video or stock media for lifestyle scenes. Include an intro sequence, outro sequence, and smooth transitions between scenes. Every stat or trust signal should animate in — not just appear static.`;
}

// Submit one draft to Video Agent
async function submitVideoAgent(draft: any): Promise<{ video_id: string } | { error: string }> {
  const prompt = buildVideoAgentPrompt(draft);
  const avatar  = useAvatar(draft.pillar || "");

  const config: Record<string, string> = {
    voice_id: DEFAULT_VOICE_ID,
  };
  if (avatar) config.avatar_id = DEFAULT_AVATAR_ID;

  try {
    const res = await fetch(`${HEYGEN_BASE}/v1/video_agent/generate`, {
      method: "POST",
      headers: {
        "X-Api-Key": HEYGEN_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, config }),
    });
    const data = await res.json();
    if (data.data?.video_id) return { video_id: data.data.video_id };
    return { error: data.message || data.error || JSON.stringify(data) };
  } catch (e: any) {
    return { error: e.message };
  }
}

// Poll for completion — Video Agent typically takes 5–15 min
// We poll up to 25 times × 36s = 15 min max
async function pollStatus(video_id: string): Promise<{ status: string; video_url?: string; error?: string }> {
  const maxAttempts = 25;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 36000)); // 36 seconds
    try {
      const res = await fetch(`${HEYGEN_BASE}/v1/video_status.get?video_id=${video_id}`, {
        headers: { "X-Api-Key": HEYGEN_API_KEY! },
      });
      const data = await res.json();
      const status = data.data?.status;
      if (status === "completed") return { status: "completed", video_url: data.data.video_url };
      if (status === "failed")    return { status: "failed", error: data.data?.error || "failed" };
      // pending/processing — keep waiting
    } catch (e: any) {
      return { status: "failed", error: e.message };
    }
  }
  return { status: "pending", error: "Still processing after 15 min — check manually" };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Options:
    //   draft_id   — generate for a specific draft
    //   max_videos — how many to process this run (default 3)
    //   pillar     — filter to a specific pillar
    const { draft_id, max_videos = 3, pillar } = body;

    const db = base44.asServiceRole.entities;

    // --- Pick drafts to process ---
    let drafts: any[] = [];

    if (draft_id) {
      const d = await db.ContentDraft.get(draft_id);
      if (d) drafts = [d];
    } else {
      const all = await db.ContentDraft.list();
      let pool = all.filter((d: any) =>
        d.status === "Approved" &&
        (d.heygen_status === "Queued" || !d.heygen_status) &&
        !d.video_cdn_url &&
        (d.video_prompt || d.script_30sec || d.script_45sec || d.script_15sec || d.hook)
      );
      if (pillar) pool = pool.filter((d: any) => d.pillar === pillar);
      // Sort: highest avg score first
      pool.sort((a: any, b: any) => {
        const aAvg = ((a.clarity_score||7) + (a.relatability_score||7) + (a.conversion_score||7)) / 3;
        const bAvg = ((b.clarity_score||7) + (b.relatability_score||7) + (b.conversion_score||7)) / 3;
        return bAvg - aAvg;
      });
      drafts = pool.slice(0, max_videos);
    }

    if (drafts.length === 0) {
      return Response.json({ ok: true, message: "No eligible drafts found", processed: 0 });
    }

    const results: any[] = [];

    for (const draft of drafts) {
      console.log(`[HeyGen VA] Submitting: ${draft.title}`);

      // Mark as processing
      await db.ContentDraft.update(draft.id, {
        heygen_status: "Processing",
        editor_notes: `[Video Agent] Submitted ${new Date().toISOString()}`,
      });

      // Submit to Video Agent
      const submission = await submitVideoAgent(draft);
      if ("error" in submission) {
        console.log(`[HeyGen VA] Submit failed for ${draft.title}: ${submission.error}`);
        await db.ContentDraft.update(draft.id, {
          heygen_status: "Failed",
          editor_notes: `[Video Agent] Submit error: ${submission.error}`,
        });
        results.push({ title: draft.title, status: "submit_failed", error: submission.error });
        continue;
      }

      const { video_id } = submission;
      console.log(`[HeyGen VA] Submitted ${draft.title} → video_id: ${video_id}`);

      // Save the video_id immediately so we can track it
      await db.ContentDraft.update(draft.id, { heygen_video_id: video_id });

      // Poll for completion
      const result = await pollStatus(video_id);

      if (result.status === "completed" && result.video_url) {
        await db.ContentDraft.update(draft.id, {
          heygen_status: "Completed",
          video_cdn_url: result.video_url,
          editor_notes: `[Video Agent] Completed ${new Date().toISOString()} — full scenes, B-roll, motion graphics`,
        });
        console.log(`[HeyGen VA] ✅ Completed: ${draft.title}`);
        results.push({ title: draft.title, status: "completed", video_id, video_url: result.video_url });
      } else if (result.status === "pending") {
        // Still processing after timeout — save ID, automation will catch it next run
        await db.ContentDraft.update(draft.id, {
          heygen_status: "Processing",
          editor_notes: `[Video Agent] Still processing after timeout — video_id: ${video_id}`,
        });
        results.push({ title: draft.title, status: "still_processing", video_id });
      } else {
        await db.ContentDraft.update(draft.id, {
          heygen_status: "Failed",
          editor_notes: `[Video Agent] Failed: ${result.error}`,
        });
        results.push({ title: draft.title, status: "failed", error: result.error });
      }
    }

    return Response.json({ ok: true, processed: drafts.length, results });

  } catch (e: any) {
    console.error("[HeyGen VA] Fatal error:", e.message);
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
});
