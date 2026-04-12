// PureTask Seniors Content Generator v2.0
// IMAGE GENERATED INLINE AT CREATION — not as afterthought
// Two audiences: Seniors (self-booking) + Adult Children (booking for parents)

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { generateImageForDraft, buildImagePrompt, generateDalleImage, PILLAR_VISUAL_GUIDE } from './generateImages.ts';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const SENIORS_SYSTEM_PROMPT = `You are the PureTask AI content engine generating content for the Seniors audience segment.
PureTask is a trust-first home cleaning marketplace at https://www.puretask.co.

TWO TARGET AUDIENCES:
1. SENIORS (65+) booking for themselves — want dignity, independence, familiarity, safety
2. ADULT CHILDREN (35-55) booking for parents — want peace of mind, safety verification, reliability

KEY MESSAGES:
- Same cleaner every visit = familiarity and trust (#1 feature for this audience)
- GPS arrival/departure notifications = adult children always know who is there and when
- Criminal background check + ID verification renewed annually = real safety
- 4.9★ · 98% satisfaction · 2,400+ verified cleaners = proven reliability
- Book in minutes — simple, no contracts, pay only when you approve

TONE — CRITICAL:
- NEVER use the word "elderly" — use "parents", "seniors", "your mom/dad"
- NEVER show frail or helpless imagery — show capable, dignified, active people
- Warm, caring, reassuring — like a trusted family recommendation

EMOTIONAL ARC:
Adult children: Worry → Relief ("I know exactly who's in their home")
Seniors: Uncertainty → Confidence ("My cleaner is vetted, familiar, trusted")

LOCKED: URL https://www.puretask.co in EVERY caption. Stats: 4.9★ | 2,400+ cleaners | 98% | 10K+ clients.
BONUS +1 Relatability: same-cleaner OR intergenerational angle OR GPS notification.
PENALTY -2 Relatability: uses "elderly" OR generic hook.
Score v3.0 — 7.5+ required. OUTPUT: Valid JSON array only.`;

const SENIORS_SCHEMA = `[{
  "title": "warm specific seniors title",
  "audience": "Seniors or Adult Children / Families",
  "pillar": "Trust",
  "hook": "specific emotional warm hook — NOT generic",
  "primary_caption": "3-4 sentences. Warm tone. Ends: https://www.puretask.co",
  "cta_1": "Book a trusted cleaner → https://www.puretask.co",
  "cta_2": "Same cleaner, every visit → https://www.puretask.co",
  "cta_3": "Give your parents peace of mind → https://www.puretask.co",
  "image_prompt": "DALL-E 3 — warm intergenerational scene OR dignified senior in clean home. Warm lighting. PureTask blue #0099FF accent. NOT frail. NOT stock photo.",
  "script_45sec": "45s warm VO. GPS + background check mentioned. Ends: Visit https://www.puretask.co",
  "script_30sec": "30s version. Same warm tone. Ends: Visit https://www.puretask.co",
  "platform_facebook": "Warm, practical. 3-5 hashtags: #SeniorLiving #AgingInPlace #PureTask. URL included.",
  "platform_instagram": "Emotional, visual-first. 8-15 hashtags. URL included.",
  "platform_linkedin": "Professional adult-children angle. URL included.",
  "platform_pinterest": "Aspirational home + safety. 8-12 hashtags. URL included.",
  "platform_x": "<280 chars. Warm + stats + URL.",
  "platform_youtube": "60s warm storytelling description. URL included.",
  "clarity_score": 8,
  "relatability_score": 8,
  "conversion_score": 8,
  "editor_notes": "why this seniors post works"
}]`;

const SENIORS_ANGLES = [
  { angle: "same_cleaner", segment: "Seniors", focus: "Same cleaner every visit = familiarity, trust, no surprises." },
  { angle: "gps_safety", segment: "Adult Children", focus: "GPS arrival/departure — you always know when cleaner arrived and left." },
  { angle: "background_checks", segment: "Adult Children", focus: "Criminal background check, ID verification, sex offender registry renewed annually." },
  { angle: "independence", segment: "Seniors", focus: "A clean home helps seniors stay independent longer. Smart choice, not giving up." },
  { angle: "reliability_proof", segment: "Seniors", focus: "4.9★, 98% satisfaction, 2,400+ verified cleaners. Stats that matter when someone enters your home." },
  { angle: "gift_angle", segment: "Adult Children", focus: "Booking a clean for your parents is the most meaningful practical gift you can give." },
  { angle: "stress_relief", segment: "Adult Children", focus: "Worrying about parents' home being clean and safe is exhausting. PureTask removes that mental load." },
  { angle: "booking_simplicity", segment: "Seniors", focus: "Book online in 3 minutes. Simple, no contracts, pay only when you approve." },
];

async function generateSeniorsText(angle: any, count: number): Promise<any[]> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SENIORS_SYSTEM_PROMPT },
        { role: "user", content: `Generate ${count} seniors draft(s). Angle: ${angle.angle}. Segment: ${angle.segment}. Focus: ${angle.focus}. NEVER use "elderly". Primary platform: Facebook. YouTube script required. Schema: ${SENIORS_SCHEMA}. Return JSON array only.` }
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

    const targets = angles ? SENIORS_ANGLES.filter(a => angles.includes(a.angle)) : SENIORS_ANGLES;
    console.log(`[Seniors v2] Generating ${targets.length} angles with inline images...`);

    const created: any[] = [], skipped: any[] = [];

    for (const angle of targets) {
      const drafts = await generateSeniorsText(angle, drafts_per_angle);

      for (const draft of drafts) {
        const avg = ((draft.clarity_score || 0) + (draft.relatability_score || 0) + (draft.conversion_score || 0)) / 3;
        const status = avg >= 7.5 ? "Approved" : avg >= 5 ? "Draft" : "Rejected";

        if (status === "Rejected") {
          skipped.push({ angle: angle.angle, title: draft.title, avg: avg.toFixed(1) });
          continue;
        }

        // ✅ GENERATE IMAGE INLINE — before saving to DB
        console.log(`[Seniors v2] Generating image for: "${draft.title}"...`);
        const image_url = await generateImageForDraft({
          pillar: "Trust",
          audience: draft.audience,
          image_prompt: draft.image_prompt || `Warm intergenerational scene: ${angle.segment === "Seniors" ? "dignified senior in a familiar clean home, warm lighting" : "adult child on phone checking GPS notification, relief on face"}. PureTask blue #0099FF accent. Professional, warm, NOT stock photo.`
        });

        // Save draft WITH image_url already populated
        const record = await db.ContentDraft.create({
          ...draft,
          status,
          image_url: image_url || null,
          pillar: "Trust",
          campaign_tag: "Seniors Campaign",
          week_tag: week_tag || `Seniors-${new Date().toISOString().split("T")[0]}`,
          heygen_status: (draft.script_45sec || draft.script_30sec) ? "Queued" : "None",
          posted_platforms: "",
          is_winner: false
        });

        created.push({
          id: record.id,
          angle: angle.angle,
          segment: angle.segment,
          title: draft.title,
          status,
          avg: avg.toFixed(1),
          has_image: !!image_url
        });
        console.log(`[Seniors v2] ✅ "${draft.title}" (${avg.toFixed(1)}) → ${status} | Image: ${image_url ? '✅' : '❌'}`);

        // DALL-E 3 rate limit: 12s between requests
        await new Promise(r => setTimeout(r, 12000));
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
    console.error("[Seniors v2 Error]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
