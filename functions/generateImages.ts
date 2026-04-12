// PureTask Image Generation Pipeline v3.0
// TWO MODES:
// 1. Called directly as a standalone function (backfill / manual runs)
// 2. Exported as generateImageForDraft() — imported by ALL content generators
//    so every draft gets an image AT CREATION TIME, not as an afterthought.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');

// ─── BRAND PREFIX injected into every prompt ───────────────────────────────
const BRAND_PREFIX = `Magazine-quality lifestyle photography for PureTask, a premium home cleaning marketplace. 
Clean minimal aesthetic. Bright natural lighting. PureTask blue (#0099FF) accent elements present. 
White and light gray dominant tones. Real people, real spaces. Aspirational but authentic. 
No text overlays unless specified. No clutter. No dark moody tones. No stock photo feel.`;

// ─── Pillar-specific visual guidance ───────────────────────────────────────
export const PILLAR_VISUAL_GUIDE: Record<string, string> = {
  Convenience: "Focus on ease, relief, time reclaimed. People enjoying free time in a spotlessly clean home.",
  Trust: "Professional cleaners looking confident and trustworthy. Uniforms, badges, GPS phones. Bright open spaces.",
  Transformation: "Stylized split-panel: LEFT = messy/cluttered muted tones. RIGHT = spotless/gleaming warm bright tones. Professional illustration style.",
  Recruitment: "Empowered confident professional cleaners. NOT servile or sad. Arms crossed, smiling, proud. Bright modern space.",
  Local: "Recognizable city visual — skyline, landmark, neighborhood. Combined with clean modern home interior.",
  Proof: "Clean premium infographic. PureTask blue (#0099FF). Bold stats: 10,000+ clients, 4.9★, 98% satisfaction, 2,400+ cleaners.",
  Seniors: "Warm intergenerational scene — adult children with parents OR dignified senior in familiar clean home. Warm lighting. NOT frail.",
  Spring: "Bright spring light through open windows. Fresh flowers on counters. Sparkling surfaces. Spring renewal energy.",
};

// ─── Special overrides for pillars with no real photos yet ─────────────────
const TRANSFORMATION_OVERRIDE = `Stylized split-panel illustration: 
LEFT PANEL — messy kitchen or living room: dishes piled, cluttered counters, dusty floors, muted gray-blue tones, dim light. 
RIGHT PANEL — the exact same space transformed: sparkling counters, gleaming floors, fresh flowers in a vase, PureTask blue (#0099FF) accent visible, bright warm natural light streaming in. 
Clean graphic dividing line between panels. Professional illustration style — NOT photo-realistic. Polished, premium feel.`;

const PROOF_OVERRIDE = `Clean premium infographic design on pure white background. 
PureTask blue (#0099FF) and white color palette. Large bold typography. 
Key stats displayed prominently: "10,000+ Happy Clients" · "4.9★ Average Rating" · "98% Satisfaction Rate" · "2,400+ Verified Cleaners" · "50+ Cities". 
Minimal geometric icons. No real people. Data visualization style. Magazine-quality layout.`;

// ─── Build final DALL-E prompt from draft data ─────────────────────────────
export function buildImagePrompt(draft: { pillar?: string; city?: string; image_prompt?: string; audience?: string }): string {
  const pillar = draft.pillar || '';
  const city = draft.city || '';

  if (pillar === 'Transformation') {
    return `${BRAND_PREFIX}\n\nSPECIAL VISUAL INSTRUCTION:\n${TRANSFORMATION_OVERRIDE}\n\nAdditional context: ${draft.image_prompt || ''}`;
  }

  if (pillar === 'Proof' && (!draft.image_prompt || draft.image_prompt.toLowerCase().includes('infographic') || draft.image_prompt.toLowerCase().includes('stats'))) {
    return `${BRAND_PREFIX}\n\nSPECIAL VISUAL INSTRUCTION:\n${PROOF_OVERRIDE}`;
  }

  const cityNote = city
    ? `CRITICAL: This image MUST visually reference ${city}. Show the ${city} skyline, a recognizable ${city} landmark, or include a clear text overlay: "PureTask — Now in ${city}". The city must be instantly recognizable.`
    : '';

  const pillarGuide = PILLAR_VISUAL_GUIDE[pillar] || '';

  const specificPrompt = draft.image_prompt
    ? `SPECIFIC IMAGE REQUEST: ${draft.image_prompt}`
    : `Clean professional lifestyle image for PureTask ${pillar} content targeting ${draft.audience || 'homeowners'}.`;

  return `${BRAND_PREFIX}

PILLAR VISUAL DIRECTION (${pillar}): ${pillarGuide}

${cityNote}

${specificPrompt}

STYLE RULES: Bright, clean, modern, polished. Never dark or moody. Never cheesy stock photo energy.`;
}

// ─── Core DALL-E 3 API call ─────────────────────────────────────────────────
export async function generateDalleImage(prompt: string, size: string = '1792x1024'): Promise<string | null> {
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size,
        quality: 'hd',
        style: 'natural'
      })
    });
    const data = await res.json();
    if (data.data?.[0]?.url) return data.data[0].url;
    console.error('[ImageGen] DALL-E error:', data.error?.message || JSON.stringify(data));
    return null;
  } catch (e: any) {
    console.error('[ImageGen] Fetch error:', e.message);
    return null;
  }
}

// ─── THE KEY EXPORT: called inline by every content generator ───────────────
// Usage in any generator:
//   import { generateImageForDraft } from './generateImages.ts';
//   const image_url = await generateImageForDraft(draft);
//   await db.ContentDraft.create({ ...draft, image_url });
//
// Rate limit: DALL-E 3 = 5 RPM on standard tier.
// When generating multiple drafts per call, wait 12s between each image.
export async function generateImageForDraft(
  draft: { pillar?: string; city?: string; image_prompt?: string; audience?: string },
  size: string = '1792x1024'
): Promise<string | null> {
  const prompt = buildImagePrompt(draft);
  const url = await generateDalleImage(prompt, size);
  if (url) {
    console.log(`[ImageGen] ✅ Generated image for ${draft.pillar || 'unknown'} draft`);
  } else {
    console.log(`[ImageGen] ❌ Failed to generate image for ${draft.pillar || 'unknown'} draft`);
  }
  return url;
}

// ─── STANDALONE MODE: backfill drafts missing image_url ────────────────────
// This is now a safety net only — not the primary path.
// Primary path = generateImageForDraft() called at creation time.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const body = await req.json().catch(() => ({}));
    const {
      draft_ids,
      batch_size = 8,
      pillar_filter,
      force_regenerate = false,
      size = '1792x1024'
    } = body;

    let drafts: any[] = [];

    if (draft_ids?.length) {
      for (const id of draft_ids) {
        const d = await db.ContentDraft.get(id);
        if (d) drafts.push(d);
      }
    } else {
      const all = await db.ContentDraft.list();
      drafts = all
        .filter((d: any) => {
          if (!d.image_prompt) return false;
          if (d.status === 'Rejected') return false;
          if (d.image_url && !force_regenerate) return false;
          if (pillar_filter && d.pillar !== pillar_filter) return false;
          return true;
        })
        .sort((a: any, b: any) => {
          const sp: Record<string, number> = { Approved: 0, Draft: 1 };
          const pp: Record<string, number> = { Transformation: 0, Proof: 1, Trust: 2, Convenience: 3, Local: 4, Recruitment: 5, Seniors: 6, Spring: 7 };
          const s = (sp[a.status] ?? 2) - (sp[b.status] ?? 2);
          return s !== 0 ? s : (pp[a.pillar] ?? 8) - (pp[b.pillar] ?? 8);
        })
        .slice(0, batch_size);
    }

    if (!drafts.length) {
      return Response.json({ ok: true, message: 'All drafts already have images — nothing to backfill.', generated: 0 });
    }

    console.log(`[ImageGen Backfill] Processing ${drafts.length} drafts...`);
    const results: any[] = [];

    for (const draft of drafts) {
      const url = await generateImageForDraft(draft, size);

      if (url) {
        await db.ContentDraft.update(draft.id, { image_url: url });
        results.push({ id: draft.id, title: draft.title, pillar: draft.pillar, success: true, image_url: url });
      } else {
        results.push({ id: draft.id, title: draft.title, pillar: draft.pillar, success: false });
      }

      // DALL-E 3 rate limit: 5 RPM = wait 12s between requests
      await new Promise(r => setTimeout(r, 12000));
    }

    const succeeded = results.filter(r => r.success).length;
    return Response.json({
      ok: true,
      generated: succeeded,
      failed: results.length - succeeded,
      total_processed: drafts.length,
      results
    });

  } catch (error: any) {
    console.error('[ImageGen Error]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
