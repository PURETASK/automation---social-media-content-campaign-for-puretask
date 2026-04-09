// PureTask Content Engine — FULL AUTOPILOT v3.1
// Auto-generates → Auto-scores → Auto-approves → Auto-schedules → Auto-posts
// Nathan makes zero content decisions. AI handles everything.

import { base44 } from '@base44/core';

const SYSTEM_PROMPT = `You are the PureTask content engine running in full autopilot mode. PureTask is a trust-first home cleaning marketplace.

BRAND FACTS (always use these in copy):
- Stats: 10K+ happy clients, 2,400+ verified cleaners, 4.9★ avg rating, 50+ cities, 98% satisfaction
- Key differentiators: Escrow payment (released only when you approve), GPS check-ins, before/after photo proof, annual background checks, Reliability Score (0-100), tier system (Bronze→Platinum), cleaners keep 80-85%
- Tagline: "Cleaning you can actually trust." / "Pay Only When You're Happy."
- Brand voice: Direct, confident, trust-focused. Short punchy lines. No fluff. No hype words.
- Brand colors: Bright blue #0099FF, white/light gray background, dark bold headings

CONTENT PILLARS: Convenience | Trust | Transformation | Recruitment | Local | Proof
AUDIENCES: Busy Homeowners | Working Professionals | Families | Seniors | Cleaners / Gig Workers

QUALITY RULES (these are your own standards — you enforce them):
- Clarity ≥ 7, Relatability ≥ 7, Conversion ≥ 7 — be honest in scoring, don't inflate
- Hook grabs in first line — Pain → Solution → Outcome structure
- CTA is specific not generic ("Book in [City] →" not "Learn more")
- Use real numbers: 4.9★, 10K+, 98%, 50+ cities, 6 hrs
- NEVER use: "insane", "unbelievable", "crazy", fake scarcity, financial guarantees
- Platform adaptation: X under 280 chars | Instagram max 5 hashtags | LinkedIn = story→insight→connection | TikTok = POV/fast hook

OUTPUT: Respond with valid JSON only. No markdown fences. No explanation.`;

const DRAFT_SCHEMA = `Each object must have exactly these fields:
{
  "title": "Short descriptive title",
  "audience": "one of: Busy Homeowners | Working Professionals | Families | Seniors | Cleaners / Gig Workers",
  "pillar": "one of: Convenience | Trust | Transformation | Recruitment | Local | Proof",
  "hook": "The grabbing first line — the scroll-stopper",
  "primary_caption": "Main 2-3 sentence caption",
  "short_caption": "Under 180 chars for X/Twitter",
  "long_caption": "Full 4-6 sentence version",
  "cta_1": "Primary CTA (specific, with city if possible)",
  "cta_2": "Secondary CTA",
  "cta_3": "Soft CTA (save/share/learn)",
  "image_prompt": "Detailed DALL-E 3 prompt — specific scene, composition, lighting, mood, brand aesthetic",
  "video_prompt": "Kling AI video concept — scene, movement, emotional arc",
  "script_15sec": "15-second voiceover script",
  "script_30sec": "30-second voiceover script",
  "comment_replies": "3 Q&A pairs separated by | for common objections",
  "platform_x": "X/Twitter caption (under 280 chars, punchy)",
  "platform_instagram": "Instagram caption with up to 5 hashtags",
  "platform_facebook": "Facebook caption, practical, slightly longer",
  "platform_linkedin": "LinkedIn: story → insight → connection format",
  "platform_tiktok": "TikTok/Reels hook + POV concept",
  "platform_pinterest": "Pinterest: aspirational, 5-8 hashtags, keyword-rich",
  "clarity_score": number 1-10,
  "relatability_score": number 1-10,
  "conversion_score": number 1-10
}`;

// Optimal posting windows per platform (hour in PT, 24h format)
const POSTING_WINDOWS: Record<string, number[]> = {
  Facebook:  [9, 11, 14],
  Instagram: [8, 12, 18, 20],
  TikTok:    [7, 13, 19],
  LinkedIn:  [7, 8, 17],
  X:         [8, 12, 17],
  Pinterest: [20, 21],
};

// Platform names Ayrshare expects
const AYRSHARE_PLATFORMS = ["facebook", "instagram", "tiktok", "linkedin", "twitter", "pinterest"];

function getNextPostingTime(platform: string, usedSlots: Set<string>): Date {
  const windows = POSTING_WINDOWS[platform] || [9, 14, 19];
  const now = new Date();
  // Try today first, then tomorrow
  for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
    for (const hour of windows) {
      const candidate = new Date(now);
      candidate.setDate(candidate.getDate() + dayOffset);
      candidate.setHours(hour, Math.floor(Math.random() * 45), 0, 0); // randomize minutes 0-44
      const slotKey = `${platform}:${candidate.toISOString().slice(0, 13)}`;
      if (candidate > now && !usedSlots.has(slotKey)) {
        usedSlots.add(slotKey);
        return candidate;
      }
    }
  }
  // Fallback: 2 hours from now
  const fallback = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return fallback;
}

async function callGPT4o(messages: any[], openaiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature: 0.85,
      max_tokens: 6000,
      response_format: { type: 'json_object' },
    }),
  });
  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error(`GPT-4o error: ${JSON.stringify(data.error || data)}`);
  }
  return data.choices[0].message.content;
}

async function generateImage(imagePrompt: string, openaiKey: string): Promise<string | null> {
  const brandPrefix = `Professional lifestyle photography for PureTask, a home cleaning marketplace. Clean white minimalist aesthetic. Bright natural lighting. Aspirational magazine-quality. No text overlays. Modern home interiors. Blue accents (#0099FF). `;
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: brandPrefix + imagePrompt,
        n: 1,
        size: '1792x1024',
        quality: 'hd',
        style: 'natural',
      }),
    });
    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch {
    return null;
  }
}

async function postToAyrshare(draft: any, platform: string, scheduleDate: Date, ayrshareKey: string): Promise<any> {
  const platformKeyMap: Record<string, string> = {
    facebook: 'platform_facebook',
    instagram: 'platform_instagram',
    tiktok: 'platform_tiktok',
    linkedin: 'platform_linkedin',
    twitter: 'platform_x',
    pinterest: 'platform_pinterest',
  };

  const copyField = platformKeyMap[platform];
  let postContent = draft[copyField] || draft.primary_caption || draft.hook;

  // Ensure content exists and isn't just a VIDEO_URL marker
  if (!postContent || postContent.startsWith('VIDEO_URL:')) {
    postContent = draft.primary_caption || draft.hook;
  }

  if (!postContent) return { success: false, error: 'No content' };

  const payload: any = {
    post: postContent,
    platforms: [platform],
    scheduleDate: scheduleDate.toISOString(),
    isVideo: false,
    shortenLinks: false,
  };

  // Attach image if available
  const imageUrl = (draft.editor_notes || '').match(/IMAGE_GENERATED:\s*(https?:\/\/[^\s\n]+)/)?.[1];
  if (imageUrl && ['facebook', 'instagram', 'linkedin', 'pinterest'].includes(platform)) {
    payload.mediaUrls = [imageUrl];
  }

  try {
    const res = await fetch('https://app.ayrshare.com/api/post', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ayrshareKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    return {
      success: result.status === 'success' || result.status === 'scheduled',
      platform,
      schedule: scheduleDate.toISOString(),
      ayrshare_id: result.id,
      status: result.status,
      error: result.errors?.[0] || result.message,
    };
  } catch (e: any) {
    return { success: false, platform, error: e.message };
  }
}

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
    auto_post = true,  // NEW: autopilot posts immediately after approval
  } = body;

  const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');
  const AYRSHARE_KEY = Deno.env.get('AYRSHARE_API_KEY');

  if (!OPENAI_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not set' }), { status: 500 });
  }

  // Week audience rotation
  const weekNumber = Math.ceil(new Date().getDate() / 7);
  const audienceRotation = ['Busy Homeowners', 'Families', 'Working Professionals', 'Cleaners / Gig Workers'];
  const currentAudience = audience_override || audienceRotation[(weekNumber - 1) % 4];
  const currentWeekTag = week_tag || `Week of ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  // Check pillar coverage gaps
  let pillarGaps = '';
  try {
    const existingDrafts = await base44.asServiceRole.entities.ContentDraft.filter({ week_tag: currentWeekTag });
    const pillars = ['Convenience', 'Trust', 'Transformation', 'Recruitment', 'Local', 'Proof'];
    const pillarCounts: Record<string, number> = {};
    pillars.forEach(p => pillarCounts[p] = 0);
    existingDrafts.forEach((d: any) => { if (d.pillar) pillarCounts[d.pillar]++; });
    const underserved = pillars.filter(p => pillarCounts[p] === 0);
    if (underserved.length > 0) {
      pillarGaps = `\nIMPORTANT: These pillars have ZERO drafts this week — prioritize: ${underserved.join(', ')}`;
    }
  } catch { /* continue */ }

  // Pull WinnerDNA for pattern replication
  let winnerPatterns = '';
  try {
    const winners = await base44.asServiceRole.entities.WinnerDNA.list({ limit: 5, sort: '-avg_score' });
    if (winners?.length > 0) {
      const patterns = winners.map((w: any) =>
        `Hook style: ${w.winning_hook_style}, Pillar: ${w.winning_pillar}, Trigger: ${w.emotional_trigger}, Platform: ${w.winning_platform}`
      ).join('\n');
      winnerPatterns = `\nWINNING PATTERNS TO REPLICATE:\n${patterns}`;
    }
  } catch { /* continue */ }

  const userPrompt = `Generate exactly ${count} PureTask content drafts.

PRIMARY AUDIENCE THIS WEEK: ${currentAudience}
PILLAR FOCUS: ${pillar_override || 'Spread across all 6 pillars, fill gaps first'}
WEEK TAG: ${currentWeekTag}
CITY: ${city}
${pillarGaps}
${winnerPatterns}

DISTRIBUTION: 60%+ targeting ${currentAudience}. Rest mixed audiences.
Each draft must be completely unique — different hooks, angles, emotional triggers.
Mix formats: pain-point, aspirational, proof/social-proof, story-driven.
Be honest in your scores — only give 8+ if it's genuinely great copy.

${DRAFT_SCHEMA}

Respond with: {"drafts": [...array of ${count} draft objects...]}`;

  // Generate drafts via GPT-4o
  let rawDrafts: any[] = [];
  try {
    const raw = await callGPT4o([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ], OPENAI_KEY);
    const parsed = JSON.parse(raw);
    rawDrafts = parsed.drafts || parsed;
    if (!Array.isArray(rawDrafts)) throw new Error('Expected array');
  } catch (e) {
    return new Response(JSON.stringify({ error: `GPT-4o failed: ${String(e)}` }), { status: 500 });
  }

  const usedPostingSlots = new Set<string>();
  const results = { approved: 0, rejected: 0, posted: 0, images: 0, drafts: [] as any[] };

  for (const draft of rawDrafts) {
    const clarity = draft.clarity_score || 0;
    const relatability = draft.relatability_score || 0;
    const conversion = draft.conversion_score || 0;
    const avgScore = (clarity + relatability + conversion) / 3;

    // AUTO-APPROVE LOGIC: avg ≥ 7.0 → approved, else rejected
    const autoStatus = avgScore >= 7.0 ? 'Approved' : avgScore >= 5.0 ? 'Draft' : 'Rejected';
    const autoRejectReason = avgScore < 7.0
      ? `Auto-${autoStatus.toLowerCase()} by AI. Avg score: ${avgScore.toFixed(1)}/10 (C:${clarity} R:${relatability} V:${conversion}). ${avgScore < 5 ? 'Below threshold — not posting.' : 'Needs revision before posting.'}`
      : `Auto-approved by AI. Avg score: ${avgScore.toFixed(1)}/10. All thresholds met.`;

    const draftData = {
      ...draft,
      status: autoStatus,
      week_tag: currentWeekTag,
      campaign_tag: campaign_tag || `${currentAudience} - ${draft.pillar}`,
      city,
      editor_notes: autoRejectReason,
    };

    // Save to entity
    let saved: any;
    try {
      saved = await base44.asServiceRole.entities.ContentDraft.create(draftData);
    } catch {
      continue;
    }

    if (autoStatus === 'Approved') {
      results.approved++;
    } else if (autoStatus === 'Rejected') {
      results.rejected++;
      results.drafts.push({ id: saved.id, title: draft.title, status: 'Rejected', score: avgScore.toFixed(1) });
      continue;
    } else {
      results.drafts.push({ id: saved.id, title: draft.title, status: 'Draft', score: avgScore.toFixed(1) });
      continue;
    }

    // Generate image for approved drafts
    let imageUrl: string | null = null;
    if (generate_images && draft.image_prompt) {
      await new Promise(r => setTimeout(r, 1500)); // rate limit
      imageUrl = await generateImage(draft.image_prompt, OPENAI_KEY);
      if (imageUrl) {
        results.images++;
        await base44.asServiceRole.entities.ContentDraft.update(saved.id, {
          editor_notes: `${autoRejectReason}\nIMAGE_GENERATED: ${imageUrl}`,
        });
      }
    }

    // AUTO-POST to Ayrshare with scheduled times
    if (auto_post && AYRSHARE_KEY) {
      const postResults: any[] = [];
      const postedPlatforms: string[] = [];
      let earliestSchedule: string | null = null;

      for (const platform of AYRSHARE_PLATFORMS) {
        const scheduleTime = getNextPostingTime(
          platform.charAt(0).toUpperCase() + platform.slice(1),
          usedPostingSlots
        );

        const postResult = await postToAyrshare(
          { ...saved, editor_notes: imageUrl ? `IMAGE_GENERATED: ${imageUrl}` : saved.editor_notes },
          platform,
          scheduleTime,
          AYRSHARE_KEY
        );

        postResults.push(postResult);

        if (postResult.success) {
          postedPlatforms.push(platform);
          results.posted++;
          if (!earliestSchedule || scheduleTime.toISOString() < earliestSchedule) {
            earliestSchedule = scheduleTime.toISOString();
          }
        }

        await new Promise(r => setTimeout(r, 300)); // rate limit Ayrshare
      }

      // Update draft status to Scheduled
      if (postedPlatforms.length > 0) {
        await base44.asServiceRole.entities.ContentDraft.update(saved.id, {
          status: 'Scheduled',
          scheduled_platforms: postedPlatforms.join(', '),
          scheduled_date: earliestSchedule,
          editor_notes: [
            autoRejectReason,
            imageUrl ? `IMAGE_GENERATED: ${imageUrl}` : '',
            `AUTO-SCHEDULED to: ${postedPlatforms.join(', ')}`,
            `Post results: ${JSON.stringify(postResults.map(r => ({ p: r.platform, ok: r.success, id: r.ayrshare_id })))}`,
          ].filter(Boolean).join('\n'),
        });
      }

      results.drafts.push({
        id: saved.id,
        title: draft.title,
        status: postedPlatforms.length > 0 ? 'Scheduled' : 'Approved',
        score: avgScore.toFixed(1),
        platforms_scheduled: postedPlatforms,
        schedule: earliestSchedule,
      });
    } else {
      results.drafts.push({
        id: saved.id,
        title: draft.title,
        status: 'Approved',
        score: avgScore.toFixed(1),
      });
    }
  }

  return new Response(JSON.stringify({
    success: true,
    autopilot: true,
    audience_focus: currentAudience,
    week_tag: currentWeekTag,
    approved: results.approved,
    rejected: results.rejected,
    images_generated: results.images,
    platforms_scheduled: results.posted,
    drafts: results.drafts,
  }), { headers: { 'Content-Type': 'application/json' } });
}
