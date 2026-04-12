// PureTask Image Generation Pipeline v2.0
// FIXES: wrong status filter, image stored in editor_notes not image_url, wrong SDK
// Runs on ALL approved drafts missing image_url
// DALL-E 3 HD — branded, pillar-aware, platform-optimized

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');

// Brand prefix injected into EVERY prompt
const BRAND_PREFIX = `Magazine-quality lifestyle photography for PureTask, a premium home cleaning marketplace. 
Clean minimal aesthetic. Bright natural lighting. PureTask blue (#0099FF) accent elements present. 
White and light gray dominant tones. Real people, real spaces. Aspirational but authentic. 
No text overlays unless specified. No clutter. No dark moody tones. No stock photo feel.`;

// Pillar-specific visual guidance to improve prompt quality
const PILLAR_VISUAL_GUIDE: Record<string, string> = {
  Convenience: "Focus on ease, relief, and time reclaimed. Show people enjoying their free time in a spotlessly clean home.",
  Trust: "Show professional cleaners looking confident and trustworthy. Uniforms, badges, GPS phones. Bright open spaces.",
  Transformation: "Show dramatic before/after contrast. Left side: messy/dirty. Right side: spotless/gleaming. Split composition.",
  Recruitment: "Show empowered, confident professional cleaners. NOT servile or sad. Arms crossed, smiling, proud of their work.",
  Local: "Include recognizable city visual — skyline, landmark, neighborhood feel. Combine with clean modern home interior.",
  Proof: "Show infographic-style stats, star ratings, happy client testimonials. Clean data visualization with PureTask blue.",
  Seniors: "Show warm intergenerational scenes. Adult children booking for elderly parents. Safe, familiar home environment. Warm lighting.",
  Spring: "Bright spring light streaming through clean windows. Fresh flowers on counters. Sparkling surfaces. Open windows.",
};

// Transformation-specific: since PureTask has no real before/after photos yet,
// use illustrated/stylized split compositions instead of photo-realistic
const TRANSFORMATION_OVERRIDE = `Stylized split-panel illustration: LEFT PANEL shows a messy kitchen/living room 
(dishes piled, cluttered counters, dusty floors, muted gray tones). RIGHT PANEL shows the exact same space 
transformed — sparkling counters, gleaming floors, fresh flowers, PureTask blue accent elements visible, 
bright warm lighting. Clean graphic dividing line between panels. Professional illustration style, not photo-realistic.`;

// Proof-specific: use stats-forward graphic design since we don't have real client photos
const PROOF_OVERRIDE = `Clean, premium infographic design on white background. PureTask blue (#0099FF) and white color scheme. 
Large bold numbers: "10,000+ Happy Clients", "4.9★ Average Rating", "98% Satisfaction Rate", "2,400+ Verified Cleaners", "50+ Cities". 
Minimal icons. No real people. Data visualization style. Magazine-quality typography.`;

function buildPrompt(draft: any): string {
  const pillar = draft.pillar || '';
  const city = draft.city || '';
  
  // Use override for problem pillars
  if (pillar === 'Transformation') {
    return `${BRAND_PREFIX}\n\nSPECIAL INSTRUCTION: ${TRANSFORMATION_OVERRIDE}\n\nAdditional context: ${draft.image_prompt || ''}`;
  }
  
  if (pillar === 'Proof' && (!draft.image_prompt || draft.image_prompt.includes('infographic'))) {
    return `${BRAND_PREFIX}\n\nSPECIAL INSTRUCTION: ${PROOF_OVERRIDE}`;
  }
  
  // City posts: enforce city visual
  const cityNote = city ? `IMPORTANT: The image must visually reference ${city} — show the city skyline, a recognizable landmark, or clearly reference the city with text overlay "PureTask — Now in ${city}".` : '';
  
  const pillarGuide = PILLAR_VISUAL_GUIDE[pillar] || '';
  
  return `${BRAND_PREFIX}

PILLAR VISUAL GUIDANCE (${pillar}): ${pillarGuide}

${cityNote}

SPECIFIC IMAGE REQUEST: ${draft.image_prompt || `Clean, professional lifestyle image for PureTask ${pillar} content targeting ${draft.audience || 'homeowners'}.`}

STYLE: Bright, clean, modern, polished. Never dark or moody. Never cheesy stock photo feel.`;
}

async function generateSingleImage(prompt: string, size: string = '1792x1024'): Promise<{ url: string } | { error: string }> {
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
        size: size,
        quality: 'hd',
        style: 'natural'
      })
    });
    const data = await res.json();
    if (data.data?.[0]?.url) return { url: data.data[0].url };
    return { error: data.error?.message || 'No image returned' };
  } catch (e: any) {
    return { error: e.message };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const body = await req.json().catch(() => ({}));
    const { 
      draft_ids,           // specific IDs to generate for
      batch_size = 10,     // how many to process per run
      pillar_filter,       // only generate for specific pillar
      force_regenerate = false, // regenerate even if image_url exists
      size = '1792x1024'   // DALL-E 3 size
    } = body;

    let drafts: any[] = [];

    if (draft_ids && Array.isArray(draft_ids) && draft_ids.length > 0) {
      // Specific IDs requested
      for (const id of draft_ids) {
        const d = await db.ContentDraft.get(id);
        if (d) drafts.push(d);
      }
    } else {
      // Auto-mode: find all drafts missing images
      const all = await db.ContentDraft.list();
      
      drafts = all.filter((d: any) => {
        // Must have an image_prompt
        if (!d.image_prompt) return false;
        // Must be Approved or Draft status (not Rejected)
        if (d.status === 'Rejected') return false;
        // Skip if already has image_url (unless force)
        if (d.image_url && !force_regenerate) return false;
        // Pillar filter if specified
        if (pillar_filter && d.pillar !== pillar_filter) return false;
        return true;
      });

      // Prioritize: Approved first, then by pillar (Transformation + Proof first since they need special handling)
      drafts.sort((a: any, b: any) => {
        const statusPriority: Record<string, number> = { Approved: 0, Draft: 1 };
        const pillarPriority: Record<string, number> = { Transformation: 0, Proof: 1, Trust: 2, Convenience: 3, Local: 4, Recruitment: 5, Seniors: 6, Spring: 7 };
        const sPriority = (statusPriority[a.status] ?? 2) - (statusPriority[b.status] ?? 2);
        if (sPriority !== 0) return sPriority;
        return (pillarPriority[a.pillar] ?? 8) - (pillarPriority[b.pillar] ?? 8);
      });

      drafts = drafts.slice(0, batch_size);
    }

    if (drafts.length === 0) {
      return Response.json({ ok: true, message: 'All drafts already have images — nothing to generate.', generated: 0 });
    }

    console.log(`[ImageGen] Processing ${drafts.length} drafts...`);
    const results: any[] = [];

    for (const draft of drafts) {
      const prompt = buildPrompt(draft);
      console.log(`[ImageGen] Generating: "${draft.title}" (${draft.pillar})...`);

      const result = await generateSingleImage(prompt, size);

      if ('url' in result) {
        // ✅ FIX: Store in image_url field, not editor_notes
        await db.ContentDraft.update(draft.id, {
          image_url: result.url
        });
        results.push({ id: draft.id, title: draft.title, pillar: draft.pillar, success: true, image_url: result.url });
        console.log(`[ImageGen] ✅ ${draft.title}`);
      } else {
        results.push({ id: draft.id, title: draft.title, pillar: draft.pillar, success: false, error: result.error });
        console.log(`[ImageGen] ❌ ${draft.title}: ${result.error}`);
      }

      // DALL-E 3 rate limit: 5 RPM on standard tier — wait 12s between requests
      await new Promise(r => setTimeout(r, 12000));
    }

    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return Response.json({
      ok: true,
      generated: succeeded,
      failed,
      total_processed: drafts.length,
      results
    });

  } catch (error: any) {
    console.error('[ImageGen Error]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
