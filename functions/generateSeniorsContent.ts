// PureTask Seniors Content Generator v1.0
// Two audiences: Seniors (self-booking) + Adult Children (booking for parents)
// Primary platforms: Facebook, Instagram, YouTube
// Key differentiators: same cleaner, background checks, GPS notifications

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const SENIORS_SYSTEM_PROMPT = `You are the PureTask AI content engine generating content for the Seniors audience segment.
PureTask is a trust-first home cleaning marketplace at https://www.puretask.co.

TWO TARGET AUDIENCES:
1. SENIORS (65+) booking for themselves — want dignity, independence, familiarity, safety
2. ADULT CHILDREN (35-55) booking for parents — want peace of mind, safety verification, reliability

KEY MESSAGES FOR SENIORS CONTENT:
- Same cleaner every visit = familiarity and trust (most important feature for this audience)
- GPS arrival/departure notifications = adult children know exactly who is there and when
- Criminal background check + ID verification renewed annually = real safety, not just a promise
- 4.9★ average rating + 98% satisfaction + 2,400+ verified cleaners = proven reliability
- Book in minutes online — simple process, no complicated signup

TONE RULES — CRITICAL:
- NEVER use the word "elderly" — use "parents", "seniors", "your mom/dad", or just show the scenario
- NEVER show frail or helpless imagery — show capable, dignified, active people
- Warm, caring, reassuring — like a trusted family recommendation
- Speak TO adult children like a caring peer, not a salesperson
- Speak TO seniors with full respect — they are capable adults making smart choices

EMOTIONAL TRANSFORMATION:
Adult children: Worry → Relief ("I know exactly who's in their home")
Seniors: Uncertainty → Confidence ("My cleaner is vetted, familiar, and trusted")

LOCKED CONSTANTS:
- URL: https://www.puretask.co — in EVERY caption on EVERY platform
- Stats: 4.9★ | 2,400+ verified cleaners | 98% satisfaction | 10,000+ clients
- NEVER use the word "elderly"
- Image prompts must show warm, dignified, real people — NOT stock photo feel

SCORING v3.0 — 7.5+ required:
- BONUS +1 Relatability: mentions same-cleaner consistency OR intergenerational angle OR GPS notification
- PENALTY -2 Relatability: uses "elderly" OR shows frail imagery OR hook is generic
- PENALTY -3 Conversion: no Apply/Book CTA with URL

OUTPUT: Valid JSON array only. No markdown. No text outside JSON.`;

const SENIORS_SCHEMA = `Each draft object MUST contain:
{
  "title": "Seniors-focused title — warm and specific",
  "audience": "Seniors" or "Adult Children / Families",
  "pillar": "Trust",
  "hook": "Specific, emotional, warm hook — NOT generic",
  "primary_caption": "3-4 sentences. Warm tone. Ends with https://www.puretask.co",
  "cta_1": "Book a trusted cleaner → https://www.puretask.co",
  "cta_2": "Same cleaner, every visit → https://www.puretask.co",
  "cta_3": "Give your parents peace of mind → https://www.puretask.co",
  "image_prompt": "DALL-E 3 — warm intergenerational scene OR dignified senior in clean home. Warm lighting. PureTask blue #0099FF accent. NOT frail or helpless. NOT stock photo feel.",
  "script_45sec": "45s warm voiceover. GPS + background check mentioned. Ends: Visit https://www.puretask.co",
  "script_30sec": "30s version. Same tone. Ends: Visit https://www.puretask.co",
  "platform_facebook": "Warm, practical, 3-5 hashtags including #SeniorLiving #AgingInPlace. URL included.",
  "platform_instagram": "Emotional, visual-first, 8-15 hashtags. URL included.",
  "platform_linkedin": "Professional angle for adult children. URL included.",
  "platform_pinterest": "Aspirational home + safety. 8-12 hashtags. URL included.",
  "platform_x": "Under 280 chars. Warm + stats + URL.",
  "platform_youtube": "60s video description. Warm storytelling format. URL included.",
  "clarity_score": number,
  "relatability_score": number,
  "conversion_score": number,
  "editor_notes": "Why this seniors post works"
}`;

const SENIORS_ANGLES = [
  { angle: "same_cleaner", segment: "Seniors", focus: "Same cleaner every visit = familiarity, trust, no surprises. The comfort of knowing exactly who's coming.", hook_direction: "Consistency and trust" },
  { angle: "gps_safety", segment: "Adult Children", focus: "GPS arrival/departure notification means adult children always know when cleaner arrived and left. Real-time peace of mind.", hook_direction: "You can't always be there — but you'll always know" },
  { angle: "background_checks", segment: "Adult Children", focus: "Criminal background check, ID verification, sex offender registry check renewed annually. Real vetting, not just a checkbox.", hook_direction: "The question every adult child asks before booking" },
  { angle: "independence", segment: "Seniors", focus: "A clean home helps seniors stay independent longer. It's not about needing help — it's about making smart choices.", hook_direction: "Independence and dignity" },
  { angle: "reliability_proof", segment: "Seniors", focus: "4.9★, 98% satisfaction, 2,400+ verified cleaners. The stats that matter when someone is coming into your home.", hook_direction: "Trust built on real numbers" },
  { angle: "gift_angle", segment: "Adult Children", focus: "Booking a clean for your parents is one of the most meaningful, practical gifts you can give. Not just for holidays.", hook_direction: "The gift that keeps giving" },
  { angle: "stress_relief", segment: "Adult Children", focus: "Worrying about whether parents' home is clean and safe is exhausting. PureTask removes that mental load entirely.", hook_direction: "One less thing to worry about" },
  { angle: "booking_simplicity", segment: "Seniors", focus: "Book online in 3 minutes. Simple, no contracts, pay only when you approve the result. Built for everyone.", hook_direction: "Simple, trustworthy, no hassle" },
];

async function generateSeniorsDraft(angle: typeof SENIORS_ANGLES[0], count: number): Promise<any[]> {
  const userPrompt = `Generate ${count} seniors content draft(s) for PureTask.

Angle: ${angle.angle}
Target segment: ${angle.segment}
Focus: ${angle.focus}
Hook direction: ${angle.hook_direction}

Requirements:
- Primary platform: Facebook (this audience is 58% daily Facebook users)
- YouTube script required (55+ watches YouTube heavily)
- NEVER use "elderly" — use "parents", "seniors", "your mom", "your dad"
- Show warm dignity — this audience is capable and deserves respect
- GPS notification and same-cleaner consistency are the #1 and #2 trust features for this audience
- Score honestly — 7.5+ required after penalties

Schema: ${SENIORS_SCHEMA}

Return JSON array of ${count} objects. No markdown.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SENIORS_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.75, max_tokens: 3500
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
    const { angles, drafts_per_angle = 1, week_tag = "" } = body;

    const targets = angles ? SENIORS_ANGLES.filter(a => angles.includes(a.angle)) : SENIORS_ANGLES;
    console.log(`[Seniors] Generating ${targets.length} angles...`);

    const created: any[] = [], skipped: any[] = [];

    for (const angle of targets) {
      const drafts = await generateSeniorsDraft(angle, drafts_per_angle);

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
          pillar: "Trust",
          campaign_tag: "Seniors Campaign",
          week_tag: week_tag || `Seniors-${new Date().toISOString().split("T")[0]}`,
          heygen_status: (draft.script_45sec || draft.script_30sec) ? "Queued" : "None",
          posted_platforms: "",
          is_winner: false
        });

        created.push({ id: record.id, angle: angle.angle, segment: angle.segment, title: draft.title, status, avg: avg.toFixed(1) });
        console.log(`[Seniors] ✅ ${draft.title} (${avg.toFixed(1)}) → ${status}`);
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
    console.error("[Seniors Error]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
