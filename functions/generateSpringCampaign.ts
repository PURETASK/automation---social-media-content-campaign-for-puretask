// PureTask Spring Campaign Generator v2.0
// IMAGE GENERATED INLINE AT CREATION — not as afterthought
// Spring 2026 — search volume UP 340% — daily through April 30

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { generateImageForDraft } from './generateImages.ts';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const SPRING_SYSTEM_PROMPT = `You are the PureTask AI content engine generating spring cleaning campaign content.
PureTask is a trust-first home cleaning marketplace at https://www.puretask.co.
Spring 2026: search volume for cleaning services UP 340%. Peak booking season. Window closes end of April.
SPRING PILLARS: Convenience (let PureTask handle it) · Transformation (winter→spring reset, use illustrated split-panels) · Local (city-specific) · Proof (10K+ spring cleans).
TRANSFORMATION: PureTask has no real before/after photos. Use stylized illustrated split-panel OR emotional transformation (person's relief). Both outperform literal photos.
REAL URGENCY ONLY: "Spring season is here" and "340% more searches" = real. NEVER fake scarcity.
URL: https://www.puretask.co — EVERY caption. Stats: 10K+ | 4.9★ | 98% | 2,400+ | 6hrs saved.
BONUS +1 Conversion: uses 340% stat OR specific spring scenario. PENALTY -2: fake scarcity.
Score v3.0 — 7.5+ required. OUTPUT: Valid JSON array only.`;

const SPRING_SCHEMA = `[{
  "title": "spring-specific title with urgency",
  "audience": "Busy Homeowners or Families or Working Professionals or Seniors or Airbnb Hosts",
  "pillar": "Convenience or Transformation or Local or Proof",
  "hook": "spring seasonal scroll stopper — seasonal context in first line",
  "primary_caption": "3-4 sentences. Spring context. Ends: https://www.puretask.co",
  "cta_1": "Book your spring clean → https://www.puretask.co",
  "cta_2": "Fresh start this spring → https://www.puretask.co",
  "cta_3": "Spring cleaning, zero effort → https://www.puretask.co",
  "image_prompt": "DALL-E 3 spring scene: bright light through clean windows, fresh flowers, sparkling surfaces. PureTask blue #0099FF. Warm bright lifestyle.",
  "script_15sec": "15s VO spring urgency. Ends: https://www.puretask.co",
  "script_30sec": "30s VO winter→spring reset→PureTask. Ends: https://www.puretask.co",
  "platform_facebook": "Practical spring. 3-5 hashtags. URL.",
  "platform_instagram": "Visual spring aesthetic. 10-15 hashtags #SpringCleaning #SpringReset #CleanHome. URL.",
  "platform_tiktok": "Fast spring hook. #SpringCleaning #CleanTok. URL.",
  "platform_pinterest": "Aspirational spring home. 10-12 hashtags. URL.",
  "platform_x": "<280 chars. Spring urgency + stats + URL.",
  "platform_linkedin": "Professional spring productivity angle. URL.",
  "city": null,
  "clarity_score": 8,
  "relatability_score": 8,
  "conversion_score": 8,
  "editor_notes": "why this spring post works"
}]`;

const SPRING_ANGLES = [
  { angle: "spring_urgency", audience: "Busy Homeowners", pillar: "Convenience", focus: "Spring cleaning season here, searches up 340%. Don't let spring pass without a real deep clean.", city: null },
  { angle: "post_winter_reset", audience: "Families", pillar: "Transformation", focus: "Post-winter home reset — dust, mud, stale air. Spring is when everyone wants home to feel fresh.", city: null },
  { angle: "spring_professional", audience: "Working Professionals", pillar: "Convenience", focus: "Spring cleaning takes 6+ hours. Working professionals don't have that. Book PureTask, enjoy spring.", city: null },
  { angle: "spring_seniors", audience: "Seniors", pillar: "Convenience", focus: "Spring deep clean for seniors — windows, baseboards, inside cabinets. Safe vetted cleaner handles it all.", city: null },
  { angle: "spring_transformation", audience: "Busy Homeowners", pillar: "Transformation", focus: "Emotional spring transformation — person's relief/happiness after. Focus on feeling not mess.", city: null },
  { angle: "spring_social_proof", audience: "Busy Homeowners", pillar: "Proof", focus: "10,000+ homes spring-cleaned through PureTask. 4.9★. Spring is when most first-timers try us.", city: null },
  { angle: "spring_la", audience: "Busy Homeowners", pillar: "Local", focus: "Spring cleaning in Los Angeles. California spring is here, your home should match.", city: "Los Angeles" },
  { angle: "spring_nyc", audience: "Working Professionals", pillar: "Local", focus: "NYC spring cleaning — post-winter apartment refresh. The dust and grime that built up all winter.", city: "New York" },
  { angle: "spring_airbnb", audience: "Airbnb Hosts", pillar: "Convenience", focus: "Spring is peak Airbnb season. Get deep-cleaned and guest-ready before the rush hits.", city: null },
];

async function generateSpringText(angle: any, count: number): Promise<any[]> {
  const cityNote = angle.city ? `City: ${angle.city} — hyper-local, reference ${angle.city} specifically. image_prompt MUST show ${angle.city} visually.` : "";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SPRING_SYSTEM_PROMPT },
        { role: "user", content: `Generate ${count} spring draft(s). Angle: ${angle.angle}. Audience: ${angle.audience}. Pillar: ${angle.pillar}. Focus: ${angle.focus}. ${cityNote} For Transformation: use illustrated split-panel OR emotional transformation — NOT literal dirty/clean photos. Schema: ${SPRING_SCHEMA}. Return JSON array only.` }
      ],
      temperature: 0.8, max_tokens: 3500
    })
  });
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "[]";
  try { return JSON.parse(raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()); }
  catch { return []; }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const body = await req.json().catch(() => ({}));
    const { angles, drafts_per_angle = 1 } = body;

    const targets = angles ? SPRING_ANGLES.filter(a => angles.includes(a.angle)) : SPRING_ANGLES;
    console.log(`[Spring v2] Generating ${targets.length} angles with inline images...`);

    const created: any[] = [], skipped: any[] = [];

    for (const angle of targets) {
      const drafts = await generateSpringText(angle, drafts_per_angle);

      for (const draft of drafts) {
        const avg = ((draft.clarity_score || 0) + (draft.relatability_score || 0) + (draft.conversion_score || 0)) / 3;
        const status = avg >= 7.5 ? "Approved" : avg >= 5 ? "Draft" : "Rejected";

        if (status === "Rejected") {
          skipped.push({ angle: angle.angle, title: draft.title, avg: avg.toFixed(1) });
          continue;
        }

        // ✅ GENERATE IMAGE INLINE
        console.log(`[Spring v2] Generating image for: "${draft.title}"...`);
        const image_url = await generateImageForDraft({
          pillar: angle.pillar,
          city: angle.city || null,
          audience: draft.audience,
          image_prompt: draft.image_prompt || `Spring cleaning scene: bright spring light, fresh flowers, sparkling surfaces. PureTask blue #0099FF. ${angle.city ? `Show ${angle.city} visually.` : ''}`
        });

        const record = await db.ContentDraft.create({
          ...draft,
          status,
          image_url: image_url || null,
          city: angle.city || null,
          pillar: angle.pillar,
          campaign_tag: "Spring 2026",
          week_tag: `Spring-${new Date().toISOString().split("T")[0]}`,
          heygen_status: (draft.script_30sec || draft.script_15sec) ? "Queued" : "None",
          posted_platforms: "",
          is_winner: false
        });

        created.push({ id: record.id, angle: angle.angle, title: draft.title, pillar: angle.pillar, status, avg: avg.toFixed(1), has_image: !!image_url });
        console.log(`[Spring v2] ✅ "${draft.title}" (${avg.toFixed(1)}) → ${status} | Image: ${image_url ? '✅' : '❌'}`);

        await new Promise(r => setTimeout(r, 12000)); // DALL-E 3 rate limit
      }
    }

    return Response.json({
      ok: true,
      angles_processed: targets.length,
      drafts_created: created.length,
      approved: created.filter(c => c.status === "Approved").length,
      images_generated: created.filter(c => c.has_image).length,
      created,
      skipped
    });

  } catch (error: any) {
    console.error("[Spring v2 Error]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
