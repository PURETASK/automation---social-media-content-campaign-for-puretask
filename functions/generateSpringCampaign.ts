// PureTask Spring Cleaning Campaign Generator v1.0
// Spring 2026 — search volume for cleaning services up 340% this month
// Window closes in 3-4 weeks — capitalize NOW
// Combines Convenience + Transformation + Local pillars with seasonal urgency

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const SPRING_SYSTEM_PROMPT = `You are the PureTask AI content engine generating spring cleaning campaign content.
PureTask is a trust-first home cleaning marketplace at https://www.puretask.co.

SPRING 2026 CONTEXT:
- Search volume for cleaning services is UP 340% right now — peak spring booking season
- Spring cleaning is the #1 seasonal home services trigger (bigger than fall, summer, winter)
- April window = highest urgency — people are actively looking RIGHT NOW
- Spring = fresh start, reset, renewal — powerful emotional angle
- Busy professionals and families are most motivated in spring to "finally deal with it"

SPRING CAMPAIGN PILLARS (combine these):
- Convenience: "Let PureTask handle spring cleaning while you enjoy the season"
- Transformation: "Spring reset — from winter mess to fresh clean home" (use illustrated/stylized split images — PureTask doesn't have real before/after photos yet)
- Local: "Spring cleaning in [City] — book before slots fill up"
- Proof: "10,000+ homes spring-cleaned through PureTask"

TRANSFORMATION VISUAL NOTE:
PureTask is new and doesn't have real before/after photos yet.
For Transformation content: use stylized illustrated split-panel images OR focus on the emotional transformation (person's relief/happiness) rather than actual dirty/clean photo comparison.
This is fine and actually works well for social — lifestyle/emotional transformation beats literal cleaning photos.

URGENCY RULES (real urgency only — no fake scarcity):
- "Spring cleaning season is here" = real urgency
- "Search volume up 340% this month" = real data
- "Book early — availability fills faster in spring" = real and reasonable
- NEVER fake "only 3 slots left" or fabricated deadlines

LOCKED CONSTANTS:
- URL: https://www.puretask.co — EVERY caption, EVERY platform
- Stats: 10,000+ clients | 4.9★ | 98% satisfaction | 2,400+ verified cleaners | 6 hrs saved
- Spring keywords: fresh start, spring reset, deep clean, declutter, seasonal refresh

PLATFORM PRIORITIES FOR SPRING CAMPAIGN:
- Facebook: primary (spring cleaning resonates most with 30-55 demographic here)
- Instagram: visual transformation content — spring aesthetics perform very well
- Pinterest: spring home content is top-performing category (high seasonal search)
- TikTok: spring cleaning ASMR/before-after is viral category on CleanTok

SCORING v3.0 — 7.5+ required. Spring bonus:
- BONUS +1 Conversion: uses "340% more searches" stat OR specific spring urgency
- BONUS +1 Relatability: mentions specific spring scenario (post-winter dust, muddy floors, guest season)
- PENALTY -2: fake scarcity ("only X slots left" etc.)

OUTPUT: Valid JSON array only. No markdown.`;

const SPRING_SCHEMA = `Each spring draft object MUST contain:
{
  "title": "Spring-specific title with urgency",
  "audience": "Busy Homeowners" or "Families" or "Working Professionals" or "Seniors",
  "pillar": "Convenience" or "Transformation" or "Local" or "Proof",
  "hook": "Spring-specific scroll stopper — seasonal context in first line",
  "primary_caption": "3-4 sentences. Spring context. Ends with https://www.puretask.co",
  "cta_1": "Book your spring clean → https://www.puretask.co",
  "cta_2": "Fresh start this spring → https://www.puretask.co",
  "cta_3": "Spring cleaning, zero effort → https://www.puretask.co",
  "image_prompt": "DALL-E 3 — spring scene: bright natural light through clean windows, fresh flowers on counters, sparkling surfaces, open windows with spring light. PureTask blue #0099FF accent. Warm bright lifestyle photography.",
  "script_15sec": "15s VO spring urgency hook. Ends: https://www.puretask.co",
  "script_30sec": "30s VO spring story arc — winter grime → spring reset → PureTask solution. Ends: https://www.puretask.co",
  "platform_facebook": "Practical spring framing. 3-5 hashtags. URL.",
  "platform_instagram": "Visual spring aesthetic. 10-15 hashtags including #SpringCleaning #SpringReset #CleanHome. URL.",
  "platform_tiktok": "Fast spring hook. #SpringCleaning #CleanTok angle. URL.",
  "platform_pinterest": "Aspirational spring home. 10-12 hashtags. URL.",
  "platform_x": "Under 280 chars. Spring urgency + stats + URL.",
  "platform_linkedin": "Professional spring productivity angle. URL.",
  "city": null,
  "clarity_score": number,
  "relatability_score": number,
  "conversion_score": number,
  "editor_notes": "Why this spring post works"
}`;

const SPRING_ANGLES = [
  { angle: "spring_urgency", audience: "Busy Homeowners", pillar: "Convenience", focus: "Spring cleaning season is here and searches are up 340%. Don't let spring pass without a real deep clean. PureTask makes it effortless.", city: null },
  { angle: "post_winter_reset", audience: "Families", pillar: "Transformation", focus: "Post-winter home reset — dust, mud tracked in, pet hair, stale air. Spring is the moment everyone finally wants their home to feel fresh again.", city: null },
  { angle: "spring_professional", audience: "Working Professionals", pillar: "Convenience", focus: "Spring cleaning takes 6+ hours. Working professionals don't have that time. Book PureTask and spend your spring actually enjoying it.", city: null },
  { angle: "spring_seniors", audience: "Seniors", pillar: "Convenience", focus: "Spring deep clean for seniors — windows, baseboards, inside cabinets. The jobs that are hard to do yourself. Safe, vetted cleaner handles it all.", city: null },
  { angle: "spring_transformation", audience: "Busy Homeowners", pillar: "Transformation", focus: "The before/after of spring cleaning. Show emotional transformation from winter home to bright spring-ready space. Focus on the feeling, not the mess.", city: null },
  { angle: "spring_social_proof", audience: "Busy Homeowners", pillar: "Proof", focus: "10,000+ homes spring-cleaned through PureTask. 4.9★. Spring is when most people try PureTask for the first time — and keep coming back.", city: null },
  { angle: "spring_la", audience: "Busy Homeowners", pillar: "Local", focus: "Spring cleaning in Los Angeles — California spring is here, your home should match the season. Book in LA now.", city: "Los Angeles" },
  { angle: "spring_nyc", audience: "Working Professionals", pillar: "Local", focus: "NYC spring cleaning — post-winter apartment refresh. The dust, the grime, the stuff that built up all winter. PureTask NYC handles it.", city: "New York" },
  { angle: "spring_airbnb", audience: "Airbnb Hosts", pillar: "Convenience", focus: "Spring is peak Airbnb booking season. Get your space deep-cleaned and guest-ready before the rush hits.", city: null },
];

async function generateSpringDraft(angle: typeof SPRING_ANGLES[0], count: number): Promise<any[]> {
  const userPrompt = `Generate ${count} spring cleaning campaign draft(s) for PureTask.

Angle: ${angle.angle}
Target audience: ${angle.audience}
Content pillar: ${angle.pillar}
Focus: ${angle.focus}
${angle.city ? `City: ${angle.city} — make it hyper-local, reference ${angle.city} specifically` : ""}

IMPORTANT for Transformation posts: 
PureTask doesn't have real before/after photos yet. Use EITHER:
1. Stylized illustrated split-panel image (described in image_prompt)
2. Emotional transformation focus — the person's relief/happiness after, not literal dirty/clean photos
Both work excellently on social media.

Schema: ${SPRING_SCHEMA}

Return JSON array of ${count} objects. No markdown.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SPRING_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8, max_tokens: 3500
    })
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "[]";
  try {
    return JSON.parse(raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
  } catch { return []; }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const body = await req.json().catch(() => ({}));
    const { angles, drafts_per_angle = 1 } = body;

    const targets = angles ? SPRING_ANGLES.filter(a => angles.includes(a.angle)) : SPRING_ANGLES;
    console.log(`[Spring] Generating ${targets.length} spring angles...`);

    const created: any[] = [], skipped: any[] = [];

    for (const angle of targets) {
      const drafts = await generateSpringDraft(angle, drafts_per_angle);

      for (const draft of drafts) {
        const avg = ((draft.clarity_score || 0) + (draft.relatability_score || 0) + (draft.conversion_score || 0)) / 3;
        const status = avg >= 7.5 ? "Approved" : avg >= 5 ? "Draft" : "Rejected";

        if (status === "Rejected") {
          skipped.push({ angle: angle.angle, title: draft.title, avg: avg.toFixed(1) });
          continue;
        }

        const record = await db.ContentDraft.create({
          ...draft,
          status,
          city: angle.city || draft.city || null,
          pillar: angle.pillar,
          campaign_tag: "Spring 2026",
          week_tag: `Spring-${new Date().toISOString().split("T")[0]}`,
          heygen_status: (draft.script_30sec || draft.script_15sec) ? "Queued" : "None",
          posted_platforms: "",
          is_winner: false
        });

        created.push({ id: record.id, angle: angle.angle, title: draft.title, pillar: angle.pillar, status, avg: avg.toFixed(1) });
        console.log(`[Spring] ✅ ${draft.title} (${avg.toFixed(1)}) → ${status}`);
      }
      await new Promise(r => setTimeout(r, 800));
    }

    return Response.json({
      ok: true,
      angles_processed: targets.length,
      drafts_created: created.length,
      approved: created.filter(c => c.status === "Approved").length,
      created,
      skipped
    });

  } catch (error: any) {
    console.error("[Spring Error]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
