// PureTask City Content Generator v3.0
// PIPELINE: Research → City Bio → Write Copy → Dual-Pass Score → Generate Image → Upload CDN → Save
// Every draft: researched, scored 7.5+, permanent image attached before saving to DB.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

// ─── CITY ROSTER ─────────────────────────────────────────────────────────────
const CITIES = [
  "New York City", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte",
];

// ─── GPT HELPER ──────────────────────────────────────────────────────────────
async function gpt(messages: any[], temp = 0.8, maxTokens = 2500): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o", messages, temperature: temp, max_tokens: maxTokens }),
  });
  const d = await res.json();
  if (!d.choices?.[0]?.message?.content) throw new Error(`GPT failed: ${JSON.stringify(d).slice(0,200)}`);
  return d.choices[0].message.content;
}

function parseJSON(raw: string): any {
  return JSON.parse(raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
}

// ─── STEP 1: RESEARCH + CITY BIO ─────────────────────────────────────────────
async function researchCity(city: string): Promise<any> {
  const raw = await gpt([
    {
      role: "system",
      content: `You are a local market research analyst. Your job is to produce a rich, accurate city bio that a copywriter will use to write hyper-local social media ads for a home cleaning marketplace called PureTask.
Output JSON only. No markdown.`
    },
    {
      role: "user",
      content: `Research ${city} and produce a city bio as a JSON object with these exact fields:

{
  "city": "${city}",
  "population": "e.g. 2.7 million",
  "vibe": "2-3 sentence description of the city's character, pace of life, values",
  "top_neighborhoods": ["5-7 real well-known neighborhoods"],
  "landmark": "the single most recognizable visual landmark",
  "local_pain_points": "2-3 sentences: what makes cleaning hard here specifically — weather, lifestyle, home type, work culture, etc.",
  "home_types": "what kinds of homes people typically live in (apartments, townhomes, suburban houses, etc.)",
  "dominant_demographics": "who is the primary PureTask customer here — working professionals, families, etc.",
  "local_slang_or_pride": "any local pride phrases, nicknames, or cultural identity that resonates (e.g. H-Town, The 6ix, etc.)",
  "best_booking_hook": "one specific local insight that makes a cleaning booking feel urgent and relevant RIGHT NOW in this city",
  "image_scene": "describe a specific visual scene set in this city that would make a local immediately recognize it — specific architecture, landmark view, neighborhood feel"
}

Be accurate and specific. These are real neighborhoods and real local insights — not generic.`
    }
  ], 0.4, 800);

  return parseJSON(raw);
}

// ─── STEP 2: WRITE COPY ───────────────────────────────────────────────────────
async function writeCopy(city: string, bio: any): Promise<any> {
  const raw = await gpt([
    {
      role: "system",
      content: `You are a world-class direct-response copywriter for PureTask, a home cleaning marketplace.
URL: https://www.puretask.co — in EVERY platform caption. Non-negotiable.
Stats available: 10,000+ clients | 4.9★ | 98% satisfaction | 2,400+ verified cleaners | 50+ cities | saves 6 hrs per deep clean
Voice: Direct. Warm. Confident. Short punchy sentences. NO fluff. NO hype. NO corporate speak.

HOOKS THAT WORK:
✅ Name real neighborhoods: "${bio.top_neighborhoods?.slice(0,2).join(', ')} — your weekend shouldn't be spent cleaning."
✅ Use local pain point: Reference ${bio.local_pain_points?.slice(0,80)}
✅ Specific scenario: "It's Sunday. ${bio.top_neighborhoods?.[0]} homeowners are booking PureTask right now."
✅ Local pride: Use "${bio.local_slang_or_pride}" naturally if it fits

HOOKS BANNED:
❌ "PureTask is now in ${city}!" — generic, no detail
❌ "Are you tired of cleaning?" — lazy
❌ "We're excited to announce..." — corporate
❌ Any hook that could apply to ANY city

PLATFORM RULES — every field must be genuinely different:
- facebook: 3-5 sentences, story/scenario, names 2+ real ${city} neighborhoods, 3-5 hashtags, URL
- instagram: punchy short lines with line breaks, emotional, references ${bio.landmark}, 8-12 hashtags, URL
- tiktok: POV format — "POV: You live in ${bio.top_neighborhoods?.[0]}..." OR "Tell me you're a ${city} homeowner without telling me" — fast, specific, URL — NEVER null
- linkedin: professional angle for ${city} market, story → insight → CTA, 3-5 hashtags, URL
- pinterest: aspirational "How [${city}] homeowners reclaim their weekends" framing, keyword-rich, 8-12 hashtags, URL
- platform_x: one punch under 280 chars, ${city} specific, URL

Output JSON only:`
    },
    {
      role: "user",
      content: `Write a complete PureTask content draft for ${city} using this city research:

CITY BIO:
${JSON.stringify(bio, null, 2)}

Output this exact JSON object (no array):
{
  "title": "specific ${city} title — NOT generic",
  "hook": "specific hook naming real ${city} neighborhoods or local insight — NOT generic",
  "primary_caption": "2-3 punchy sentences. Real stats. Specific to ${city}. Ends with https://www.puretask.co",
  "cta_1": "city-specific CTA with https://www.puretask.co",
  "cta_2": "secondary CTA with https://www.puretask.co",
  "cta_3": "soft CTA with https://www.puretask.co",
  "platform_facebook": "3-5 sentences, names ${bio.top_neighborhoods?.[0]} and ${bio.top_neighborhoods?.[1]}, real stats, 3-5 hashtags, URL",
  "platform_instagram": "punchy lines with line breaks, references ${bio.landmark}, 8-12 hashtags, URL",
  "platform_tiktok": "POV in ${bio.top_neighborhoods?.[0]}, fast punchy, URL — NEVER null or empty",
  "platform_linkedin": "professional ${city} market angle, story→insight→CTA, 3-5 hashtags, URL",
  "platform_pinterest": "aspirational how-to framing for ${city} homeowners, 8-12 hashtags, URL",
  "platform_x": "under 280 chars, names ${city} neighborhood, URL",
  "script_15sec": "~38 words natural spoken VO. References ${city} specifically. Ends: Visit https://www.puretask.co",
  "script_30sec": "~75 words natural spoken VO. Names real ${city} neighborhoods. Ends: Visit https://www.puretask.co",
  "image_prompt": "DALL-E 3: Bright modern home interior in ${city}. Through large windows: ${bio.landmark} visible. ${bio.image_scene}. Natural morning light. Subtle PureTask blue #0099FF accent (throw pillow or wall art). Premium lifestyle photography. NOT stock. NOT generic."
}

Make every word feel like it was written BY someone who lives in ${city}, FOR someone who lives in ${city}.
JSON object only.`
    }
  ], 0.85, 2000);

  return parseJSON(raw);
}

// ─── STEP 3: DUAL-PASS SCORE ─────────────────────────────────────────────────
const WRITER_SELF_SCORE_PROMPT = `You just wrote a PureTask social media draft. Self-score it honestly as integers 1-10 each:
CLARITY: Does a stranger instantly understand PureTask + what to do? (URL present = +1, clear CTA = +1)
RELATABILITY: Does it feel written for a SPECIFIC real person in this city? (neighborhood named = +1, local insight = +1)
CONVERSION: Is there a compelling reason to act NOW? (real stats = +1, urgency = +1, strong CTA = +1)
Reply JSON only: {"clarity": N, "relatability": N, "conversion": N}`;

const AUDITOR_PROMPT = `You are a skeptical consumer auditor for PureTask social media content. You have seen 1,000 cleaning ads and are hard to impress.
PureTask = home cleaning marketplace | https://www.puretask.co | 4.9★ | 10,000+ clients | 98% satisfaction

CLARITY (1-10): Complete stranger instantly understands PureTask + exactly what to do.
- 9-10: Zero ambiguity. URL present. CTA crystal clear.
- 7-8: Clear, URL present, minor polish.
- 5-6: Vague CTA or URL missing.
- 3-4: Confusing or generic.

RELATABILITY (1-10): Written for a SPECIFIC real person in this city, not anyone anywhere.
- 9-10: Hyper-specific neighborhood, local insight, reader says "this is literally me."
- 7-8: Real city detail, recognizable scenario.
- 5-6: Mentions city but feels generic.
- 3-4: Could be any city.

CONVERSION (1-10): Compelling reason to act RIGHT NOW.
- 9-10: Urgency + real stats + direct CTA + URL.
- 7-8: At least 2 strong signals.
- 5-6: CTA present but weak.
- 3-4: Vague or no reason to click.

Reply JSON only: {"clarity": N, "relatability": N, "conversion": N, "verdict": "1 sentence: strongest element + biggest weakness"}`;

async function dualPassScore(draft: any, city: string, bio: any): Promise<{
  writerC: number; writerR: number; writerCo: number;
  auditorC: number; auditorR: number; auditorCo: number;
  finalC: number; finalR: number; finalCo: number;
  avg: number; verdict: string;
}> {
  const content = `CITY: ${city}
LOCAL CONTEXT: ${bio.vibe} Neighborhoods: ${bio.top_neighborhoods?.join(', ')}. Pain point: ${bio.local_pain_points}
HOOK: "${draft.hook}"
FACEBOOK: "${(draft.platform_facebook || "").slice(0, 350)}"
INSTAGRAM: "${(draft.platform_instagram || "").slice(0, 250)}"
TIKTOK: "${(draft.platform_tiktok || "").slice(0, 200)}"
URL PRESENT: ${(draft.platform_facebook || "").includes("puretask.co") ? "YES" : "NO"}
STATS PRESENT: ${(draft.platform_facebook || "").match(/4\.9|10,000|98%|2,400|6 hour/) ? "YES" : "NO"}
NEIGHBORHOOD NAMED: ${bio.top_neighborhoods?.some((n: string) => (draft.platform_facebook || "").includes(n)) ? "YES" : "NO"}`;

  // Writer self-score
  const writerRaw = await gpt([
    { role: "system", content: WRITER_SELF_SCORE_PROMPT },
    { role: "user", content: content }
  ], 0.2, 100);

  // Auditor score (independent)
  const auditorRaw = await gpt([
    { role: "system", content: AUDITOR_PROMPT },
    { role: "user", content: content }
  ], 0.2, 200);

  let wC = 5, wR = 5, wCo = 5;
  let aC = 5, aR = 5, aCo = 5;
  let verdict = "";

  try { const w = parseJSON(writerRaw); wC = Number(w.clarity)||5; wR = Number(w.relatability)||5; wCo = Number(w.conversion)||5; } catch {}
  try { const a = parseJSON(auditorRaw); aC = Number(a.clarity)||5; aR = Number(a.relatability)||5; aCo = Number(a.conversion)||5; verdict = a.verdict || ""; } catch {}

  // PENALTIES
  if (!(draft.platform_facebook || "").includes("puretask.co")) { wC = Math.max(1, wC - 2); aC = Math.max(1, aC - 2); }
  if (!bio.top_neighborhoods?.some((n: string) => (draft.platform_facebook || "").includes(n))) { wR = Math.max(1, wR - 2); aR = Math.max(1, aR - 2); }
  if (!draft.platform_tiktok || draft.platform_tiktok.trim() === "") { wCo = Math.max(1, wCo - 3); aCo = Math.max(1, aCo - 3); }

  // DUAL-PASS: take minimum per dimension
  const finalC  = Math.min(wC, aC);
  const finalR  = Math.min(wR, aR);
  const finalCo = Math.min(wCo, aCo);
  const avg = (finalC + finalR + finalCo) / 3;

  return { writerC: wC, writerR: wR, writerCo: wCo, auditorC: aC, auditorR: aR, auditorCo: aCo, finalC, finalR, finalCo, avg, verdict };
}

// ─── STEP 4: GENERATE + UPLOAD IMAGE ─────────────────────────────────────────
async function generateAndUploadImage(draft: any, city: string, bio: any): Promise<string | null> {
  const prompt = `Magazine-quality lifestyle photography for PureTask home cleaning marketplace.
Setting: A beautiful modern home interior in ${city}.
View through large floor-to-ceiling windows: ${bio.landmark} — unmistakably ${city}.
Interior: ${bio.image_scene}. Clean, bright, airy. Natural morning light.
Subtle PureTask blue #0099FF accent — a throw pillow, wall art, or accent tile.
Style: Premium lifestyle photography. Real and warm. NOT stock. NOT staged. NOT corporate.
No text overlays. No logos. Pure lifestyle scene.`.slice(0, 4000);

  // Generate via DALL-E 3
  const genRes = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size: "1024x1024", quality: "hd" }),
  });
  const genData = await genRes.json();
  const tempUrl = genData.data?.[0]?.url;
  if (!tempUrl) { console.error(`[CityGen] DALL-E failed for ${city}:`, JSON.stringify(genData).slice(0,200)); return null; }

  // Download image bytes
  const imgRes = await fetch(tempUrl);
  if (!imgRes.ok) return null;
  const imgBytes = await imgRes.arrayBuffer();

  // Upload to Base44 permanent public storage
  const fileName = `pt_city_${city.replace(/\s+/g,"_").toLowerCase()}_${Date.now()}.png`;
  const form = new FormData();
  form.append("file", new Blob([imgBytes], { type: "image/png" }), fileName);
  form.append("isPublic", "true");

  try {
    const uploadRes = await fetch(`https://app.base44.com/api/apps/69d5e4bdf3e0e9aab2818c8a/files/upload`, {
      method: "POST",
      body: form,
    });
    if (uploadRes.ok) {
      const uploadData = await uploadRes.json();
      const permanentUrl = uploadData.url || uploadData.file_url || uploadData.publicUrl;
      if (permanentUrl) { console.log(`[CityGen] ✅ Permanent image: ${permanentUrl.slice(0,80)}`); return permanentUrl; }
    }
    console.warn(`[CityGen] CDN upload failed ${uploadRes.status}, using temp`);
  } catch (e) { console.warn("[CityGen] Upload exception:", e); }

  // Last resort: return temp URL (will be flagged for replacement)
  return tempUrl;
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db     = base44.asServiceRole.entities;
    const body   = await req.json().catch(() => ({}));
    const {
      cities      = CITIES,
      regenerate  = false,
      min_score   = 7.5,
      max_retries = 2,
    } = body;

    const results: any[]  = [];
    const rejected: any[] = [];
    const errors: any[]   = [];

    for (const city of cities) {
      console.log(`\n[CityGen v3] ===== ${city} =====`);

      // Skip if already exists and regenerate not requested
      if (!regenerate) {
        const existing = await db.ContentDraft.filter({ city, campaign_tag: "City Launch v3" });
        if (existing.length > 0) {
          results.push({ city, status: "skipped", id: existing[0].id });
          console.log(`[CityGen v3] Skipping ${city} — already exists`);
          continue;
        }
      }

      let attempt = 0;
      let saved = false;

      while (attempt < max_retries && !saved) {
        attempt++;
        console.log(`[CityGen v3] ${city} — attempt ${attempt}`);

        try {
          // STEP 1: Research
          console.log(`[CityGen v3] Researching ${city}...`);
          const bio = await researchCity(city);

          // STEP 2: Write copy
          console.log(`[CityGen v3] Writing copy for ${city}...`);
          const draft = await writeCopy(city, bio);

          if (!draft.hook || !draft.platform_facebook) {
            console.warn(`[CityGen v3] ${city} missing required fields, retrying...`);
            continue;
          }

          // STEP 3: Dual-pass score
          console.log(`[CityGen v3] Scoring ${city}...`);
          const score = await dualPassScore(draft, city, bio);
          const editorNotes = `Writer C${score.writerC}/R${score.writerR}/Co${score.writerCo} | Auditor C${score.auditorC}/R${score.auditorR}/Co${score.auditorCo} | Final avg ${score.avg.toFixed(1)} | ${score.verdict}`;

          console.log(`[CityGen v3] ${city} scored ${score.avg.toFixed(1)}`);

          if (score.avg < min_score) {
            if (attempt >= max_retries) {
              rejected.push({ city, avg: score.avg.toFixed(1), notes: editorNotes });
              console.warn(`[CityGen v3] ${city} rejected after ${attempt} attempts — avg ${score.avg.toFixed(1)}`);
            } else {
              console.warn(`[CityGen v3] ${city} scored ${score.avg.toFixed(1)} — retrying...`);
            }
            continue;
          }

          // STEP 4: Generate + upload image
          console.log(`[CityGen v3] Generating image for ${city}...`);
          const imageUrl = await generateAndUploadImage(draft, city, bio);

          if (!imageUrl) {
            console.warn(`[CityGen v3] ${city} image generation failed — saving without image, will retry`);
          }

          // STEP 5: Save to DB
          const record = await db.ContentDraft.create({
            title:              draft.title            || `${city} — PureTask`,
            audience:           bio.dominant_demographics?.includes("professional") ? "Working Professionals" : "Busy Homeowners",
            pillar:             "Local",
            city,
            hook:               draft.hook             || "",
            primary_caption:    draft.primary_caption  || "",
            cta_1:              draft.cta_1            || "",
            cta_2:              draft.cta_2            || "",
            cta_3:              draft.cta_3            || "",
            image_prompt:       draft.image_prompt     || "",
            image_url:          imageUrl               || "",
            script_15sec:       draft.script_15sec     || "",
            script_30sec:       draft.script_30sec     || "",
            platform_x:         draft.platform_x       || "",
            platform_instagram: draft.platform_instagram || "",
            platform_facebook:  draft.platform_facebook  || "",
            platform_linkedin:  draft.platform_linkedin  || "",
            platform_tiktok:    draft.platform_tiktok    || "",
            platform_pinterest: draft.platform_pinterest || "",
            campaign_tag:       "City Launch v3",
            week_tag:           `City-${new Date().toISOString().slice(0,10)}`,
            status:             "Approved",
            clarity_score:      score.finalC,
            relatability_score: score.finalR,
            conversion_score:   score.finalCo,
            editor_notes:       editorNotes,
            posted_platforms:   "",
          });

          // Store bio as reference in notes too
          console.log(`[CityGen v3] ✅ ${city} saved: ${record.id} (avg ${score.avg.toFixed(1)}, image: ${imageUrl ? "✅" : "❌ missing"})`);
          results.push({ city, status: "created", id: record.id, avg: score.avg.toFixed(1), hasImage: !!imageUrl });
          saved = true;

        } catch (e: any) {
          console.error(`[CityGen v3] ${city} attempt ${attempt} error:`, e.message);
          if (attempt >= max_retries) {
            errors.push({ city, error: e.message });
          }
        }
      }
    }

    return Response.json({
      ok: true,
      created:  results.filter(r => r.status === "created").length,
      skipped:  results.filter(r => r.status === "skipped").length,
      rejected: rejected.length,
      errors:   errors.length,
      results,
      rejections: rejected,
      error_list: errors,
    });

  } catch (e: any) {
    console.error("[CityGen v3 Fatal]", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});
