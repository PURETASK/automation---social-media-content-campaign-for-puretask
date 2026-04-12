// PureTask City-Specific Content Generator v1.0
// Generates hyper-local content for top PureTask cities
// City posts convert 40-60% better than generic — local trust signal

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const TOP_CITIES = [
  { city: "Los Angeles", state: "CA", landmark: "Hollywood Hills", vibe: "busy professionals, luxury homes" },
  { city: "New York", state: "NY", landmark: "Manhattan skyline", vibe: "apartment dwellers, time-poor professionals" },
  { city: "Chicago", state: "IL", landmark: "Lake Michigan", vibe: "family homes, working parents" },
  { city: "Houston", state: "TX", landmark: "downtown skyline", vibe: "large homes, suburban families" },
  { city: "Phoenix", state: "AZ", landmark: "desert landscape", vibe: "new homeowners, Airbnb hosts" },
  { city: "San Diego", state: "CA", landmark: "Pacific coastline", vibe: "beach homes, busy professionals" },
  { city: "Dallas", state: "TX", landmark: "downtown skyline", vibe: "large homes, families" },
  { city: "Austin", state: "TX", landmark: "Congress Bridge", vibe: "tech workers, young professionals" },
  { city: "Seattle", state: "WA", landmark: "Space Needle", vibe: "tech professionals, rainy season motivation" },
  { city: "Miami", state: "FL", landmark: "South Beach", vibe: "luxury condos, Airbnb hosts" }
];

const CITY_SYSTEM_PROMPT = `You are the PureTask AI content engine generating hyper-local city-specific content.
PureTask is a trust-first home cleaning marketplace at https://www.puretask.co.

LOCKED CONSTANTS:
- URL: https://www.puretask.co — in EVERY caption, EVERY platform
- Stats: 10,000+ clients | 2,400+ cleaners | 4.9★ | 98% satisfaction | 50+ cities | 6 hrs saved
- Brand colors: #0099FF (blue), #FFFFFF (white)
- Voice: Direct, confident, local, warm. Never generic.

CITY POST REQUIREMENTS:
- Must mention the city BY NAME in every caption
- image_prompt MUST visually reference the city (skyline, landmark, neighborhood feel)
- CTA must say "Book in [City]" not just "Book now"
- Hashtags must include #[City]Cleaning #[City]Homes #[City]Services
- Feel like it was written BY someone IN that city FOR people in that city

SCORING (same v3.0 rubric — 7.5+ required):
- Clarity: stranger instantly knows PureTask is in their city and what to do
- Relatability: feels like a neighbor recommending a local service
- Conversion: specific "Book in [City]" CTA + stats + URL
- PENALTY: -2 relatability if no city visual in image_prompt
- PENALTY: -2 clarity if URL missing
- PENALTY: -2 conversion if CTA says "Book now" instead of "Book in [City]"

OUTPUT: Valid JSON array only. No markdown. No text outside JSON.`;

const CITY_DRAFT_SCHEMA = `Each city draft object MUST contain:
{
  "title": "City-specific title mentioning the city name",
  "audience": "one of: Busy Homeowners | Working Professionals | Families | Seniors | Airbnb Hosts",
  "pillar": "Local",
  "hook": "City-specific scroll-stopper mentioning city name",
  "primary_caption": "3-4 sentences. Mentions city. Ends with https://www.puretask.co",
  "cta_1": "Book in [City] → https://www.puretask.co",
  "cta_2": "Find cleaners in [City] → https://www.puretask.co",
  "cta_3": "See PureTask [City] reviews → https://www.puretask.co",
  "image_prompt": "DALL-E 3 prompt — MUST include city name, landmark or neighborhood feel, PureTask blue (#0099FF) accent, clean modern home interior or exterior, bright natural lighting",
  "script_15sec": "15s voiceover — mentions city. Ends: Visit https://www.puretask.co",
  "script_30sec": "30s voiceover — mentions city. Ends: Visit https://www.puretask.co",
  "platform_x": "Under 280 chars. City name + stats + URL",
  "platform_instagram": "Emotional. City-specific. 10-15 hashtags including #[City]Cleaning. URL included.",
  "platform_facebook": "Practical. Community feel. City name. 3-5 hashtags. URL included.",
  "platform_linkedin": "Professional. City-specific market insight. URL included.",
  "platform_tiktok": "Fast hook. POV. City name in first line. URL included.",
  "city": "[City name]",
  "clarity_score": number,
  "relatability_score": number,
  "conversion_score": number,
  "editor_notes": "Why this city post works / what could be stronger"
}`;

async function generateCityDrafts(cityData: typeof TOP_CITIES[0], count: number = 2): Promise<any[]> {
  const userPrompt = `Generate ${count} high-converting content drafts for PureTask in ${cityData.city}, ${cityData.state}.

City context:
- City: ${cityData.city}, ${cityData.state}
- Key landmark/visual: ${cityData.landmark}
- Target audience vibe: ${cityData.vibe}

Requirements:
- Every draft must feel genuinely LOCAL to ${cityData.city}
- Use the ${cityData.landmark} or ${cityData.city} neighborhood feel in image_prompts
- One draft should target homeowners, one should target a different audience
- Score honestly — only approve if avg ≥ 7.5 after penalties
- CTA must say "Book in ${cityData.city}" not generic "Book now"

${CITY_DRAFT_SCHEMA}

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
        { role: "system", content: CITY_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 4000
    })
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "[]";

  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.log("Parse error:", e, "Raw:", raw.substring(0, 200));
    return [];
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const body = await req.json().catch(() => ({}));
    const { cities, drafts_per_city = 2, week_tag = "" } = body;

    // Select which cities to generate for
    const targetCities = cities
      ? TOP_CITIES.filter(c => cities.includes(c.city))
      : TOP_CITIES.slice(0, 5); // default: top 5 cities

    console.log(`[CityContent] Generating for ${targetCities.length} cities, ${drafts_per_city} drafts each...`);

    const created: any[] = [];
    const skipped: any[] = [];

    for (const cityData of targetCities) {
      console.log(`[CityContent] Generating ${cityData.city}...`);
      const drafts = await generateCityDrafts(cityData, drafts_per_city);

      for (const draft of drafts) {
        const avg = ((draft.clarity_score || 0) + (draft.relatability_score || 0) + (draft.conversion_score || 0)) / 3;
        const status = avg >= 7.5 ? "Approved" : avg >= 5 ? "Draft" : "Rejected";

        if (status === "Rejected") {
          skipped.push({ city: cityData.city, title: draft.title, avg: avg.toFixed(1), reason: draft.editor_notes });
          continue;
        }

        const record = await db.ContentDraft.create({
          ...draft,
          status,
          city: cityData.city,
          pillar: "Local",
          week_tag: week_tag || `City-${cityData.city}-${new Date().toISOString().split("T")[0]}`,
          campaign_tag: "City Launch Series",
          heygen_status: (draft.script_30sec || draft.script_15sec) ? "Queued" : "None",
          posted_platforms: "",
          is_winner: false
        });

        created.push({ id: record.id, city: cityData.city, title: draft.title, status, avg: avg.toFixed(1) });
        console.log(`[CityContent] ✅ Created: ${draft.title} (${avg.toFixed(1)}) → ${status}`);
      }

      // Small delay between cities to avoid rate limits
      await new Promise(r => setTimeout(r, 1000));
    }

    return Response.json({
      ok: true,
      cities_processed: targetCities.length,
      drafts_created: created.length,
      drafts_skipped: skipped.length,
      approved: created.filter(c => c.status === "Approved").length,
      created,
      skipped
    });

  } catch (error: any) {
    console.error("[CityContent Error]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
