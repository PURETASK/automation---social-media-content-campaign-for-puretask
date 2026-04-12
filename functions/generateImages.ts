// PureTask Image Generation Pipeline v2.1
// FIXED: Fire-and-forget async — doesn't wait for all DALL-E 3 renders to complete
// Returns immediately, images populate as they finish
// Prioritizes: Transformation > Proof > Trust > Convenience > Local > Recruitment > Seniors > Spring

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');

const BRAND_PREFIX = `Magazine-quality lifestyle photography for PureTask, a premium home cleaning marketplace. 
Clean minimal aesthetic. Bright natural lighting. PureTask blue (#0099FF) accent elements present. 
White and light gray dominant tones. Real people, real spaces. Aspirational but authentic. 
No text overlays unless specified. No clutter. No dark moody tones. No stock photo feel.`;

const PILLAR_VISUAL_GUIDE: Record<string, string> = {
  Convenience: "Focus on ease, relief, and time reclaimed. Show people enjoying their free time in a spotlessly clean home.",
  Trust: "Show professional cleaners looking confident and trustworthy. Uniforms, badges, GPS phones. Bright open spaces.",
  Transformation: "Stylized split-panel: LEFT = messy/cluttered muted tones. RIGHT = spotless/gleaming bright tones. Professional illustration style.",
  Recruitment: "Show empowered, confident professional cleaners. NOT servile or sad. Arms crossed, smiling, proud of their work.",
  Local: "Include recognizable city visual — skyline, landmark. Combine with clean modern home interior.",
  Proof: "Clean premium infographic. PureTask blue (#0099FF). Large bold stats: 10,000+ clients, 4.9★, 98% satisfaction, 2,400+ cleaners.",
  Seniors: "Warm intergenerational scenes. Adult children + parents. Safe familiar home. Warm lighting. Dignified, capable people.",
  Spring: "Bright spring light through clean windows. Fresh flowers. Sparkling surfaces. Open windows. Spring renewal energy.",
};

const TRANSFORMATION_OVERRIDE = `Stylized split-panel illustration: LEFT PANEL shows a messy kitchen/living room (dishes piled, cluttered counters, dusty floors, muted gray tones). RIGHT PANEL shows the exact same space transformed — sparkling counters, gleaming floors, fresh flowers, PureTask blue accent elements, bright warm lighting. Clean graphic dividing line. Professional illustration style, not photo-realistic.`;

const PROOF_OVERRIDE = `Clean premium infographic on white background. PureTask blue (#0099FF) and white. Large bold numbers: "10,000+ Happy Clients", "4.9★ Average Rating", "98% Satisfaction Rate", "2,400+ Verified Cleaners", "50+ Cities". Minimal icons. No real people. Magazine-quality typography.`;

function buildPrompt(draft: any): string {
  const pillar = draft.pillar || '';
  const city = draft.city || '';
  if (pillar === 'Transformation') {
    return `${BRAND_PREFIX}\n\nSPECIAL INSTRUCTION: ${TRANSFORMATION_OVERRIDE}\n\nAdditional context: ${draft.image_prompt || ''}`;
  }
  if (pillar === 'Proof' && (!draft.image_prompt || draft.image_prompt.includes('infographic'))) {
    return `${BRAND_PREFIX}\n\nSPECIAL INSTRUCTION: ${PROOF_OVERRIDE}`;
  }
  const cityNote = city ? `IMPORTANT: The image must visually reference ${city} — show the city skyline, a recognizable landmark, or clearly reference the city with text overlay "PureTask — Now in ${city}".` : '';
  const pillarGuide = PILLAR_VISUAL_GUIDE[pillar] || '';
  return `${BRAND_PREFIX}\n\nPILLAR VISUAL GUIDANCE (${pillar}): ${pillarGuide}\n\n${cityNote}\n\nSPECIFIC IMAGE REQUEST: ${draft.image_prompt || `Clean, professional lifestyle image for PureTask ${pillar} content targeting ${draft.audience || 'homeowners'}.`}\n\nSTYLE: Bright, clean, modern, polished. Never dark or moody. Never cheesy stock photo feel.`;
}

async function generateSingleImage(draft: any, db: any): Promise<void> {
  const prompt = buildPrompt(draft);
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1792x1024',
        quality: 'hd',
        style: 'natural'
      })
    });
    const data = await res.json();
    if (data.data?.[0]?.url) {
      await db.ContentDraft.update(draft.id, {
        image_url: data.data[0].url
      });
      console.log(`[ImageGen] ✅ ${draft.title} (${draft.pillar})`);
    } else {
      console.log(`[ImageGen] ❌ ${draft.title}: ${data.error?.message || 'No image returned'}`);
    }
  } catch (e) {
    console.log(`[ImageGen] Error ${draft.title}: ${String(e)}`);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const body = await req.json().catch(() => ({}));
    const { batch_size = 4 } = body;

    // Fetch all drafts missing images
    const all = await db.ContentDraft.list();
    let drafts = all.filter((d: any) => {
      if (!d.image_prompt) return false;
      if (d.status === 'Rejected') return false;
      if (d.image_url) return false; // Skip if already has image
      return true;
    });

    // Prioritize: Transformation > Proof > Trust > Convenience > Local > Recruitment > Seniors > Spring
    const pillarPriority: Record<string, number> = {
      Transformation: 0,
      Proof: 1,
      Trust: 2,
      Convenience: 3,
      Local: 4,
      Recruitment: 5,
      Seniors: 6,
      Spring: 7
    };

    drafts.sort((a: any, b: any) => {
      const aPrio = pillarPriority[a.pillar] ?? 8;
      const bPrio = pillarPriority[b.pillar] ?? 8;
      return aPrio - bPrio;
    });

    drafts = drafts.slice(0, batch_size);

    if (drafts.length === 0) {
      console.log('[ImageGen] All drafts already have images — automation complete.');
      return Response.json({
        ok: true,
        message: 'All images complete — all drafts have image_url populated.',
        generated: 0,
        queued: 0
      });
    }

    console.log(`[ImageGen] Processing ${drafts.length} drafts asynchronously...`);

    // Fire-and-forget: queue all image generations without waiting for them to complete
    // This prevents timeout and returns immediately
    for (const draft of drafts) {
      // Stagger requests to respect DALL-E 3 rate limit (5 RPM = 1 req per 12 seconds)
      const delayMs = drafts.indexOf(draft) * 12000;
      setTimeout(() => generateSingleImage(draft, db), delayMs);
    }

    return Response.json({
      ok: true,
      message: `Queued ${drafts.length} images for async generation. Images will populate as they complete (12s per image).`,
      generated: 0,
      queued: drafts.length,
      drafts_queued: drafts.map(d => ({ id: d.id, title: d.title, pillar: d.pillar }))
    });

  } catch (error: any) {
    console.error('[ImageGen Error]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
