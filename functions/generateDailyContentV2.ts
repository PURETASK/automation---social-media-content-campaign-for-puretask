// Rebuilt: GPT-4o + DALL-E 3 auto-image pipeline — 2026-04-09T00:10:30Z
import { base44 } from '@base44/core';

const SYSTEM_PROMPT = `You are the PureTask content engine. PureTask is a trust-first home cleaning marketplace.

BRAND FACTS (always use these):
- Stats: 10K+ happy clients, 2,400+ verified cleaners, 4.9★ avg rating, 50+ cities, 98% satisfaction
- Key differentiators: Escrow payment (only released when you approve), GPS check-ins, before/after photo proof, annual background checks, Reliability Score (0-100), tier system (Bronze→Platinum), cleaners keep 80-85%
- Tagline: "Cleaning you can actually trust." / "Pay Only When You're Happy."
- Brand voice: Direct, confident, trust-focused. Short punchy lines. No fluff. No hype words.

CONTENT PILLARS: Convenience | Trust | Transformation | Recruitment | Local | Proof

AUDIENCES: Busy Homeowners | Working Professionals | Families | Seniors | Cleaners / Gig Workers

QUALITY RULES:
- Clarity score ≥ 7, Relatability score ≥ 7, Conversion score ≥ 7
- Hook grabs in first line — Pain → Solution → Outcome structure
- CTA is specific not generic ("Book in [City] →" not "Learn more")
- Use real numbers where available
- NEVER use: "insane", "unbelievable", "crazy", fake scarcity, financial guarantees
- Platform adaptation: X under 280 chars | Instagram max 5 hashtags | LinkedIn = story→insight→connection | TikTok = POV/fast hook

OUTPUT: Respond with a valid JSON array of content draft objects. No markdown. No explanation. Just the JSON array.`;

const DRAFT_SCHEMA = `Each object in the array must have exactly these fields:
{
  "title": "Short descriptive title",
  "audience": "one of: Busy Homeowners | Working Professionals | Families | Seniors | Cleaners / Gig Workers",
  "pillar": "one of: Convenience | Trust | Transformation | Recruitment | Local | Proof",
  "hook": "The grabbing first line",
  "primary_caption": "Main 2-3 sentence caption for Facebook/LinkedIn",
  "short_caption": "Under 180 chars for X/Twitter",
  "long_caption": "Full 4-6 sentence version for blog/email",
  "cta_1": "Primary CTA",
  "cta_2": "Secondary CTA",
  "cta_3": "Tertiary CTA",
  "image_prompt": "Detailed DALL-E 3 image generation prompt — specific scene, composition, lighting, mood",
  "video_prompt": "Video concept description for Reels/TikTok",
  "script_15sec": "15-second voiceover script",
  "script_30sec": "30-second voiceover script",
  "comment_replies": "3 Q&A pairs separated by | for common objections",
  "platform_x": "X/Twitter adapted caption (under 280 chars)",
  "platform_instagram": "Instagram caption with up to 5 hashtags",
  "platform_facebook": "Facebook caption, slightly longer, practical",
  "platform_linkedin": "LinkedIn version: story → insight → connection",
  "platform_tiktok": "TikTok/Reels hook + concept (POV format preferred)",
  "platform_pinterest": "Pinterest: aspirational, keyword-rich, 5-8 hashtags",
  "status": "Pending Approval",
  "clarity_score": number 1-10,
  "relatability_score": number 1-10,
  "conversion_score": number 1-10
}`;

async function callGPT4o(messages: any[], openaiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature: 0.85,
      max_tokens: 6000,
      response_format: { type: 'json_object' }
    })
  });
  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error(`GPT-4o error: ${JSON.stringify(data.error || data)}`);
  }
  return data.choices[0].message.content;
}

async function generateImageForDraft(draft: any, openaiKey: string): Promise<string | null> {
  if (!draft.image_prompt) return null;

  const brandPrefix = `Professional lifestyle photography for a home cleaning marketplace. Clean minimal aesthetic. White and light gray tones. Bright natural lighting. Aspirational magazine-quality. No text overlays. Modern home interiors. `;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: brandPrefix + draft.image_prompt,
        n: 1,
        size: '1792x1024',
        quality: 'hd',
        style: 'natural'
      })
    });
    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch {
    return null;
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
    generate_images = true
  } = body;

  const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not set' }), { status: 500 });
  }

  // Determine this week's audience rotation
  const weekNumber = Math.ceil(new Date().getDate() / 7);
  const audienceRotation = ['Busy Homeowners', 'Families', 'Working Professionals', 'Cleaners / Gig Workers'];
  const currentAudience = audience_override || audienceRotation[(weekNumber - 1) % 4];

  const currentWeekTag = week_tag || `Week of ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  // Check pillar coverage gaps from existing drafts this week
  let pillarGaps = '';
  try {
    const existingDrafts = await base44.asServiceRole.entities.ContentDraft.filter({ week_tag: currentWeekTag });
    const pillarCounts: Record<string, number> = {};
    const pillars = ['Convenience', 'Trust', 'Transformation', 'Recruitment', 'Local', 'Proof'];
    pillars.forEach(p => pillarCounts[p] = 0);
    existingDrafts.forEach((d: any) => { if (d.pillar) pillarCounts[d.pillar]++; });
    const underserved = pillars.filter(p => pillarCounts[p] === 0);
    if (underserved.length > 0) {
      pillarGaps = `\nIMPORTANT: These pillars have ZERO drafts this week — prioritize them: ${underserved.join(', ')}`;
    }
  } catch { /* continue without gap data */ }

  // Check WinnerDNA for patterns to replicate
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

  const userPrompt = `Generate exactly ${count} PureTask content drafts for this week.

PRIMARY AUDIENCE THIS WEEK: ${currentAudience}
PILLAR FOCUS: ${pillar_override || 'Mix across all 6 pillars, prioritize gaps'}
WEEK TAG: ${currentWeekTag}
CITY: ${city}
${pillarGaps}
${winnerPatterns}

DISTRIBUTION: At least 60% of drafts should target ${currentAudience}. Remaining 40% can be mixed audiences.
Each draft must be completely unique — different hooks, different angles, different emotional triggers.
Vary the format: some pain-point focused, some aspirational, some proof/social-proof based, some story-driven.

${DRAFT_SCHEMA}

Respond with: {"drafts": [...array of ${count} draft objects...]}`;

  let drafts: any[] = [];

  try {
    const raw = await callGPT4o([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ], OPENAI_KEY);

    const parsed = JSON.parse(raw);
    drafts = parsed.drafts || parsed;
    if (!Array.isArray(drafts)) {
      throw new Error('GPT-4o did not return an array');
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: `GPT-4o generation failed: ${String(e)}` }), { status: 500 });
  }

  // Save drafts to entity + generate images
  const savedDrafts = [];
  const imageResults = [];

  for (const draft of drafts) {
    // Only save drafts that pass quality threshold
    const avgScore = ((draft.clarity_score || 0) + (draft.relatability_score || 0) + (draft.conversion_score || 0)) / 3;
    if (avgScore < 7) continue;

    const draftData = {
      ...draft,
      week_tag: currentWeekTag,
      campaign_tag: campaign_tag || `${currentAudience} - ${draft.pillar}`,
      city,
      status: 'Pending Approval'
    };

    const saved = await base44.asServiceRole.entities.ContentDraft.create(draftData);
    savedDrafts.push(saved);

    // Auto-generate image for this draft
    if (generate_images && draft.image_prompt) {
      await new Promise(r => setTimeout(r, 1500)); // Rate limit DALL-E
      const imageUrl = await generateImageForDraft(draft, OPENAI_KEY);

      if (imageUrl) {
        // Store image URL in editor_notes
        await base44.asServiceRole.entities.ContentDraft.update(saved.id, {
          editor_notes: `IMAGE_GENERATED: ${imageUrl}`
        });
        imageResults.push({ draft_id: saved.id, title: draft.title, image_url: imageUrl, success: true });
      } else {
        imageResults.push({ draft_id: saved.id, title: draft.title, success: false });
      }
    }
  }

  return new Response(JSON.stringify({
    success: true,
    drafts_generated: savedDrafts.length,
    images_generated: imageResults.filter(r => r.success).length,
    audience_focus: currentAudience,
    week_tag: currentWeekTag,
    pillar_gaps_addressed: pillarGaps || 'none',
    drafts: savedDrafts.map(d => ({ id: d.id, title: d.title, pillar: d.pillar, audience: d.audience })),
    images: imageResults
  }), { headers: { 'Content-Type': 'application/json' } });
}
