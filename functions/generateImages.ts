// PureTask Image Generator v3.9 — Returns generation tasks for agent execution
// Generates DALL-E prompts and returns them for the agent to process via generate_image + upload_file

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FALLBACK_PATTERNS = [
  "unsplash.com",
  "photo-1558618666",
  "photo-1584820927",
  "photo-1609220136",
  "oaidalleapiprodscus.blob.core.windows.net",
];

function isFallback(url: string | null | undefined): boolean {
  if (!url) return true;
  return FALLBACK_PATTERNS.some(p => url.includes(p));
}

const BRAND_PREFIX = `Magazine-quality lifestyle photography for PureTask, a premium home cleaning marketplace.
Brand: Clean, modern, premium, warm. Colors: PureTask blue #0099FF accents, white backgrounds, natural light.
Style: Real lifestyle photography feel — NOT stock. NOT corporate. NOT staged.
Always include a subtle PureTask blue #0099FF design element (throw pillow, artwork, product, wall accent).`;

const PILLAR_ENHANCERS: Record<string, string> = {
  "Transformation": "Split-panel professional illustration style: LEFT PANEL shows a specific cluttered/messy scene (dust visible, mail piled, laundry on chair, grimy surfaces). RIGHT PANEL shows exact same room completely transformed: gleaming floors, fresh flowers, sunlight streaming in, immaculate surfaces. Text labels 'Before' and 'After — PureTask'. Magazine-quality design, PureTask blue #0099FF on right panel.",
  "Proof":          "Clean premium infographic design: white background, PureTask blue #0099FF headers, large bold typography showing stats (4.9★, 10,000+ clients, 98% satisfaction, 2,400+ verified cleaners). Minimal layout, no clutter, magazine typography. Like an Apple product marketing graphic.",
  "Trust":          "Warm authentic lifestyle scene showing real trust moment. Natural window light, warm golden tones. A specific real interaction — NOT posed.",
  "Convenience":    "Bright modern home scene showing relief and ease. Natural morning light. Person relaxed — NOT stressed. Aspirational but achievable.",
  "Recruitment":    "Empowering scene for professional cleaners. Bright clean working environment. Person looks confident and in control of their work.",
  "Local":          "Bright modern home interior. Through large windows: the SPECIFIC city's most recognizable skyline or landmark. Natural daylight. Premium lifestyle feel.",
  "Seniors":        "Warm dignified intergenerational scene OR senior person in a spotlessly clean bright home. Warm light. NOT frail. NOT medical. NOT stock-looking.",
  "Spring":         "Bright spring scene: fresh flowers, natural light through clean windows, sparkling surfaces. Warm lifestyle energy. Aspirational.",
};

const PRIORITY_PILLARS = ["Transformation", "Proof", "Trust", "Convenience", "Local", "Recruitment", "Seniors", "Spring"];

Deno.serve(async (req) => {
  try {
    const base44  = createClientFromRequest(req);
    const db      = base44.asServiceRole.entities;
    const body    = await req.json().catch(() => ({}));
    const batchSize: number = body.batch_size || 4;

    const all = await db.ContentDraft.list();

    const needsImage = all.filter((d: any) =>
      ["Approved", "Draft"].includes(d.status) &&
      isFallback(d.image_url) &&
      !d.video_cdn_url
    );

    needsImage.sort((a: any, b: any) => {
      const ai = PRIORITY_PILLARS.indexOf(a.pillar) ?? 99;
      const bi = PRIORITY_PILLARS.indexOf(b.pillar) ?? 99;
      return ai - bi;
    });

    const batch = needsImage.slice(0, batchSize);
    console.log(`[ImageGen v3.9] ${needsImage.length} need images. Preparing batch of ${batch.length} for agent processing.`);

    const tasks: any[] = [];

    for (const draft of batch) {
      const pillarHint = PILLAR_ENHANCERS[draft.pillar] || "";
      const cityHint   = draft.city ? `Setting: ${draft.city} home. Show ${draft.city} landmark through window if possible.` : "";
      const prompt     = `${BRAND_PREFIX}\n\n${pillarHint}\n\n${cityHint}\n\nSPECIFIC SCENE DIRECTION:\n${draft.image_prompt || `PureTask ${draft.pillar} pillar — ${draft.audience || "homeowner"} audience.`}`;

      tasks.push({
        draft_id: draft.id,
        title: draft.title,
        pillar: draft.pillar,
        prompt: prompt.slice(0, 4000),
        action: "generate_image_and_upload"
      });
      console.log(`[ImageGen v3.9] Task queued: "${draft.title}" (${draft.pillar})`);
    }

    const remaining = needsImage.length - batch.length;
    
    return Response.json({
      ok: true,
      tasks_prepared: tasks.length,
      tasks: tasks,
      remaining_after_batch: remaining,
      agent_action: tasks.length > 0 ? "Generate images and upload to each draft" : "No images needed",
    });

  } catch (e: any) {
    console.error("[ImageGen v3.9 Error]", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});
