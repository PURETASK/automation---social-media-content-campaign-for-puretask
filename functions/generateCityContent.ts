// PureTask City Content Generator v2.0
// IMAGE GENERATED INLINE AT CREATION — not as afterthought

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { generateImageForDraft } from './generateImages.ts';

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
Every post MUST mention the city by name. image_prompt MUST visually reference the city.
CTA must say "Book in [City]" not just "Book now".
Hashtags must include #[City]Cleaning #[City]Homes.
Score v3.0 — 7.5+ required. PENALTY -2 relatability: no city visual. OUTPUT: Valid JSON array only.`;

const CITY_SCHEMA = `[{
  "title": "City-specific title with city name",
  "audience": "Busy Homeowners or Working Professionals or Families or Seniors or Airbnb Hosts",
  "pillar": "Local",
  "hook": "City-specific scroll-stopper with city name",
  "primary_caption": "3-4 sentences. City name. Ends: https://www.puretask.co",
  "cta_1": "Book in [City] → https://www.puretask.co",
  "cta_2": "Find cleaners in [City] → https://www.puretask.co",
  "cta_3": "See PureTask [City] reviews → https://www.puretask.co",
  "image_prompt": "DALL-E 3 — MUST include [City] skyline or landmark. PureTask blue #0099FF. Clean modern home + city visual. Bright natural lighting.",
  "script_15sec": "15s VO. City name mentioned. Ends: Visit https://www.puretask.co",
  "script_30sec": "30s VO. City context. Ends: Visit https://www.puretask.co",
  "platform_x": "<280 chars. City + stats + URL.",
  "platform_instagram": "Emotional. City hashtags. 10-15 total hashtags. URL.",
  "platform_facebook": "Community feel. City name. 3-5 hashtags. URL.",
  "platform_linkedin": "Professional. City market insight. URL.",
  "platform_tiktok": "Fast hook. City name first line. URL.",
  "city": "[city name]",
  "clarity_score": 8,
  "relatability_score": 8,
  "conversion_score": 8,
  "editor_notes": "why this city post works"
}]`;

async function generateCityText(cityData: any, count: number): Promise<any[]> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: CITY_SYSTEM_PROMPT },
        { role: "user", content: `Generate ${count} city drafts for PureTask in ${cityData.city}, ${cityData.state}. Landmark: ${cityData.landmark}. Vibe: ${cityData.vibe}. image_prompt MUST visually reference ${cityData.city} and its ${cityData.landmark}. CTA says "Book in ${cityData.city}". Schema: ${CITY_SCHEMA}. JSON array only.` }
      ],
      temperature: 0.8, max_tokens: 4000
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
    const { cities, drafts_per_city = 2, week_tag = "" } = body;

    const targetCities = cities
      ? TOP_CITIES.filter(c => cities.includes(c.city))
      : TOP_CITIES.slice(0, 5);

    console.log(`[City v2] Generating for ${targetCities.length} cities with inline images...`);
    const created: any[] = [], skipped: any[] = [];

    for (const cityData of targetCities) {
      const drafts = await generateCityText(cityData, drafts_per_city);

      for (const draft of drafts) {
        const avg = ((draft.clarity_score || 0) + (draft.relatability_score || 0) + (draft.conversion_score || 0)) / 3;
        const status = avg >= 7.5 ? "Approved" : avg >= 5 ? "Draft" : "Rejected";

        if (status === "Rejected") {
          skipped.push({ city: cityData.city, title: draft.title, avg: avg.toFixed(1) });
          continue;
        }

        // ✅ GENERATE IMAGE INLINE — city visual enforced
        console.log(`[City v2] Generating image for: "${draft.title}" (${cityData.city})...`);
        const image_url = await generateImageForDraft({
          pillar: "Local",
          city: cityData.city,
          audience: draft.audience,
          image_prompt: draft.image_prompt || `${cityData.city} ${cityData.landmark} in background, clean modern home interior in foreground. PureTask blue #0099FF accent. Bright natural lighting. "PureTask — Now in ${cityData.city}" text overlay.`
        });

        const record = await db.ContentDraft.create({
          ...draft,
          status,
          image_url: image_url || null,
          city: cityData.city,
          pillar: "Local",
          week_tag: week_tag || `City-${cityData.city}-${new Date().toISOString().split("T")[0]}`,
          campaign_tag: "City Launch Series",
          heygen_status: (draft.script_30sec || draft.script_15sec) ? "Queued" : "None",
          posted_platforms: "",
          is_winner: false
        });

        created.push({ id: record.id, city: cityData.city, title: draft.title, status, avg: avg.toFixed(1), has_image: !!image_url });
        console.log(`[City v2] ✅ "${draft.title}" → ${status} | Image: ${image_url ? '✅' : '❌'}`);

        await new Promise(r => setTimeout(r, 12000)); // DALL-E 3 rate limit
      }
    }

    return Response.json({
      ok: true,
      cities_processed: targetCities.length,
      drafts_created: created.length,
      images_generated: created.filter(c => c.has_image).length,
      approved: created.filter(c => c.status === "Approved").length,
      created,
      skipped
    });

  } catch (error: any) {
    console.error("[City v2 Error]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
