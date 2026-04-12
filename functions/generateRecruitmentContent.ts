// PureTask Recruitment Content Generator v2.0
// IMAGE GENERATED INLINE AT CREATION — not as afterthought

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { generateImageForDraft } from './generateImages.ts';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const RECRUITMENT_SYSTEM_PROMPT = `You are the PureTask AI content engine generating recruitment content targeting professional cleaners and gig workers.
PureTask is a trust-first home cleaning marketplace at https://www.puretask.co.
Key message: Cleaners keep 80-85% vs TaskRabbit 30% / Handy 35%.
Tone: Direct, empowering, honest. Speak cleaner-to-cleaner.
NEVER condescending. They're running a business, not just doing a job.
URL: https://www.puretask.co in EVERY caption. Stats: 2,400+ cleaners | 80-85% earnings | $20-65/hr | 50+ cities.
PENALTY -3 conversion: no clear Apply/Join CTA with URL. PENALTY -2 relatability: no earnings % mentioned.
Score v3.0 — 7.5+ required. OUTPUT: Valid JSON array only.`;

const RECRUITMENT_SCHEMA = `[{
  "title": "Recruitment title — implies earning opportunity",
  "audience": "Cleaners / Gig Workers",
  "pillar": "Recruitment",
  "hook": "Earnings-focused or fairness-focused scroll stopper",
  "primary_caption": "3-4 sentences. % comparison. Ends: https://www.puretask.co",
  "cta_1": "Apply at https://www.puretask.co",
  "cta_2": "Start earning more → https://www.puretask.co",
  "cta_3": "See cleaner reviews → https://www.puretask.co",
  "image_prompt": "DALL-E 3 — empowered confident professional cleaner. Arms crossed, smiling, proud. Bright modern space. PureTask blue #0099FF. NOT sad or servile.",
  "script_15sec": "15s recruiter VO. Mentions 80-85%. Ends: Apply at https://www.puretask.co",
  "script_30sec": "30s full comparison pitch. Ends: Apply at https://www.puretask.co",
  "platform_linkedin": "Professional. Earnings data. Career framing. 3-5 hashtags. URL.",
  "platform_tiktok": "Fast hook. Direct % comparison. POV format. URL.",
  "platform_facebook": "Community feel. Earnings story. 3-5 hashtags. URL.",
  "platform_instagram": "Empowering visual-first. 8-15 hashtags. URL.",
  "platform_x": "<280 chars. % comparison + URL.",
  "clarity_score": 8,
  "relatability_score": 8,
  "conversion_score": 8,
  "editor_notes": "why this recruitment post works"
}]`;

const RECRUITMENT_ANGLES = [
  { angle: "earnings_comparison", focus: "Direct % comparison: 80-85% vs TaskRabbit 30% / Handy 35%" },
  { angle: "flexibility", focus: "Set your own rate $20-65/hr, choose your clients, own your schedule" },
  { angle: "tier_growth", focus: "Bronze → Platinum tier system — better reliability score = better paying clients" },
  { angle: "side_hustle", focus: "Start earning $500-$2000/month cleaning on your own schedule" },
  { angle: "fairness", focus: "Stop giving 35% to an app. You do the work — keep what you earn" },
  { angle: "community", focus: "2,400+ verified cleaners already building their business on PureTask" },
];

async function generateRecruitmentText(angle: any, count: number): Promise<any[]> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: RECRUITMENT_SYSTEM_PROMPT },
        { role: "user", content: `Generate ${count} recruitment draft(s). Angle: ${angle.angle}. Focus: ${angle.focus}. Lead with earnings advantage 80-85%. CTA: "Apply takes 5 minutes". Schema: ${RECRUITMENT_SCHEMA}. JSON array only.` }
      ],
      temperature: 0.75, max_tokens: 3500
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
    const { angles, drafts_per_angle = 1, week_tag = "" } = body;

    const targets = angles ? RECRUITMENT_ANGLES.filter(a => angles.includes(a.angle)) : RECRUITMENT_ANGLES;
    console.log(`[Recruitment v2] Generating ${targets.length} angles with inline images...`);

    const created: any[] = [], skipped: any[] = [];

    for (const angle of targets) {
      const drafts = await generateRecruitmentText(angle, drafts_per_angle);

      for (const draft of drafts) {
        const avg = ((draft.clarity_score || 0) + (draft.relatability_score || 0) + (draft.conversion_score || 0)) / 3;
        const status = avg >= 7.5 ? "Approved" : avg >= 5 ? "Draft" : "Rejected";

        if (status === "Rejected") {
          skipped.push({ angle: angle.angle, title: draft.title, avg: avg.toFixed(1) });
          continue;
        }

        // ✅ GENERATE IMAGE INLINE
        console.log(`[Recruitment v2] Generating image for: "${draft.title}"...`);
        const image_url = await generateImageForDraft({
          pillar: "Recruitment",
          audience: "Cleaners / Gig Workers",
          image_prompt: draft.image_prompt || "Empowered confident professional cleaner, arms crossed, smiling, proud of their work. Bright modern clean home. PureTask blue #0099FF accent. NOT sad or servile — confident business owner energy."
        });

        const record = await db.ContentDraft.create({
          ...draft,
          status,
          image_url: image_url || null,
          audience: "Cleaners / Gig Workers",
          pillar: "Recruitment",
          week_tag: week_tag || `Recruitment-${new Date().toISOString().split("T")[0]}`,
          campaign_tag: "Cleaner Recruitment Campaign",
          heygen_status: (draft.script_30sec || draft.script_15sec) ? "Queued" : "None",
          posted_platforms: "",
          is_winner: false
        });

        created.push({ id: record.id, angle: angle.angle, title: draft.title, status, avg: avg.toFixed(1), has_image: !!image_url });
        console.log(`[Recruitment v2] ✅ "${draft.title}" → ${status} | Image: ${image_url ? '✅' : '❌'}`);

        await new Promise(r => setTimeout(r, 12000));
      }
    }

    return Response.json({
      ok: true,
      angles_processed: targets.length,
      drafts_created: created.length,
      images_generated: created.filter(c => c.has_image).length,
      approved: created.filter(c => c.status === "Approved").length,
      created,
      skipped
    });

  } catch (error: any) {
    console.error("[Recruitment v2 Error]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
