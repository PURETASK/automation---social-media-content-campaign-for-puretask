// PureTask Image Generation Pipeline v2.1
// OPTIMIZED: Parallel image generation with 2-request concurrent limit
// Processes in batches of 4, 50s timeout per batch (12.5s per image)
// Transformation and Proof pillars first, then by status priority

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
    return `${BRAND_PREFIX}\n\nSPECIAL: ${TRANSFORMATION_OVERRIDE}\n\nAdditional: ${draft.image_prompt || ''}`;
  }
  
  if (pillar === 'Proof' && (!draft.image_prompt || draft.image_prompt.includes('infographic'))) {
    return `${BRAND_PREFIX}\n\nSPECIAL: ${PROOF_OVERRIDE}`;
  }
  
  const cityNote = city ? `IMPORTANT: Must visually reference ${city} — skyline, landmark, or city name text overlay "PureTask — Now in ${city}".` : '';
  const pillarGuide = PILLAR_VISUAL_GUIDE[pillar] || '';
  
  return `${BRAND_PREFIX}\n\nPILLAR VISUAL (${pillar}): ${pillarGuide}\n\n${cityNote}\n\nSPECIFIC REQUEST: ${draft.image_prompt || `Clean professional lifestyle image for PureTask ${pillar} content targeting ${draft.audience || 'homeowners'}.`}\n\nSTYLE: Bright, clean, modern, polished. Never dark or moody.`;
}

async function genImage(prompt: string, size: string = '1792x1024'): Promise<{ url: string; revised?: string } | { error: string }> {
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
    if (data.data?.[0]?.url) {
      return { url: data.data[0].url, revised: data.data[0].revised_prompt };
    }
    return { error: data.error?.message || 'No image returned' };
  } catch (e: any) {
    return { error: e.message };
  }
}

// Rate limiter: max 2 concurrent requests (conservative for DALL-E 3)
async function generateConcurrent(drafts: any[]): Promise<any[]> {
  const results: any[] = [];
  const concurrencyLimit = 2;
  const queue = [...drafts];
  let inFlight = 0;

  return new Promise((resolve) => {
    const processNext = async () => {
      if (queue.length === 0 && inFlight === 0) {
        resolve(results);
        return;
      }

      while (inFlight < concurrencyLimit && queue.length > 0) {
        inFlight++;
        const draft = queue.shift()!;
        const prompt = buildPrompt(draft);

        (async () => {
          try {
            const result = await genImage(prompt);
            if ('url' in result) {
              results.push({ draft_id: draft.id, title: draft.title, pillar: draft.pillar, success: true, image_url: result.url });
            } else {
              results.push({ draft_id: draft.id, title: draft.title, pillar: draft.pillar, success: false, error: result.error });
            }
          } catch (e) {
            results.push({ draft_id: draft.id, title: draft.title, pillar: draft.pillar, success: false, error: String(e) });
          }
          inFlight--;
          processNext();
        })();
      }
    };

    processNext();
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const body = await req.json().catch(() => ({}));
    const { 
      draft_ids,
      batch_size = 4,
      pillar_filter,
      force_regenerate = false,
      size = '1792x1024'
    } = body;

    let drafts: any[] = [];

    if (draft_ids && Array.isArray(draft_ids) && draft_ids.length > 0) {
      for (const id of draft_ids) {
        const d = await db.ContentDraft.get(id);
        if (d) drafts.push(d);
      }
    } else {
      const all = await db.ContentDraft.list();
      
      drafts = all.filter((d: any) => {
        if (!d.image_prompt) return false;
        if (d.status === 'Rejected') return false;
        if (d.image_url && !force_regenerate) return false;
        if (pillar_filter && d.pillar !== pillar_filter) return false;
        return true;
      });

      // Priority sort: Transformation > Proof > Trust > Convenience > Local > Recruitment > Seniors > Spring
      drafts.sort((a: any, b: any) => {
        const statusPriority: Record<string, number> = { Approved: 0, Draft: 1 };
        const pillarPriority: Record<string, number> = { 
          Transformation: 0, Proof: 1, Trust: 2, Convenience: 3, Local: 4, Recruitment: 5, Seniors: 6, Spring: 7 
        };
        const sPriority = (statusPriority[a.status] ?? 2) - (statusPriority[b.status] ?? 2);
        if (sPriority !== 0) return sPriority;
        return (pillarPriority[a.pillar] ?? 8) - (pillarPriority[b.pillar] ?? 8);
      });

      drafts = drafts.slice(0, batch_size);
    }

    if (drafts.length === 0) {
      return Response.json({ 
        ok: true, 
        message: 'All drafts already have images — nothing to generate.',
        generated: 0,
        total_processed: 0
      });
    }

    console.log(`[ImageGen] Processing ${drafts.length} drafts (batch_size=${batch_size})...`);

    // Generate in parallel with 2 concurrent limit
    const results = await generateConcurrent(drafts);

    // Update database with successful images
    const succeeded: any[] = [];
    const failed: any[] = [];

    for (const result of results) {
      if (result.success) {
        await db.ContentDraft.update(result.draft_id, {
          image_url: result.image_url
        });
        succeeded.push(result);
        console.log(`[ImageGen] ✅ ${result.title}`);
      } else {
        failed.push(result);
        console.log(`[ImageGen] ❌ ${result.title}: ${result.error}`);
      }
    }

    const summary = {
      ok: true,
      generated: succeeded.length,
      failed: failed.length,
      total_processed: drafts.length,
      results: { succeeded, failed }
    };

    // If all succeeded, this batch is done
    if (failed.length === 0 && drafts.length < batch_size) {
      summary.message = 'Batch complete. Check for remaining drafts on next run.';
    }

    return Response.json(summary);

  } catch (error: any) {
    console.error('[ImageGen Error]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
