// PureTask Content Engine — GPT-4o + DALL-E 3
// Handles: daily content generation + automatic image generation per draft
import { base44 } from '@base44/core';

const BRAND_PREFIX = `Professional lifestyle photography for a home cleaning marketplace. Clean minimal aesthetic. White and light gray tones. Bright natural lighting. Aspirational magazine-quality. No text overlays. Modern home interiors. `;

const SYSTEM_PROMPT = `You are the PureTask content engine. PureTask is a trust-first home cleaning marketplace.

BRAND FACTS:
- Stats: 10K+ happy clients, 2,400+ verified cleaners, 4.9★ avg rating, 50+ cities, 98% satisfaction
- Differentiators: Escrow payment (released only on approval), GPS check-ins, before/after photo proof, annual background checks, Reliability Score 0-100, tier system Bronze→Platinum, cleaners keep 80-85%
- Taglines: "Cleaning you can actually trust." / "Pay Only When You're Happy."
- Voice: Direct, confident, trust-focused. Short punchy lines. No fluff. No hype.

PILLARS: Convenience | Trust | Transformation | Recruitment | Local | Proof
AUDIENCES: Busy Homeowners | Working Professionals | Families | Seniors | Cleaners / Gig Workers

RULES:
- All scores >= 7 (clarity, relatability, conversion)
- Hook grabs first line — Pain → Solution → Outcome
- CTA specific not generic
- Use real numbers (4.9★, 10K+, 98%, 2,400+)
- NO hype words, fake scarcity, guarantees
- X: under 280 chars | Instagram: max 5 hashtags | LinkedIn: story→insight→CTA | TikTok: POV/fast hook

OUTPUT: Valid JSON only. No markdown.`;

async function callGPT4o(messages: any[], key: string): Promise<any> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature: 0.85,
      max_tokens: 7000,
      response_format: { type: 'json_object' }
    })
  });
  const d = await res.json();
  if (!d.choices?.[0]?.message?.content) throw new Error(d.error?.message || 'GPT-4o failed');
  return JSON.parse(d.choices[0].message.content);
}

async function genImage(prompt: string, key: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: BRAND_PREFIX + prompt,
        n: 1, size: '1792x1024', quality: 'hd', style: 'natural'
      })
    });
    const d = await res.json();
    return d.data?.[0]?.url || null;
  } catch { return null; }
}

export default async function contentEngine(req: Request) {
  const body = await req.json().catch(() => ({}));
  const {
    mode = 'generate',       // 'generate' | 'images_only'
    count = 8,
    audience_override,
    pillar_override,
    week_tag,
    city = 'National',
    generate_images = true,
    draft_ids            // for images_only mode
  } = body;

  const KEY = Deno.env.get('OPENAI_API_KEY');
  if (!KEY) return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not set' }), { status: 500 });

  // ── IMAGES ONLY MODE ──
  if (mode === 'images_only') {
    let targets: any[] = [];
    if (draft_ids?.length) {
      for (const id of draft_ids) {
        const d = await base44.asServiceRole.entities.ContentDraft.get(id);
        if (d) targets.push(d);
      }
    } else {
      const all = await base44.asServiceRole.entities.ContentDraft.filter({ status: 'Pending Approval' });
      targets = all.filter((d: any) => d.image_prompt && !d.editor_notes?.includes('IMAGE_GENERATED')).slice(0, 5);
    }
    const results = [];
    for (const draft of targets) {
      await new Promise(r => setTimeout(r, 1500));
      const url = await genImage(draft.image_prompt, KEY);
      if (url) {
        await base44.asServiceRole.entities.ContentDraft.update(draft.id, {
          editor_notes: (draft.editor_notes || '') + `\nIMAGE_GENERATED: ${url}`
        });
        results.push({ id: draft.id, title: draft.title, image_url: url, success: true });
      } else {
        results.push({ id: draft.id, title: draft.title, success: false });
      }
    }
    return new Response(JSON.stringify({ mode: 'images_only', total: targets.length, success: results.filter(r=>r.success).length, results }));
  }

  // ── GENERATE MODE (GPT-4o + DALL-E) ──
  const weekNum = Math.ceil(new Date().getDate() / 7);
  const rotation = ['Busy Homeowners', 'Families', 'Working Professionals', 'Cleaners / Gig Workers'];
  const audience = audience_override || rotation[(weekNum - 1) % 4];
  const wTag = week_tag || `Week of ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  // Pillar gap detection
  let gapNote = '';
  try {
    const existing = await base44.asServiceRole.entities.ContentDraft.filter({ week_tag: wTag });
    const counts: Record<string,number> = { Convenience:0, Trust:0, Transformation:0, Recruitment:0, Local:0, Proof:0 };
    existing.forEach((d: any) => { if (d.pillar && counts[d.pillar] !== undefined) counts[d.pillar]++; });
    const gaps = Object.keys(counts).filter(p => counts[p] === 0);
    if (gaps.length) gapNote = `\nPRIORITIZE these uncovered pillars: ${gaps.join(', ')}`;
  } catch {}

  // WinnerDNA patterns
  let winnerNote = '';
  try {
    const winners = await base44.asServiceRole.entities.WinnerDNA.list({ limit: 5 });
    if (winners?.length) {
      winnerNote = `\nWINNING PATTERNS TO REPLICATE:\n` + winners.map((w: any) =>
        `- Hook: ${w.winning_hook_style} | Pillar: ${w.winning_pillar} | Trigger: ${w.emotional_trigger} | Platform: ${w.winning_platform}`
      ).join('\n');
    }
  } catch {}

  const prompt = `Generate exactly ${count} PureTask content drafts.

AUDIENCE FOCUS: ${audience} (60% of drafts)
PILLAR: ${pillar_override || 'Mix all 6, fill gaps first'}
WEEK: ${wTag} | CITY: ${city}
${gapNote}
${winnerNote}

Each draft object must contain ALL of these fields:
title, audience, pillar, hook, primary_caption, short_caption, long_caption,
cta_1, cta_2, cta_3, image_prompt, video_prompt, script_15sec, script_30sec,
comment_replies, platform_x, platform_instagram, platform_facebook,
platform_linkedin, platform_tiktok, platform_pinterest,
clarity_score (1-10), relatability_score (1-10), conversion_score (1-10)

Make every draft unique — vary hooks, angles, emotional triggers, formats.
Respond: {"drafts": [...${count} objects...]}`;

  let drafts: any[];
  try {
    const result = await callGPT4o([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ], KEY);
    drafts = result.drafts || result;
    if (!Array.isArray(drafts)) throw new Error('Not an array');
  } catch (e) {
    return new Response(JSON.stringify({ error: `Generation failed: ${String(e)}` }), { status: 500 });
  }

  const saved = [];
  const images = [];

  for (const draft of drafts) {
    const avg = ((draft.clarity_score||0) + (draft.relatability_score||0) + (draft.conversion_score||0)) / 3;
    if (avg < 7) continue;

    const record = await base44.asServiceRole.entities.ContentDraft.create({
      ...draft,
      week_tag: wTag,
      campaign_tag: `${audience} - ${draft.pillar}`,
      city,
      status: 'Pending Approval'
    });
    saved.push(record);

    if (generate_images && draft.image_prompt) {
      await new Promise(r => setTimeout(r, 1500));
      const imgUrl = await genImage(draft.image_prompt, KEY);
      if (imgUrl) {
        await base44.asServiceRole.entities.ContentDraft.update(record.id, {
          editor_notes: `IMAGE_GENERATED: ${imgUrl}`
        });
        images.push({ id: record.id, title: draft.title, image_url: imgUrl, success: true });
      } else {
        images.push({ id: record.id, title: draft.title, success: false });
      }
    }
  }

  return new Response(JSON.stringify({
    success: true,
    drafts_generated: saved.length,
    images_generated: images.filter(i=>i.success).length,
    audience_focus: audience,
    week_tag: wTag,
    drafts: saved.map(d => ({ id: d.id, title: d.title, pillar: d.pillar, audience: d.audience })),
    images
  }), { headers: { 'Content-Type': 'application/json' } });
}
