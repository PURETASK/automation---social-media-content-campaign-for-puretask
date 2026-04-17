// PureTask Seniors Content Generator v3.0
// ─────────────────────────────────────────────────────────────────────────────
// FIXES from v2.0:
//   ❌ v2.0: GPT set image_prompt — always returned generic "warm intergenerational" blob
//   ✅ v3.0: image_prompt removed from GPT schema — built server-side per angle+segment
//   ✅ v3.0: buildSeniorsImagePrompt() creates specific prompts per angle
//   ✅ v3.0: Uses Base44 native image gen (no OpenAI billing for images)
//   ✅ v3.0: 12s DALL-E delay removed — Base44 image gen has no rate limit
// ─────────────────────────────────────────────────────────────────────────────

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { generateImageForDraft } from './generateImages.ts';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const BRAND_URL   = "https://www.puretask.co";
const BRAND_STATS = "4.9★ rating · 2,400+ verified cleaners · 98% satisfaction · 10,000+ clients";

// ── Image prompt builder — per angle, NOT generic ────────────────────────────
function buildSeniorsImagePrompt(angle: string, segment: string): string {
  const BRAND_PREFIX = `Magazine-quality lifestyle photography for PureTask, a premium home cleaning marketplace. Brand: warm, trustworthy, dignified, human. PureTask blue #0099FF accents. Style: real lifestyle photography — NOT stock, NOT medical, NOT staged.`;

  const ANGLE_SCENES: Record<string, string> = {
    same_cleaner:
      `Warm familiar moment: a senior homeowner (early 70s, dignified, NOT frail) opening the door with a genuine smile to greet the same friendly professional cleaner they recognize. Natural warm morning light. Real ID badge visible on cleaner's uniform. The comfort and trust of seeing a familiar face. Human, warm, real.`,
    gps_safety:
      `Adult child (mid-40s) at work or in their car, looking at phone with visible relief on their face. Phone screen shows a friendly notification: "Your cleaner has arrived at Mom's home." Expression shifts from subtle worry to clear relief. Warm, human, real moment. NOT staged.`,
    background_checks:
      `Clean premium infographic on white background: PureTask blue #0099FF. Features highlighted: "✅ Criminal Background Check" · "✅ Annual ID Verification" · "✅ Sex Offender Registry Checked" · "✅ 2,400+ Verified Cleaners." Trust and safety radiate. Apple-product-marketing minimal aesthetic.`,
    independence:
      `Warm dignified scene: senior woman or man in their early-to-mid 70s, NOT frail, sitting comfortably in a spotlessly clean bright home with a cup of tea or coffee. Organized, clean surroundings. Fresh flowers. Warm golden afternoon light. Independence and comfort visible. Adult child may be present with warm smile.`,
    reliability_proof:
      `Clean premium proof infographic: white background, PureTask blue #0099FF. Large bold stats: "4.9★ Average Rating" · "98% Satisfaction Rate" · "2,400+ Verified Cleaners" · "10,000+ Happy Clients." Trustworthy, credible. Minimal, clear, impactful.`,
    gift_angle:
      `Warm intergenerational moment: adult daughter or son (mid-40s) and their parent (early 70s, dignified) sitting together in a beautifully clean, bright living room. Both relaxed and smiling. Clean organized home around them. Warm afternoon light. The peace of mind of having helped. Real, emotional, warm.`,
    stress_relief:
      `Adult child (mid-40s) at home, visibly relaxed, phone in hand with a PureTask confirmation screen visible. Background shows a clean bright home. Expression of relief and peace — the mental weight lifted. Warm home environment. Real, human, relatable.`,
    booking_simplicity:
      `Senior (early-to-mid 70s, NOT frail) sitting comfortably at a kitchen table or on a couch, easily using a phone or tablet to book a cleaning. Clean bright home around them. Warm natural light. Simple, empowering moment — showing technology is accessible and easy. Warm, dignified, real.`,
  };

  const scene = ANGLE_SCENES[angle] ?? `Warm dignified senior in a beautifully clean bright home. Golden afternoon light, fresh flowers, organized space. Peace of mind and independence. PureTask blue #0099FF accent. Real, warm — NOT medical, NOT stock.`;

  return `${BRAND_PREFIX}

VISUAL SCENE:
${scene}

IMPORTANT RULES:
- NEVER show frail, helpless, or medically vulnerable people
- NEVER use the word "elderly" in any text overlay
- Warm, dignified, capable people in comfortable clean homes
- Always include a subtle PureTask blue #0099FF design element`.slice(0, 3900);
}

// ── GPT system prompt ─────────────────────────────────────────────────────────
const SENIORS_SYSTEM_PROMPT = `You are the PureTask AI content engine generating content for the Seniors audience segment. PureTask is a trust-first home cleaning marketplace at ${BRAND_URL}.

TWO TARGET AUDIENCES:
1. SENIORS (65+) booking for themselves — want dignity, independence, familiarity, safety, simplicity
2. ADULT CHILDREN (35-55) booking for parents — want peace of mind, safety verification, GPS tracking, reliability

KEY FEATURES TO HIGHLIGHT (use the ones that match the angle):
- Same cleaner every visit = familiarity, no strangers, real trust
- GPS arrival/departure notifications = adult children always know who's there and when
- Criminal background check + ID verification + sex offender registry checked annually
- ${BRAND_STATS}
- Book in 3 minutes — no contracts, pay only when you approve

TONE — CRITICAL:
- NEVER use the word "elderly" — use "parents", "seniors", "your mom", "your dad"
- NEVER imply helplessness or frailty — show dignity, capability, independence
- Warm, caring, reassuring — like a trusted family recommendation
- Speak to adult children as equals who are doing the right thing for their family

EMOTIONAL ARCS:
Adult children: Worry/guilt → Relief → Peace of mind
Seniors: Uncertainty/effort → Comfort → Independence maintained

SCORING v3.0 (be honest — skeptical consumer grades):
Clarity (1-10): Stranger instantly understands PureTask + what to do?
Relatability (1-10): Makes target stop and say "that's literally me"?
Conversion (1-10): Makes them click/book RIGHT NOW?
BONUS +1 Relatability: same-cleaner angle OR GPS notification OR intergenerational warmth
PENALTY -2 Relatability: uses "elderly" OR generic hook ("Are you tired of...")
Auto-approve: avg ≥ 7.5 | Draft: 5.0-7.4 | Reject: <5.0

RULES:
- ${BRAND_URL} in EVERY platform caption, every time
- Real stats only: ${BRAND_STATS}
- One emotional transformation per post
- Platform copy MUST be adapted, NOT copy-pasted`;

// ── GPT schema — NO image_prompt (built server-side) ─────────────────────────
const SENIORS_SCHEMA = `[{
  "title": "Warm specific title — NOT generic",
  "audience": "Seniors or Adult Children (35-55)",
  "pillar": "Trust",
  "hook": "Specific warm scroll-stopper. Makes target audience say 'that's me.' NOT generic.",
  "primary_caption": "3-4 sentences. Warm tone. Pain → PureTask solution → peace of mind. Ends: ${BRAND_URL}",
  "short_caption": "1-2 sentences. Punchy warm CTA. Ends: ${BRAND_URL}",
  "long_caption": "5-7 sentences. Full warm story. Emotional arc. Real stats. Ends: ${BRAND_URL}",
  "cta_1": "Warm specific action CTA → ${BRAND_URL}",
  "cta_2": "Second angle CTA → ${BRAND_URL}",
  "cta_3": "Third angle CTA → ${BRAND_URL}",
  "script_30sec": "~75 words. Natural spoken language, warm tone. Feature relevant to angle. Ends: Visit ${BRAND_URL}",
  "script_45sec": "~110 words. Full warm story. GPS or same-cleaner feature natural mention. Ends: Visit ${BRAND_URL}",
  "platform_facebook": "Warm, practical, community feel. 3-5 hashtags: #SeniorLiving #AgingInPlace #PureTask. MUST end: ${BRAND_URL}",
  "platform_instagram": "Emotional, visual-first, warm. 8-15 hashtags. MUST end: ${BRAND_URL}",
  "platform_linkedin": "Professional adult-children angle. Trust + reliability. MUST end: ${BRAND_URL}",
  "platform_pinterest": "Aspirational home + safety. 8-12 keyword hashtags. MUST end: ${BRAND_URL}",
  "platform_x": "Under 280 chars total. Warm + real stat + ${BRAND_URL}",
  "platform_threads": "Conversational warm take. Real, human. MUST end: ${BRAND_URL}",
  "platform_youtube": "60s warm storytelling video description. Feature highlights. MUST end: ${BRAND_URL}",
  "clarity_score": 8.5,
  "relatability_score": 8.5,
  "conversion_score": 8.0,
  "editor_notes": "Honest assessment: what makes this seniors post work, what could be stronger"
}]`;

// ── Seniors content angles ─────────────────────────────────────────────────────
const SENIORS_ANGLES = [
  { angle: "same_cleaner",      segment: "Seniors",               focus: "Same cleaner every visit = familiarity, trust, no strangers. The #1 thing seniors want." },
  { angle: "gps_safety",        segment: "Adult Children",         focus: "GPS arrival/departure — you always know when the cleaner arrived and left your parent's home." },
  { angle: "background_checks", segment: "Adult Children",         focus: "Criminal background check, ID verification, sex offender registry — renewed annually. Real safety." },
  { angle: "independence",      segment: "Seniors",               focus: "A clean home helps seniors stay independent longer. Smart choice, not giving up." },
  { angle: "reliability_proof", segment: "Seniors",               focus: "4.9★, 98% satisfaction, 2,400+ verified cleaners. Stats that matter when someone enters your home." },
  { angle: "gift_angle",        segment: "Adult Children",         focus: "Booking a clean for your parent's home is the most meaningful practical gift you can give." },
  { angle: "stress_relief",     segment: "Adult Children",         focus: "Worrying about whether your parent's home is clean and safe is exhausting. PureTask removes that mental load." },
  { angle: "booking_simplicity", segment: "Seniors",              focus: "Book online in 3 minutes. Simple, no contracts, pay only when you approve. Easy for seniors." },
];

// ── GPT text generation ────────────────────────────────────────────────────────
async function generateSeniorsText(angle: typeof SENIORS_ANGLES[0], count: number): Promise<any[]> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SENIORS_SYSTEM_PROMPT },
        { role: "user",   content: `Generate ${count} seniors draft(s).\nAngle: ${angle.angle}\nSegment: ${angle.segment}\nFocus: ${angle.focus}\n\nIMPORTANT: Do NOT include an image_prompt field — that is handled server-side.\nNEVER use the word "elderly."\nReturn JSON array matching this schema exactly (all fields required): ${SENIORS_SCHEMA}` }
      ],
      temperature: 0.75,
      max_tokens: 4000,
    }),
  });
  const data = await res.json();
  const raw  = data.choices?.[0]?.message?.content ?? "[]";
  try {
    return JSON.parse(raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
  } catch {
    console.error("[Seniors v3] JSON parse failed:", raw.slice(0, 300));
    return [];
  }
}

// ── Main HTTP handler ──────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db     = base44.asServiceRole.entities;
    const body   = await req.json().catch(() => ({}));
    const { angles, drafts_per_angle = 1, week_tag = "" } = body;

    const targets = angles
      ? SENIORS_ANGLES.filter(a => angles.includes(a.angle))
      : SENIORS_ANGLES;

    console.log(`[Seniors v3] Generating ${targets.length} angles × ${drafts_per_angle} draft(s)...`);

    const created: any[] = [];
    const skipped: any[] = [];

    for (const angle of targets) {
      const drafts = await generateSeniorsText(angle, drafts_per_angle);

      for (const draft of drafts) {
        const avg    = ((draft.clarity_score ?? 0) + (draft.relatability_score ?? 0) + (draft.conversion_score ?? 0)) / 3;
        const status = avg >= 7.5 ? "Approved" : avg >= 5 ? "Draft" : "Rejected";

        if (status === "Rejected") {
          skipped.push({ angle: angle.angle, title: draft.title, avg: avg.toFixed(1), reason: draft.editor_notes });
          console.log(`[Seniors v3] ❌ Rejected: "${draft.title}" (${avg.toFixed(1)})`);
          continue;
        }

        // ✅ Server-side image prompt — specific to this angle, never generic
        const imagePrompt = buildSeniorsImagePrompt(angle.angle, angle.segment);
        console.log(`[Seniors v3] 🖼 Image for: "${draft.title}" | Angle: ${angle.angle}`);

        const image_url = await generateImageForDraft({
          title:        draft.title,
          pillar:       "Trust",
          audience:     draft.audience,
          image_prompt: imagePrompt,
        });

        // Strip GPT's image_prompt if it returned one anyway
        const { image_prompt: _ignored, ...cleanDraft } = draft;

        const record = await db.ContentDraft.create({
          ...cleanDraft,
          status,
          image_url:    image_url ?? null,
          image_prompt: imagePrompt,
          pillar:       "Trust",
          campaign_tag: "Seniors Campaign",
          week_tag:     week_tag || `Seniors-${new Date().toISOString().split("T")[0]}`,
          heygen_status: (draft.script_45sec || draft.script_30sec) ? "Queued" : "None",
          posted_platforms: "",
          is_winner: false,
        });

        created.push({
          id:        record.id,
          angle:     angle.angle,
          segment:   angle.segment,
          title:     draft.title,
          status,
          avg:       avg.toFixed(1),
          has_image: !!image_url,
          image_url: image_url ?? null,
        });

        console.log(`[Seniors v3] ✅ "${draft.title}" | Score: ${avg.toFixed(1)} | ${status} | Image: ${image_url ? "✅ CDN" : "❌ none"}`);

        await new Promise(r => setTimeout(r, 2000));
      }
    }

    return Response.json({
      ok:              true,
      version:         "v3.0",
      image_engine:    "base44_native_cdn",
      angles_targeted: targets.length,
      drafts_created:  created.length,
      approved:        created.filter(c => c.status === "Approved").length,
      images_on_cdn:   created.filter(c => c.has_image).length,
      rejected:        skipped.length,
      created,
      skipped,
    });

  } catch (err: any) {
    console.error("[Seniors v3 Error]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});
