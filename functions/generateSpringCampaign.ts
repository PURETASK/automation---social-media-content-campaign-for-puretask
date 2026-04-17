// PureTask Spring Campaign Generator v3.0
// ─────────────────────────────────────────────────────────────────────────────
// FIXES from v2.0:
//   ❌ v2.0: image_prompt was a hardcoded generic string in the schema
//   ❌ v2.0: GPT returned same prompt for every post regardless of audience/city
//   ✅ v3.0: image_prompt is REMOVED from GPT schema — AI builds it server-side
//   ✅ v3.0: buildSpringImagePrompt() creates specific prompts per pillar/audience/city
//   ✅ v3.0: Uses Base44 native image gen (no OpenAI billing for images)
//   ✅ v3.0: 12s delay removed — Base44 image gen has no rate limit issues
// ─────────────────────────────────────────────────────────────────────────────

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { generateImageForDraft } from './generateImages.ts';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// ── Brand constants ─────────────────────────────────────────────────────────
const BRAND_STATS = "10,000+ clients · 4.9★ rating · 98% satisfaction · 2,400+ verified cleaners · 6 hrs saved per deep clean";
const BRAND_URL   = "https://www.puretask.co";

// ── Specific image prompt builder (replaces generic schema field) ────────────
// This is called SERVER-SIDE after GPT generates the text — NOT by GPT.
// Guarantees the image is always post-specific.
function buildSpringImagePrompt(pillar: string, audience: string, city: string | null): string {
  const BRAND_PREFIX = `Magazine-quality lifestyle photography for PureTask, a premium home cleaning marketplace. Brand: clean, modern, premium, warm, trustworthy. PureTask blue #0099FF accents. Style: real lifestyle photography — NOT stock, NOT corporate, NOT staged.`;

  const CITY_SCENES: Record<string, string> = {
    "Los Angeles":   "Setting: Los Angeles home. Large windows with palm trees and blue California sky clearly visible outside. Warm California spring morning light.",
    "New York":      "Setting: New York City apartment. Floor-to-ceiling windows showing NYC skyline or Central Park in spring green clearly visible. Manhattan elegance.",
    "Chicago":       "Setting: Chicago home. Large windows showing Chicago skyline or Lake Michigan visible. Spring light after a long winter.",
    "Houston":       "Setting: Houston Texas home. Windows showing Houston skyline. Warm Gulf Coast spring morning energy.",
    "Phoenix":       "Setting: Phoenix Arizona home. Large windows showing Camelback Mountain and desert landscape clearly visible. Warm Arizona spring morning.",
    "Seattle":       "Setting: Seattle home. Windows showing Space Needle or Puget Sound. Spring bloom energy — cherry blossoms if visible.",
    "Miami":         "Setting: Miami home. Large windows showing palm trees, blue sky, or ocean visible. Bright Florida spring light.",
    "Dallas":        "Setting: Dallas Texas home. Windows showing Dallas skyline. Warm Texas spring morning.",
    "Denver":        "Setting: Denver Colorado home. Large windows showing Rocky Mountains clearly visible. Crisp spring mountain light.",
    "Atlanta":       "Setting: Atlanta Georgia home. Spring Georgia peach-blossom energy. Warm Southern spring light.",
  };

  const PILLAR_SCENES: Record<string, string> = {
    Transformation: `Dramatic split-panel before/after: LEFT = cluttered winter living room — dusty surfaces, piled mail, dim grey lighting. RIGHT = the SAME room transformed — gleaming floors, fresh spring tulips in clear vase, bright sunlight streaming in, every surface spotless. Bold text overlay: "Before" on left, "After — PureTask" on right in PureTask blue #0099FF. Magazine-quality spring transformation reveal.`,
    Proof:          `Clean premium infographic on white background: PureTask blue #0099FF headers. Large bold stats prominently displayed: "4.9★ Rating" · "10,000+ Happy Clients" · "98% Satisfaction" · "2,400+ Verified Cleaners" · "50+ Cities." Minimal Apple-product-marketing aesthetic. Trust and credibility radiate from every element.`,
    Trust:          `Warm moment: homeowner opening front door to warmly greet a professional cleaner in crisp white uniform. Natural warm spring morning light. Genuine smiles, eye contact, real ID badge visible. The confidence of knowing exactly who's coming in. Human, warm, authentic.`,
    Convenience:    `Bright spring morning scene. Person visibly at ease — relaxed on clean white couch with coffee, phone in hand, clean bright home around them. Spring light through spotless windows. Fresh flowers on side table. Time reclaimed. Relief and ease in body language.`,
    Local:          `Premium home interior with lifestyle authenticity. Large windows prominently showing the city's most recognizable landmark or skyline. Natural spring daylight. Polished, warm, real.`,
    Recruitment:    `Empowering scene: professional cleaner in crisp white uniform, confident and genuinely smiling in a bright modern home. Independence and opportunity energy. Bright, clean, professional. NOT servile, NOT stock.`,
    Seniors:        `Warm dignified scene: senior woman or man in their early-to-mid 70s, NOT frail, sitting relaxed in a spotlessly clean bright spring living room. Cup of tea, fresh flowers, warm golden afternoon light. Peace of mind and independence. Adult child may be present with warm smile. Warm, real — NOT medical.`,
    Spring:         `Bright spring renewal: fresh spring tulips or lilies in a clear vase on a polished dining table. Natural spring light pouring through sparkling clean windows showing spring greenery outside. Gleaming surfaces. The relief and freshness of a newly cleaned home after winter.`,
  };

  const AUDIENCE_NOTES: Record<string, string> = {
    "Families":              "A family moment — parents relaxed, kids happy, clean home around them.",
    "Seniors":               "Dignified senior in their home. Warm, comfortable, independent. NOT medical.",
    "Working Professionals": "Working professional, business casual, relaxed with coffee in clean minimal home.",
    "Busy Homeowners":       "Homeowner visibly at ease, clean bright home, spring energy.",
    "Airbnb Hosts":          "Airbnb/vacation rental bedroom: hotel-quality white linen, fresh flowers, sparkling surfaces. Guest-ready perfection.",
    "Adult Children (35-55)":"Adult daughter or son (mid-40s) visiting parent in a beautifully clean bright home. Warmth and relief.",
    "Cleaners / Gig Workers":"Professional cleaner, confident, empowered, in control in a bright clean work environment.",
  };

  const cityScene    = city ? (CITY_SCENES[city] ?? `Setting: ${city} home. Local landmark or skyline visible through window.`) : "";
  const pillarScene  = PILLAR_SCENES[pillar] ?? PILLAR_SCENES["Convenience"];
  const audienceNote = AUDIENCE_NOTES[audience] ?? "";

  return `${BRAND_PREFIX}

VISUAL SCENE:
${pillarScene}

${cityScene ? `CITY/LOCATION:\n${cityScene}\n` : ""}${audienceNote ? `AUDIENCE FEEL:\n${audienceNote}\n` : ""}
Always include a subtle PureTask blue #0099FF design element (throw pillow, wall accent, or text overlay).`.slice(0, 3900);
}

// ── GPT schema — NO image_prompt field (built server-side instead) ───────────
const SPRING_SYSTEM_PROMPT = `You are the PureTask AI content engine. PureTask is a trust-first home cleaning marketplace at ${BRAND_URL}. Spring 2026: cleaning service search volume UP 340%. Peak booking season through end of April.

BRAND STATS (use these, never invent): ${BRAND_STATS}
URL: ${BRAND_URL} — appears in EVERY caption, every platform, every time.

SCORING v3.0 (be brutally honest — grade like a skeptical consumer):
Clarity 1-10: Would a stranger instantly understand PureTask + what to do?
Relatability 1-10: Would someone stop scrolling and say "that's literally me"?
Conversion 1-10: Does this make someone click RIGHT NOW?
Auto-approve: avg ≥ 7.5 | Draft: 5.0-7.4 | Reject: <5.0

RULES:
- One audience, one message, one emotional transformation per post
- Hook must grab in first line — specific, NOT generic ("Are you tired of..." = -2 Relatability)
- Pain → Solution → Outcome structure
- Platform copy MUST be adapted per platform, NOT copy-pasted
- Real numbers only: 4.9★, 10,000+, 98%, 6 hrs, 2,400+, 340%
- NO hype words, NO fake scarcity, NO guarantees
- ${BRAND_URL} in EVERY platform version
- Spring angle: seasonal urgency is real (search volume, peak season) — use it`;

const SPRING_SCHEMA = `[{
  "title": "Spring-specific title with emotional hook",
  "audience": "one of: Busy Homeowners | Families | Working Professionals | Seniors | Airbnb Hosts | Adult Children (35-55)",
  "pillar": "one of: Convenience | Transformation | Local | Proof | Trust | Recruitment | Seniors | Spring",
  "hook": "Specific spring scroll-stopper — first line that makes the audience stop. NOT generic.",
  "primary_caption": "3-4 sentences. Pain → PureTask solution → outcome. Spring context. Real stat. Ends: ${BRAND_URL}",
  "short_caption": "1-2 sentences. Punchy spring CTA. Ends: ${BRAND_URL}",
  "long_caption": "5-7 sentences. Full spring story. Emotional arc. Real stats. Ends: ${BRAND_URL}",
  "cta_1": "Specific spring action CTA → ${BRAND_URL}",
  "cta_2": "Second angle CTA → ${BRAND_URL}",
  "cta_3": "Third angle CTA → ${BRAND_URL}",
  "script_15sec": "~38 words. Natural spoken language. Spring urgency. Ends: Visit ${BRAND_URL}",
  "script_30sec": "~75 words. Natural spoken language. Winter→spring reset story. Ends: Visit ${BRAND_URL}",
  "platform_facebook": "Practical spring. Slightly longer. 3-5 hashtags. MUST end with ${BRAND_URL}",
  "platform_instagram": "Visual spring aesthetic. Emotional. 8-15 hashtags #SpringCleaning #CleanHome etc. MUST end with ${BRAND_URL}",
  "platform_tiktok": "Fast POV spring hook. #SpringCleaning #CleanTok. MUST end with ${BRAND_URL}",
  "platform_pinterest": "Aspirational spring home. 8-12 keyword hashtags. MUST end with ${BRAND_URL}",
  "platform_x": "Under 280 chars total. Spring urgency + real stat + ${BRAND_URL}",
  "platform_linkedin": "Professional productivity spring angle. Trust-first. MUST end with ${BRAND_URL}",
  "platform_threads": "Conversational spring take. Real, warm. MUST end with ${BRAND_URL}",
  "clarity_score": 8.5,
  "relatability_score": 8.0,
  "conversion_score": 8.0,
  "editor_notes": "Honest assessment: what makes this spring post work, what could be stronger"
}]`;

// ── Spring angles (content calendar) ────────────────────────────────────────
const SPRING_ANGLES = [
  { angle: "spring_urgency",        audience: "Busy Homeowners",       pillar: "Convenience",      city: null,          focus: "Spring cleaning season is here, searches up 340%. Don't let spring pass without a real deep clean." },
  { angle: "post_winter_reset",     audience: "Families",              pillar: "Transformation",   city: null,          focus: "Post-winter family home reset — dust, mud, stale air. Spring is when the home needs a real refresh. Family time is the payoff." },
  { angle: "spring_professional",   audience: "Working Professionals", pillar: "Convenience",      city: null,          focus: "Spring cleaning takes 6+ hours. Working professionals don't have that weekend time. Book PureTask, enjoy your spring." },
  { angle: "spring_seniors",        audience: "Seniors",               pillar: "Seniors",          city: null,          focus: "Spring deep clean for seniors — windows, baseboards, inside cabinets. Safe vetted cleaner handles everything safely." },
  { angle: "spring_transformation", audience: "Busy Homeowners",       pillar: "Transformation",   city: null,          focus: "Emotional spring transformation — before winter-grey chaos, after spring-clean relief. Focus on the feeling, the payoff." },
  { angle: "spring_social_proof",   audience: "Busy Homeowners",       pillar: "Proof",            city: null,          focus: "10,000+ homes spring-cleaned through PureTask. 4.9★. Spring is when most first-timers try us and don't look back." },
  { angle: "spring_la",             audience: "Busy Homeowners",       pillar: "Local",            city: "Los Angeles", focus: "Spring cleaning in Los Angeles. California spring is here, your home should match the sunshine outside." },
  { angle: "spring_nyc",            audience: "Working Professionals", pillar: "Local",            city: "New York",    focus: "NYC spring apartment refresh — post-winter grime, dust that built up since November. One booking fixes it." },
  { angle: "spring_airbnb",         audience: "Airbnb Hosts",          pillar: "Convenience",      city: null,          focus: "Spring is peak Airbnb season. Get deep-cleaned and guest-ready before the rush hits. One booking, five-star reviews." },
  { angle: "spring_chicago",        audience: "Working Professionals", pillar: "Local",            city: "Chicago",     focus: "Chicago spring after a brutal winter — the relief of a clean bright home when the weather finally turns." },
  { angle: "spring_phoenix",        audience: "Busy Homeowners",       pillar: "Local",            city: "Phoenix",     focus: "Phoenix spring — before the summer heat hits, get your home sparkling clean and organized." },
  { angle: "spring_adult_children", audience: "Adult Children (35-55)", pillar: "Seniors",         city: null,          focus: "Book a spring clean for your parent's home — the gift of a spotless, safe space they can be proud of." },
];

// ── GPT text generation ──────────────────────────────────────────────────────
async function generateSpringText(angle: typeof SPRING_ANGLES[0], count: number): Promise<any[]> {
  const cityNote = angle.city
    ? `City: ${angle.city} — make copy hyper-local. Reference ${angle.city} neighborhoods, lifestyle, or spring-in-the-city feel specifically.`
    : "";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SPRING_SYSTEM_PROMPT },
        { role: "user",   content: `Generate ${count} spring draft(s).\nAngle: ${angle.angle}\nAudience: ${angle.audience}\nPillar: ${angle.pillar}\nFocus: ${angle.focus}\n${cityNote}\n\nIMPORTANT: Do NOT include an image_prompt field — that is generated server-side.\nReturn JSON array matching this schema (all fields required): ${SPRING_SCHEMA}` }
      ],
      temperature: 0.8,
      max_tokens: 4000,
    }),
  });
  const data = await res.json();
  const raw  = data.choices?.[0]?.message?.content ?? "[]";
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    console.error("[Spring v3] JSON parse failed:", raw.slice(0, 300));
    return [];
  }
}

// ── Main HTTP handler ─────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db     = base44.asServiceRole.entities;
    const body   = await req.json().catch(() => ({}));
    const { angles, drafts_per_angle = 1 } = body;

    const targets = angles
      ? SPRING_ANGLES.filter(a => angles.includes(a.angle))
      : SPRING_ANGLES;

    console.log(`[Spring v3] Generating ${targets.length} angles × ${drafts_per_angle} draft(s)...`);

    const created: any[] = [];
    const skipped: any[] = [];

    for (const angle of targets) {
      const drafts = await generateSpringText(angle, drafts_per_angle);

      for (const draft of drafts) {
        const avg    = ((draft.clarity_score ?? 0) + (draft.relatability_score ?? 0) + (draft.conversion_score ?? 0)) / 3;
        const status = avg >= 7.5 ? "Approved" : avg >= 5 ? "Draft" : "Rejected";

        if (status === "Rejected") {
          skipped.push({ angle: angle.angle, title: draft.title, avg: avg.toFixed(1), reason: draft.editor_notes });
          console.log(`[Spring v3] ❌ Rejected: "${draft.title}" (${avg.toFixed(1)})`);
          continue;
        }

        // ✅ Build specific image prompt SERVER-SIDE — never trust GPT for this
        const imagePrompt = buildSpringImagePrompt(angle.pillar, angle.audience, angle.city);
        console.log(`[Spring v3] 🖼 Generating image for: "${draft.title}" | Pillar: ${angle.pillar} | City: ${angle.city ?? "none"}`);

        const image_url = await generateImageForDraft({
          title:        draft.title,
          pillar:       angle.pillar,
          audience:     angle.audience,
          city:         angle.city,
          image_prompt: imagePrompt,
        });

        // Remove image_prompt from GPT output if it snuck through, replace with our version
        const { image_prompt: _ignored, ...cleanDraft } = draft;

        const record = await db.ContentDraft.create({
          ...cleanDraft,
          status,
          image_url:    image_url ?? null,
          image_prompt: imagePrompt, // ✅ our server-built prompt, always specific
          city:         angle.city ?? null,
          pillar:       angle.pillar,
          campaign_tag: "Spring 2026",
          week_tag:     `Spring-${new Date().toISOString().split("T")[0]}`,
          heygen_status: (draft.script_30sec || draft.script_15sec) ? "Queued" : "None",
          posted_platforms: "",
          is_winner: false,
        });

        created.push({
          id:        record.id,
          angle:     angle.angle,
          title:     draft.title,
          pillar:    angle.pillar,
          city:      angle.city,
          audience:  angle.audience,
          status,
          avg:       avg.toFixed(1),
          has_image: !!image_url,
          image_url: image_url ?? null,
        });

        console.log(`[Spring v3] ✅ "${draft.title}" | Score: ${avg.toFixed(1)} | ${status} | Image: ${image_url ? "✅ CDN" : "❌ none"}`);

        // Small delay between drafts for API stability
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    const approved       = created.filter(c => c.status === "Approved").length;
    const withImage      = created.filter(c => c.has_image).length;
    const cityPosts      = created.filter(c => c.city).length;

    return Response.json({
      ok:              true,
      version:         "v3.0",
      image_engine:    "base44_native_cdn",
      angles_targeted: targets.length,
      drafts_created:  created.length,
      approved,
      drafts:          created.length - approved,
      images_on_cdn:   withImage,
      city_posts:      cityPosts,
      rejected:        skipped.length,
      created,
      skipped,
    });

  } catch (err: any) {
    console.error("[Spring v3 Error]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});
