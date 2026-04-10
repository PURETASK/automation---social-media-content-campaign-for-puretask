// PureTask Content Engine — GPT-4o + DALL-E 3 — Rules v3.0
// Handles: daily content generation + automatic image generation per draft

import { base44 } from '@base44/core';

const BRAND_PREFIX = `Professional lifestyle photography for PureTask, a trust-first home cleaning marketplace. Clean minimal aesthetic. White and light gray tones. Bright PureTask blue (#0099FF) accents. Bright natural lighting. Aspirational magazine-quality. No text overlays. Modern home interiors. Real people, real spaces. `;

// ─────────────────────────────────────────────
// SYSTEM PROMPT — v3.0 STRICT RULES BAKED IN
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the PureTask AI content engine running in full autopilot mode.
PureTask is a trust-first home cleaning marketplace at https://www.puretask.co.

════════════════════════════════════════════════
LOCKED BRAND CONSTANTS — NEVER DEVIATE
════════════════════════════════════════════════
WEBSITE URL: https://www.puretask.co
- This EXACT URL must appear in EVERY caption on EVERY platform. No exceptions.
- NEVER use: puretask.com / www.puretask.com / puretask.co (without https://www.)
- Always write it as: https://www.puretask.co

EVERY POST MUST HAVE AN IMAGE OR VIDEO.
- Always write a detailed image_prompt and video_prompt — these are not optional.
- image_prompt must be specific enough to generate a real, branded, on-target image.

BRAND STATS (use these — do not invent numbers):
- 10,000+ happy clients
- 2,400+ verified cleaners
- 4.9★ average rating
- 98% satisfaction rate
- 50+ cities
- Average deep clean = 6 hours saved
- Cleaners keep 80–85% of every booking
- Competitor comparison: TaskRabbit takes ~30%, Handy takes ~35%

BRAND DIFFERENTIATORS (use these in copy):
- Escrow payment — credits held, released ONLY when client approves
- GPS check-ins — cleaner checks in/out via GPS, client gets notified
- Before/after photo proof — timestamped photos of every room, every job
- Background checks — criminal history, ID verification, sex offender registry, renewed annually
- Reliability Score — 0–100 score per cleaner based on real job data
- Tier system — Bronze → Silver → Gold → Platinum
- Credits system — 1 credit = $1 USD, unused credits never expire

BRAND VOICE: Direct. Confident. Trust-focused. Short punchy lines. No fluff.
NEVER USE: "insane", "unbelievable", "crazy", "amazing deal", fake scarcity, financial guarantees.

════════════════════════════════════════════════
CONTENT PILLARS & AUDIENCES
════════════════════════════════════════════════
PILLARS: Convenience | Trust | Transformation | Recruitment | Local | Proof
AUDIENCES: Busy Homeowners | Working Professionals | Families | Seniors | Cleaners / Gig Workers

════════════════════════════════════════════════
STRICT SCORING RUBRIC v3.0
Grade like a skeptical consumer, NOT a marketer. A 7 is genuinely hard to earn.
════════════════════════════════════════════════

CLARITY (1–10): Would a complete stranger instantly understand what PureTask is and what to do next?
- 9–10: Zero ambiguity. Message + CTA + URL crystal clear. Could stand alone with no context.
- 7–8: Clear message, obvious CTA, URL present. Minor polish needed.
- 5–6: Message understandable but CTA vague or URL missing.
- 3–4: Confusing, generic, or missing key info.
- 1–2: No one knows what this is for.

RELATABILITY (1–10): Would someone stop mid-scroll and say "that's literally me"?
- 9–10: Hyper-specific real pain point. Reader feels seen. Emotional resonance.
- 7–8: Clear audience targeting, recognizable scenario, feels personal.
- 5–6: Somewhat relatable but too broad. Could apply to anyone.
- 3–4: Generic "cleaning is hard" messaging. No specificity.
- 1–2: Talks at the audience, not to them.

CONVERSION POTENTIAL (1–10): Does this make someone click, book, or share RIGHT NOW?
- 9–10: Strong urgency + social proof (real stats) + direct CTA + URL. Irresistible.
- 7–8: At least 2 of: urgency, proof, direct CTA. Drives action.
- 5–6: Has a CTA but weak or missing proof/urgency.
- 3–4: Vague CTA ("learn more", "check us out"). No reason to act now.
- 1–2: No CTA. No reason to click.

AUTO-PENALTIES — apply these BEFORE setting final scores:
- No image or video concept provided → SUBTRACT 3 from conversion_score
- Missing https://www.puretask.co in any platform caption → SUBTRACT 2 from clarity_score
- City post with no city-specific visual in image_prompt → SUBTRACT 2 from relatability_score
- Generic hook ("Are you tired of cleaning?", "Cleaning can be hard") → SUBTRACT 2 from relatability_score
- Stats/proof missing when available → SUBTRACT 1 from conversion_score
- Same copy pasted across platforms (not adapted) → SUBTRACT 2 from clarity_score

APPROVAL THRESHOLDS (after penalties):
- Avg ≥ 7.5 → status: "Approved" — will be auto-posted
- Avg 5.0–7.4 → status: "Draft" — queued for rewrite
- Avg < 5.0 → status: "Rejected" — log reason in editor_notes

════════════════════════════════════════════════
HASHTAG REQUIREMENTS (mandatory minimums)
════════════════════════════════════════════════
Instagram / TikTok / Pinterest: 8–15 hashtags REQUIRED mixing:
- Brand: #PureTask #PureTaskCleaning
- Service: #HomeCleaning #HouseCleaning #ProfessionalCleaning #CleaningService #MaidService
- Audience-specific: #BusyMom #WorkingProfessional #HomeOwner #AirbnbHost (pick relevant ones)
- Local (if city post): #[City]Cleaning #[City]Homes #[City]Services
- Contextual/trending: #CleanHome #CleaningMotivation #HomeGoals #CleanTok

Facebook: 3–5 hashtags (lower priority, more natural)
LinkedIn: 3–5 professional hashtags: #HomeServices #MarketplacePlatform #TrustFirst #GigEconomy

════════════════════════════════════════════════
PLATFORM ADAPTATION RULES (every version must be unique)
════════════════════════════════════════════════
X/Twitter → Under 280 chars. Punchy. Hook + stat + URL. Include https://www.puretask.co
Instagram → Emotional, visual-first. 8–15 hashtags. First-person or POV. Include https://www.puretask.co
Facebook → Slightly longer, practical, community feel. 3–5 hashtags. Include https://www.puretask.co
LinkedIn → Story → insight → connection. Professional tone. No hashtag spam. Include https://www.puretask.co
TikTok → Fast hook in first 2 words. POV format or before/after. Include https://www.puretask.co
Pinterest → Aspirational. Keyword-rich title format. 8–12 hashtags. Include https://www.puretask.co

════════════════════════════════════════════════
CONTENT QUALITY CHECKLIST (all must pass before scoring ≥ 7.5)
════════════════════════════════════════════════
✓ Tied to a specific content pillar
✓ Written for a specific named audience
✓ Hook grabs in first line — specific, NOT generic
✓ Pain → Solution → Outcome structure
✓ Platform versions are genuinely different (not copy-pasted)
✓ CTA is specific: "Book in [City] → https://www.puretask.co" not "Learn more"
✓ Uses real numbers: 4.9★, 10K+, 98%, 2,400+, 6 hrs, 80–85%
✓ Does NOT use hype words or make guarantees
✓ https://www.puretask.co included in EVERY platform version
✓ Detailed image_prompt written (will be used for DALL-E 3 generation)
✓ City posts reference the specific city in image_prompt
✓ Hashtag minimums met per platform
✓ Scores are honest — do not inflate to hit threshold

OUTPUT: Valid JSON only. No markdown fences. No explanation text outside the JSON.`;

// ─────────────────────────────────────────────
// DRAFT SCHEMA DESCRIPTION FOR GPT
// ─────────────────────────────────────────────
const DRAFT_SCHEMA = `Each draft object must contain ALL fields:
{
  "title": "Short descriptive title (include city if local)",
  "audience": "one of: Busy Homeowners | Working Professionals | Families | Seniors | Cleaners / Gig Workers",
  "pillar": "one of: Convenience | Trust | Transformation | Recruitment | Local | Proof",
  "hook": "First line scroll-stopper — specific, not generic",
  "primary_caption": "2–3 sentence main caption with https://www.puretask.co",
  "short_caption": "Under 180 chars for X/Twitter with https://www.puretask.co",
  "long_caption": "4–6 sentence full version with https://www.puretask.co",
  "cta_1": "Primary CTA — specific with city if possible, ends with https://www.puretask.co",
  "cta_2": "Secondary CTA with https://www.puretask.co",
  "cta_3": "Soft CTA (save/share) with https://www.puretask.co",
  "image_prompt": "DETAILED DALL-E 3 prompt — specific scene, people, lighting, composition, mood, PureTask blue (#0099FF) accents. City posts MUST mention the city name visually in the prompt.",
  "video_prompt": "Kling AI video concept — opening scene, movement, emotional arc, text overlays, CTA",
  "script_15sec": "15-second voiceover script with https://www.puretask.co at end",
  "script_30sec": "30-second voiceover script with https://www.puretask.co at end",
  "comment_replies": "3 Q&A pairs for common objections, separated by |",
  "platform_x": "X/Twitter — under 280 chars, punchy, includes https://www.puretask.co",
  "platform_instagram": "Instagram — emotional, 8–15 hashtags, includes https://www.puretask.co",
  "platform_facebook": "Facebook — practical, 3–5 hashtags, includes https://www.puretask.co",
  "platform_linkedin": "LinkedIn — story→insight→connection, 3–5 pro hashtags, includes https://www.puretask.co",
  "platform_tiktok": "TikTok/Reels — fast hook, POV format, includes https://www.puretask.co",
  "platform_pinterest": "Pinterest — aspirational, 8–12 hashtags, includes https://www.puretask.co",
  "clarity_score": number after applying penalties,
  "relatability_score": number after applying penalties,
  "conversion_score": number after applying penalties,
  "editor_notes": "Brief honest reason for score — what's strong, what could improve"
}`;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
async function callGPT4o(messages: any[], key: string): Promise<any> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature: 0.85,
      max_tokens: 8000,
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
        n: 1,
        size: '1792x1024',
        quality: 'hd',
        style: 'natural'
      })
    });
    const d = await res.json();
    return d.data?.[0]?.url || null;
  } catch { return null; }
}

function calcAvg(draft: any): number {
  const c = Number(draft.clarity_score) || 0;
  const r = Number(draft.relatability_score) || 0;
  const v = Number(draft.conversion_score) || 0;
  return Math.round(((c + r + v) / 3) * 100) / 100;
}

function calcStatus(avg: number): string {
  if (avg >= 7.5) return 'Approved';
  if (avg >= 5.0) return 'Draft';
  return 'Rejected';
}

// ─────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────
export default async function contentEngine(req: Request) {
  const body = await req.json().catch(() => ({}));
  const {
    mode = 'generate',
    count = 8,
    audience_override,
    pillar_override,
    week_tag,
    city = 'National',
    generate_images = true,
    draft_ids
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
      const all = await base44.asServiceRole.entities.ContentDraft.filter({ status: 'Approved' });
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
    return new Response(JSON.stringify({ mode: 'images_only', total: targets.length, success: results.filter(r => r.success).length, results }));
  }

  // ── GENERATE MODE ──
  const weekNum = Math.ceil(new Date().getDate() / 7);
  const rotation = ['Busy Homeowners', 'Families', 'Working Professionals', 'Cleaners / Gig Workers'];
  const audience = audience_override || rotation[(weekNum - 1) % 4];
  const wTag = week_tag || `Week of ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  // Pillar gap detection
  let gapNote = '';
  try {
    const existing = await base44.asServiceRole.entities.ContentDraft.filter({ week_tag: wTag });
    const counts: Record<string, number> = { Convenience: 0, Trust: 0, Transformation: 0, Recruitment: 0, Local: 0, Proof: 0 };
    existing.forEach((d: any) => { if (d.pillar && counts[d.pillar] !== undefined) counts[d.pillar]++; });
    const gaps = Object.keys(counts).filter(p => counts[p] === 0);
    if (gaps.length) gapNote = `\nPRIORITIZE these uncovered pillars this batch: ${gaps.join(', ')}`;
  } catch {}

  // WinnerDNA patterns
  let winnerNote = '';
  try {
    const winners = await base44.asServiceRole.entities.WinnerDNA.list({ limit: 5 });
    if (winners?.length) {
      winnerNote = `\nWINNING PATTERNS TO REPLICATE:\n` + winners.map((w: any) =>
        `- Hook style: ${w.winning_hook_style} | Pillar: ${w.winning_pillar} | Trigger: ${w.emotional_trigger} | Best platform: ${w.winning_platform}`
      ).join('\n');
    }
  } catch {}

  const userPrompt = `Generate exactly ${count} PureTask content drafts following all v3.0 rules.

AUDIENCE FOCUS: ${audience} (at least 60% of drafts)
PILLAR FOCUS: ${pillar_override || 'Mix all 6 pillars — fill gaps first'}
WEEK: ${wTag}
CITY: ${city}
${gapNote}
${winnerNote}

SCHEMA FOR EACH DRAFT:
${DRAFT_SCHEMA}

REMINDERS:
- https://www.puretask.co in EVERY platform caption — no exceptions
- 8–15 hashtags on Instagram/TikTok/Pinterest
- Score honestly using the strict rubric — do not inflate to hit 7.5
- image_prompt must be a full DALL-E 3 generation prompt (not just a description)
- Every draft must have a unique hook — no repeating angles
- City posts must name the city in the image_prompt

Respond with: {"drafts": [... ${count} objects ...]}`;

  let drafts: any[];
  try {
    const result = await callGPT4o([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ], KEY);
    drafts = result.drafts || result;
    if (!Array.isArray(drafts)) throw new Error('Not an array');
  } catch (e) {
    return new Response(JSON.stringify({ error: `Generation failed: ${String(e)}` }), { status: 500 });
  }

  const saved = [];
  const rejected = [];
  const images = [];

  for (const draft of drafts) {
    const avg = calcAvg(draft);
    const status = calcStatus(avg);

    // Hard reject below 5
    if (avg < 5) {
      rejected.push({ title: draft.title, avg, reason: draft.editor_notes || 'Score below 5.0' });
      continue;
    }

    const record = await base44.asServiceRole.entities.ContentDraft.create({
      title: draft.title,
      audience: draft.audience,
      pillar: draft.pillar,
      hook: draft.hook,
      primary_caption: draft.primary_caption,
      short_caption: draft.short_caption,
      long_caption: draft.long_caption,
      cta_1: draft.cta_1,
      cta_2: draft.cta_2,
      cta_3: draft.cta_3,
      image_prompt: draft.image_prompt,
      video_prompt: draft.video_prompt,
      script_15sec: draft.script_15sec,
      script_30sec: draft.script_30sec,
      comment_replies: draft.comment_replies,
      platform_x: draft.platform_x,
      platform_instagram: draft.platform_instagram,
      platform_facebook: draft.platform_facebook,
      platform_linkedin: draft.platform_linkedin,
      platform_tiktok: draft.platform_tiktok,
      platform_pinterest: draft.platform_pinterest,
      clarity_score: draft.clarity_score,
      relatability_score: draft.relatability_score,
      conversion_score: draft.conversion_score,
      avg_performance_score: avg,
      editor_notes: draft.editor_notes || '',
      week_tag: wTag,
      campaign_tag: `${audience} - ${draft.pillar}`,
      city,
      status,
      posted_platforms: '[]',
      is_winner: false
    });

    saved.push({ ...record, avg, status });

    // Generate image for approved drafts
    if (generate_images && draft.image_prompt && status === 'Approved') {
      await new Promise(r => setTimeout(r, 1500));
      const imgUrl = await genImage(draft.image_prompt, KEY);
      if (imgUrl) {
        await base44.asServiceRole.entities.ContentDraft.update(record.id, {
          editor_notes: (record.editor_notes || '') + `\nIMAGE_GENERATED: ${imgUrl}`
        });
        images.push({ id: record.id, title: draft.title, image_url: imgUrl, success: true });
      } else {
        images.push({ id: record.id, title: draft.title, success: false });
      }
    }
  }

  const approved = saved.filter(d => d.status === 'Approved');
  const draftsOnly = saved.filter(d => d.status === 'Draft');

  return new Response(JSON.stringify({
    success: true,
    total_generated: saved.length,
    approved: approved.length,
    drafts_saved: draftsOnly.length,
    rejected: rejected.length,
    images_generated: images.filter(i => i.success).length,
    audience_focus: audience,
    week_tag: wTag,
    results: saved.map(d => ({
      id: d.id,
      title: d.title,
      pillar: d.pillar,
      audience: d.audience,
      avg_score: d.avg,
      status: d.status
    })),
    rejected_drafts: rejected
  }), { headers: { 'Content-Type': 'application/json' } });
}
