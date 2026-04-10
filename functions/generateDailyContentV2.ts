// PureTask Content Engine — FULL AUTOPILOT v3.0 RULES
// Auto-generates → Auto-scores → Auto-approves → Auto-posts
// Nathan delegates ALL content decisions to the AI.

import { base44 } from '@base44/core';

const BRAND_PREFIX = `Professional lifestyle photography for PureTask, a trust-first home cleaning marketplace. Clean minimal aesthetic. White and light gray tones. Bright PureTask blue (#0099FF) accents. Bright natural lighting. Aspirational magazine-quality. No text overlays. Modern home interiors. Real people, real spaces. `;

// ─────────────────────────────────────────────
// SYSTEM PROMPT — v3.0 FULL RULES BAKED IN
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
- Always write a detailed, specific image_prompt and video_prompt. These are not optional.
- image_prompt must be specific enough to produce a real branded DALL-E 3 image.
- City posts: image_prompt MUST visually reference the city (skyline, landmark, or city name text).

BRAND STATS (use only these — never invent numbers):
- 10,000+ happy clients
- 2,400+ verified cleaners
- 4.9★ average rating
- 98% satisfaction rate
- 50+ cities
- Average deep clean = 6 hours saved per visit
- Cleaners keep 80–85% of every booking
- Competitor comparison: TaskRabbit takes ~30%, Handy takes ~35%

BRAND DIFFERENTIATORS (weave these into copy):
- Escrow payment — credits held, released ONLY when client approves the job
- GPS check-ins — cleaner checks in/out via GPS, client gets notified in real time
- Before/after photo proof — timestamped photos of every room, every single job
- Background checks — criminal history, ID verification, sex offender registry, renewed annually
- Reliability Score — 0–100 score per cleaner based on real job history
- Tier system — Bronze → Silver → Gold → Platinum (better score = better jobs)
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
Grade like a skeptical consumer scrolling their feed — NOT like a marketer.
A 7 is genuinely hard to earn. Score honestly.
════════════════════════════════════════════════

CLARITY (1–10): Would a complete stranger instantly understand what PureTask is and exactly what to do?
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
- 1–2: Talks AT the audience, not TO them.

CONVERSION POTENTIAL (1–10): Does this make someone click, book, or share RIGHT NOW?
- 9–10: Strong urgency + social proof (real stats) + direct CTA + URL. Irresistible.
- 7–8: At least 2 of: urgency, proof, direct CTA. Drives action.
- 5–6: Has a CTA but weak or missing proof/urgency.
- 3–4: Vague CTA ("learn more", "check us out"). No reason to act now.
- 1–2: No CTA. No reason to click.

AUTO-PENALTIES — apply BEFORE setting final scores:
- No image_prompt or video_prompt provided → SUBTRACT 3 from conversion_score
- Missing https://www.puretask.co in ANY platform caption → SUBTRACT 2 from clarity_score
- City post with no city-specific visual in image_prompt → SUBTRACT 2 from relatability_score
- Generic hook ("Are you tired of cleaning?", "Cleaning is hard") → SUBTRACT 2 from relatability_score
- Real stats available but not used → SUBTRACT 1 from conversion_score
- Same copy copy-pasted across platforms (not adapted) → SUBTRACT 2 from clarity_score
- Instagram/TikTok/Pinterest has fewer than 8 hashtags → SUBTRACT 1 from conversion_score

APPROVAL THRESHOLDS (after all penalties applied):
- Avg ≥ 7.5 → status "Approved" — will be auto-posted
- Avg 5.0–7.4 → status "Draft" — queued for rewrite next cycle
- Avg < 5.0 → status "Rejected" — reason logged in editor_notes

════════════════════════════════════════════════
HASHTAG REQUIREMENTS (mandatory minimums)
════════════════════════════════════════════════
Instagram / TikTok / Pinterest: 8–15 hashtags REQUIRED — mixing:
  Brand: #PureTask #PureTaskCleaning
  Service: #HomeCleaning #HouseCleaning #ProfessionalCleaning #CleaningService #MaidService
  Audience: #BusyMom #WorkingProfessional #HomeOwner #AirbnbHost (use what's relevant)
  Local (city posts): #[City]Cleaning #[City]Homes #[City]Services
  Contextual: #CleanHome #CleaningMotivation #HomeGoals #CleanTok

Facebook: 3–5 hashtags (lower priority, feel natural)
LinkedIn: 3–5 professional hashtags: #HomeServices #MarketplacePlatform #TrustFirst #GigEconomy

════════════════════════════════════════════════
PLATFORM ADAPTATION (every version must be genuinely different)
════════════════════════════════════════════════
X/Twitter → Under 280 chars. Hook + stat + URL. Must include https://www.puretask.co
Instagram → Emotional, visual-first, 8–15 hashtags. Include https://www.puretask.co in caption.
Facebook → Slightly longer, practical, community feel. 3–5 hashtags. Include https://www.puretask.co
LinkedIn → Story → insight → connection. Professional tone. Include https://www.puretask.co
TikTok → Fast hook in first 2 words. POV or before/after format. Include https://www.puretask.co
Pinterest → Aspirational. Keyword-rich title. 8–12 hashtags. Include https://www.puretask.co

════════════════════════════════════════════════
CONTENT QUALITY CHECKLIST (all must pass before score ≥ 7.5)
════════════════════════════════════════════════
✓ Tied to one specific content pillar
✓ Written for one specific named audience
✓ Hook grabs in first line — specific and non-generic
✓ Pain → Solution → Outcome structure
✓ Platform captions are genuinely adapted (NOT copy-pasted)
✓ CTA is specific: "Book in [City] → https://www.puretask.co" not "Learn more"
✓ Uses real stats: 4.9★, 10K+, 98%, 2,400+, 6 hrs, 80–85%
✓ No hype words, no fake guarantees
✓ https://www.puretask.co in EVERY platform version
✓ Detailed image_prompt written for DALL-E 3 generation
✓ City posts name the city visually in image_prompt
✓ Hashtag minimums met per platform
✓ Scores are honest — do not inflate to hit threshold

OUTPUT: Valid JSON only. No markdown fences. No text outside the JSON object.`;

// ─────────────────────────────────────────────
// DRAFT SCHEMA FOR GPT PROMPT
// ─────────────────────────────────────────────
const DRAFT_SCHEMA = `Each draft object MUST contain ALL of these fields:
{
  "title": "Short descriptive title (include city name if local post)",
  "audience": "one of: Busy Homeowners | Working Professionals | Families | Seniors | Cleaners / Gig Workers",
  "pillar": "one of: Convenience | Trust | Transformation | Recruitment | Local | Proof",
  "hook": "First-line scroll-stopper — specific, emotional, not generic",
  "primary_caption": "2–3 sentence caption. Ends with https://www.puretask.co",
  "short_caption": "Under 180 chars for X. Includes https://www.puretask.co",
  "long_caption": "4–6 sentence full version. Ends with https://www.puretask.co",
  "cta_1": "Primary CTA — city-specific if possible. Ends with https://www.puretask.co",
  "cta_2": "Secondary CTA. Ends with https://www.puretask.co",
  "cta_3": "Soft CTA (save/share). Ends with https://www.puretask.co",
  "image_prompt": "Full DALL-E 3 prompt — specific scene, people, lighting, mood, PureTask blue (#0099FF). City posts MUST mention the city visually.",
  "video_prompt": "Kling AI video concept — opening scene, movement, emotional arc, text overlays, CTA at end",
  "script_15sec": "15-second voiceover. Ends with https://www.puretask.co",
  "script_30sec": "30-second voiceover. Ends with https://www.puretask.co",
  "comment_replies": "3 Q&A objection-handler pairs, separated by |",
  "platform_x": "Under 280 chars. Punchy. Includes https://www.puretask.co",
  "platform_instagram": "Emotional. 8–15 hashtags. Includes https://www.puretask.co",
  "platform_facebook": "Practical. 3–5 hashtags. Includes https://www.puretask.co",
  "platform_linkedin": "Story→insight→connection. 3–5 pro hashtags. Includes https://www.puretask.co",
  "platform_tiktok": "Fast hook + POV format. Includes https://www.puretask.co",
  "platform_pinterest": "Aspirational. 8–12 hashtags. Includes https://www.puretask.co",
  "clarity_score": number 1–10 after penalties,
  "relatability_score": number 1–10 after penalties,
  "conversion_score": number 1–10 after penalties,
  "editor_notes": "Honest 1–2 sentence reason for score. What's strong, what could improve."
}`;

// ─────────────────────────────────────────────
// POSTING WINDOWS (PT timezone)
// ─────────────────────────────────────────────
const POSTING_WINDOWS: Record<string, number[]> = {
  facebook:  [9, 11, 14],
  instagram: [8, 12, 18, 20],
  tiktok:    [7, 13, 19],
  linkedin:  [7, 8, 17],
  twitter:   [8, 12, 17],
  pinterest: [20, 21],
};

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

async function generateImage(prompt: string, key: string): Promise<string | null> {
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

function getNextSlot(platform: string, usedSlots: Set<string>): Date {
  const windows = POSTING_WINDOWS[platform] || [9, 14, 19];
  const now = new Date();
  for (let day = 0; day <= 3; day++) {
    for (const hour of windows) {
      const candidate = new Date(now);
      candidate.setDate(candidate.getDate() + day);
      candidate.setHours(hour, Math.floor(Math.random() * 45), 0, 0);
      const key = `${platform}:${candidate.toISOString().slice(0, 13)}`;
      if (candidate > now && !usedSlots.has(key)) {
        usedSlots.add(key);
        return candidate;
      }
    }
  }
  return new Date(now.getTime() + 2 * 60 * 60 * 1000);
}

async function postToAyrshare(draft: any, platform: string, ayrshareKey: string): Promise<any> {
  const fieldMap: Record<string, string> = {
    facebook: 'platform_facebook',
    instagram: 'platform_instagram',
    tiktok: 'platform_tiktok',
    linkedin: 'platform_linkedin',
    twitter: 'platform_x',
    pinterest: 'platform_pinterest',
  };

  let content = draft[fieldMap[platform]] || draft.primary_caption || draft.hook;
  if (!content) return { success: false, error: 'No content' };

  // Always inject URL if missing
  if (!content.includes('puretask.co')) {
    content = content.trim() + '\n\nhttps://www.puretask.co';
  }

  const payload: any = {
    post: content,
    platforms: [platform],
    isVideo: false,
    shortenLinks: false,
  };

  // Attach image if we have one
  const imageUrl = (draft.editor_notes || '').match(/IMAGE_GENERATED:\s*(https?:\/\/[^\s\n]+)/)?.[1];
  if (imageUrl) payload.mediaUrls = [imageUrl];

  try {
    const res = await fetch('https://app.ayrshare.com/api/post', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ayrshareKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'curl/7.88.1',
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    return {
      success: result.status === 'success' || result.status === 'scheduled',
      platform,
      ayrshare_id: result.id,
      post_url: result.postIds?.[0]?.postUrl,
      error: result.errors?.[0] || result.message,
    };
  } catch (e: any) {
    return { success: false, platform, error: e.message };
  }
}

function calcAvg(draft: any): number {
  const c = Number(draft.clarity_score) || 0;
  const r = Number(draft.relatability_score) || 0;
  const v = Number(draft.conversion_score) || 0;
  return Math.round(((c + r + v) / 3) * 100) / 100;
}

// ─────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────
export default async function generateDailyContent(req: Request) {
  const body = await req.json().catch(() => ({}));
  const {
    count = 8,
    audience_override,
    pillar_override,
    week_tag,
    campaign_tag,
    city = 'National',
    generate_images = true,
    auto_post = false, // set true only when Ayrshare Business plan active
  } = body;

  const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');
  const AYRSHARE_KEY = Deno.env.get('AYRSHARE_API_KEY');

  if (!OPENAI_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not set' }), { status: 500 });
  }

  // Week rotation
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
    if (gaps.length) gapNote = `\nPRIORITIZE these uncovered pillars: ${gaps.join(', ')}`;
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

  const userPrompt = `Generate exactly ${count} PureTask content drafts following all v3.0 rules strictly.

AUDIENCE FOCUS: ${audience} (at least 60% of drafts must target this audience)
PILLAR FOCUS: ${pillar_override || 'Mix all 6 pillars — fill gaps first'}
WEEK: ${wTag}
CITY: ${city}
${gapNote}
${winnerNote}

DRAFT SCHEMA — every object must include ALL fields:
${DRAFT_SCHEMA}

KEY REMINDERS:
- https://www.puretask.co must appear in EVERY platform caption
- 8–15 hashtags on Instagram/TikTok/Pinterest (not 3, not 5 — minimum 8)
- Score honestly using the strict rubric — do not inflate scores to hit 7.5
- Every hook must be unique — no repeated angles across drafts
- image_prompt must be a full DALL-E 3 prompt, not just a description
- City posts MUST name the city in the image_prompt

Respond ONLY with: {"drafts": [...${count} objects...]}`;

  // Generate drafts
  let rawDrafts: any[];
  try {
    const result = await callGPT4o([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ], OPENAI_KEY);
    rawDrafts = result.drafts || result;
    if (!Array.isArray(rawDrafts)) throw new Error('Not an array');
  } catch (e) {
    return new Response(JSON.stringify({ error: `Generation failed: ${String(e)}` }), { status: 500 });
  }

  const saved: any[] = [];
  const rejected: any[] = [];
  const imageResults: any[] = [];
  const postResults: any[] = [];
  const usedSlots = new Set<string>();

  for (const draft of rawDrafts) {
    const avg = calcAvg(draft);

    // Hard reject below 5
    if (avg < 5.0) {
      rejected.push({ title: draft.title, avg, reason: draft.editor_notes || 'Score below 5.0' });
      continue;
    }

    const status = avg >= 7.5 ? 'Approved' : 'Draft';

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
      campaign_tag: campaign_tag || `${audience} - ${draft.pillar}`,
      city,
      status,
      posted_platforms: '[]',
      is_winner: false,
    });

    saved.push({ ...record, avg, status });

    // Generate image for approved drafts only
    if (generate_images && draft.image_prompt && status === 'Approved') {
      await new Promise(r => setTimeout(r, 1500));
      const imgUrl = await generateImage(draft.image_prompt, OPENAI_KEY);
      if (imgUrl) {
        await base44.asServiceRole.entities.ContentDraft.update(record.id, {
          editor_notes: (record.editor_notes || '') + `\nIMAGE_GENERATED: ${imgUrl}`
        });
        record.editor_notes = (record.editor_notes || '') + `\nIMAGE_GENERATED: ${imgUrl}`;
        imageResults.push({ id: record.id, title: draft.title, image_url: imgUrl, success: true });
      } else {
        imageResults.push({ id: record.id, title: draft.title, success: false });
      }
    }

    // Auto-post approved drafts if Ayrshare Business plan active
    if (auto_post && AYRSHARE_KEY && status === 'Approved') {
      const platforms = ['facebook', 'instagram', 'linkedin', 'pinterest'];
      const posted: string[] = [];

      for (const platform of platforms) {
        await new Promise(r => setTimeout(r, 800));
        const result = await postToAyrshare(record, platform, AYRSHARE_KEY);
        if (result.success) {
          posted.push(platform);
          postResults.push({ ...result, draft_id: record.id, title: draft.title });
        }
      }

      if (posted.length > 0) {
        await base44.asServiceRole.entities.ContentDraft.update(record.id, {
          status: 'Posted',
          posted_platforms: JSON.stringify(posted),
        });
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
    images_generated: imageResults.filter(i => i.success).length,
    posts_sent: postResults.filter(p => p.success).length,
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
    rejected_drafts: rejected,
    image_results: imageResults,
    post_results: postResults,
  }), { headers: { 'Content-Type': 'application/json' } });
}
