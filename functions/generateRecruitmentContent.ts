// PureTask Recruitment Content Generator v1.0
// Targets cleaners / gig workers — LinkedIn + TikTok primary platforms
// Key message: Keep 80-85% vs TaskRabbit 30% / Handy 35%

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const RECRUITMENT_SYSTEM_PROMPT = `You are the PureTask AI content engine generating recruitment content targeting professional cleaners and gig workers.
PureTask is a trust-first home cleaning marketplace at https://www.puretask.co.

TARGET AUDIENCES FOR RECRUITMENT CONTENT:
1. Current TaskRabbit/Handy cleaners frustrated with high fees
2. Independent cleaners wanting more clients
3. Gig workers looking for flexible income
4. People considering cleaning as a side hustle or full-time business

KEY RECRUITMENT DIFFERENTIATORS — use these aggressively:
- Cleaners keep 80-85% of every booking (TaskRabbit takes ~30%, Handy takes ~35%)
- Set your own rate: $20–$65/hr
- Choose your own clients and schedule — full flexibility
- Reliability Score builds your reputation — better score = premium jobs
- Tier system: Bronze → Silver → Gold → Platinum — more tiers = more visibility
- Credits system — you get paid reliably, no payment chasing
- 2,400+ verified cleaners already earning on PureTask
- 10,000+ homeowners actively booking

EMOTIONAL TRIGGERS FOR CLEANERS:
- Empowerment: "You do the work — you should keep the money"
- Independence: "Your business, your rules"
- Fairness: "Stop letting apps take 35% of your hard work"
- Opportunity: "Grow from Bronze to Platinum — better score = better clients"
- Community: "2,400+ cleaners already building their business on PureTask"

TONE FOR RECRUITMENT CONTENT:
- Direct and honest — cleaners are smart, don't BS them
- Empowering — they're running a business, not just doing a job
- Comparison-friendly — calling out TaskRabbit/Handy fees is fair game
- Never condescending — speak cleaner-to-cleaner, not top-down

LOCKED CONSTANTS:
- URL: https://www.puretask.co — in EVERY caption, EVERY platform
- Stats: 2,400+ cleaners | 10,000+ clients | 4.9★ | 80-85% earnings | 50+ cities
- Competitor fees: TaskRabbit ~30% | Handy ~35% | PureTask keeps 15-20%

SCORING v3.0 — 7.5+ required:
- Clarity: Does a cleaner instantly understand the earnings advantage and what to do?
- Relatability: Does it feel like it was written by someone who actually cleans?
- Conversion: Does it make them click to apply RIGHT NOW?
- PENALTY: -3 conversion if no clear "Apply" or "Join" CTA with URL
- PENALTY: -2 relatability if doesn't mention specific earnings %
- PENALTY: -2 clarity if URL missing

OUTPUT: Valid JSON array only. No markdown. No text outside JSON.`;

const RECRUITMENT_DRAFT_SCHEMA = `Each recruitment draft object MUST contain:
{
  "title": "Recruitment-focused title — implies earning opportunity",
  "audience": "Cleaners / Gig Workers",
  "pillar": "Recruitment",
  "hook": "Earnings-focused or fairness-focused scroll stopper",
  "primary_caption": "3-4 sentences. Mentions % comparison. Ends with https://www.puretask.co",
  "cta_1": "Apply at https://www.puretask.co",
  "cta_2": "Start earning more → https://www.puretask.co",
  "cta_3": "See cleaner reviews → https://www.puretask.co",
  "image_prompt": "DALL-E 3 prompt — professional cleaner looking empowered/happy, bright modern space, PureTask blue (#0099FF) accent. NOT sad or servile — confident and professional.",
  "script_15sec": "15s recruiter voiceover. Mentions 80-85%. Ends: Apply at https://www.puretask.co",
  "script_30sec": "30s recruiter voiceover. Full comparison pitch. Ends: Apply at https://www.puretask.co",
  "platform_linkedin": "Professional tone. Earnings data. Career framing. 3-5 hashtags. URL included.",
  "platform_tiktok": "Fast hook. Direct % comparison. POV format. URL included.",
  "platform_facebook": "Community feel. Earnings story. 3-5 hashtags. URL included.",
  "platform_instagram": "Empowering visual-first. 8-15 hashtags. URL included.",
  "platform_x": "Under 280 chars. % comparison + URL.",
  "clarity_score": number,
  "relatability_score": number,
  "conversion_score": number,
  "editor_notes": "Why this recruitment post works"
}`;

const RECRUITMENT_ANGLES = [
  { angle: "earnings_comparison", focus: "Direct % comparison: 80-85% vs TaskRabbit 30% / Handy 35%", audience: "Current TaskRabbit/Handy cleaners" },
  { angle: "flexibility", focus: "Set your own rate ($20-$65/hr), choose your own clients, own your schedule", audience: "Independent cleaners" },
  { angle: "tier_growth", focus: "Bronze → Platinum tier system — better reliability score = better paying clients", audience: "Cleaners wanting to grow" },
  { angle: "side_hustle", focus: "Start earning $500-$2000/month cleaning on your own schedule", audience: "People considering cleaning" },
  { angle: "fairness", focus: "Stop giving 35% to an app. You do the work — keep what you earn", audience: "Frustrated gig workers" },
  { angle: "community", focus: "2,400+ verified cleaners already building their business on PureTask", audience: "Social proof for new cleaners" }
];

async function generateRecruitmentDrafts(angle: typeof RECRUITMENT_ANGLES[0], count: number): Promise<any[]> {
  const userPrompt = `Generate ${count} high-converting recruitment content draft(s) for PureTask targeting cleaners.

Angle: ${angle.angle}
Primary focus: ${angle.focus}
Target: ${angle.audience}

Requirements:
- Lead with the earnings advantage — 80-85% is the #1 differentiator
- Be specific about competitor fees if relevant to this angle
- Make the CTA feel urgent and easy — "Apply takes 5 minutes"
- Score honestly — 7.5+ after penalties required
- LinkedIn and TikTok are primary platforms for this content

${RECRUITMENT_DRAFT_SCHEMA}

Return a JSON array of ${count} draft objects. No markdown fences.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: RECRUITMENT_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.75,
      max_tokens: 3500
    })
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "[]";

  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.log("Parse error:", raw.substring(0, 200));
    return [];
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const body = await req.json().catch(() => ({}));
    const { angles, drafts_per_angle = 1, week_tag = "" } = body;

    const targetAngles = angles
      ? RECRUITMENT_ANGLES.filter(a => angles.includes(a.angle))
      : RECRUITMENT_ANGLES; // default: all 6 angles

    console.log(`[Recruitment] Generating ${targetAngles.length} angles, ${drafts_per_angle} each...`);

    const created: any[] = [];
    const skipped: any[] = [];

    for (const angle of targetAngles) {
      console.log(`[Recruitment] Angle: ${angle.angle}...`);
      const drafts = await generateRecruitmentDrafts(angle, drafts_per_angle);

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
          audience: "Cleaners / Gig Workers",
          pillar: "Recruitment",
          week_tag: week_tag || `Recruitment-${new Date().toISOString().split("T")[0]}`,
          campaign_tag: "Cleaner Recruitment Campaign",
          heygen_status: (draft.script_30sec || draft.script_15sec) ? "Queued" : "None",
          posted_platforms: "",
          is_winner: false
        });

        created.push({ id: record.id, angle: angle.angle, title: draft.title, status, avg: avg.toFixed(1) });
        console.log(`[Recruitment] ✅ ${draft.title} (${avg.toFixed(1)}) → ${status}`);
      }

      await new Promise(r => setTimeout(r, 800));
    }

    return Response.json({
      ok: true,
      angles_processed: targetAngles.length,
      drafts_created: created.length,
      drafts_skipped: skipped.length,
      approved: created.filter(c => c.status === "Approved").length,
      created,
      skipped
    });

  } catch (error: any) {
    console.error("[Recruitment Error]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
