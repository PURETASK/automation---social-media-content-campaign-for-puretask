// PureTask Content Generator v5.0 — Image-First Pipeline
// CRITICAL FIX: Image is generated BEFORE scoring. Score reflects actual image presence.
// Flow: Write copy → Generate DALL-E 3 image → Audit with image_url present → Save

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const WRITER_PROMPT = `You are a world-class direct-response copywriter for PureTask, a home cleaning marketplace.
URL: https://www.puretask.co — in EVERY platform caption. No exceptions.
Stats: 10,000+ clients | 4.9★ | 98% satisfaction | 2,400+ verified cleaners | 50+ cities | 6 hrs saved | cleaners keep 80-85% | TaskRabbit ~30% | Handy ~35%
Voice: Direct. Warm. Confident. Short punchy lines. NO fluff. NO hype. NO corporate speak.

HOOKS THAT WORK — use these exact patterns:
✅ Specific Friday night scenario: "It's 9pm Friday. Sink full. Company coming tomorrow. You book PureTask in 3 minutes."
✅ Emotional contrast: "My kids asked why we never go to the park on Saturdays. I was always cleaning."
✅ Specific number: "6 hours. That's how long a deep clean takes. What would you do with 6 extra Saturday hours?"
✅ Direct math: "Handy keeps 35% of every job you work. PureTask keeps 15-20%. Same work. More money."
✅ Consequence scenario: "Your cleaner cancels the morning of. No backup. No refund. You spent Saturday cleaning instead."
✅ Trust scenario: "GPS check-in. Before + after photos in your inbox. You knew exactly what happened in your home."

HOOKS THAT ARE BANNED — NEVER write these:
❌ "Are you tired of coming home to a messy house?"
❌ "PureTask makes home cleaning easy!"
❌ "Spring is here! Time to clean!"
❌ "Discover the PureTask difference"
❌ "We are proud to offer..."
❌ Any hook that starts with "Are you" or "Do you"

PLATFORM RULES — each MUST be genuinely different in tone and format:
Facebook: 3-5 sentences, story/scenario, practical, 3-5 hashtags, URL
Instagram: Short punchy lines with line breaks, emotional, 8-15 hashtags, URL
TikTok: POV format OR "Tell me you X without telling me X" — FAST, punchy, URL — REQUIRED, NEVER null or empty
LinkedIn: Professional story → specific insight → CTA, 3-5 pro hashtags, URL
Pinterest: Aspirational "How to" framing, keyword-rich, 8-12 hashtags, URL
X/Twitter: One punch under 280 chars, URL included

IMAGE PROMPTS — be extremely specific (this will be used to generate a real DALL-E 3 image):
- Always: exact scene + people description + lighting + PureTask blue #0099FF element
- Transformation pillar: "Professional illustration split-panel: LEFT = [specific messy scene description]. RIGHT = same space spotless, warm light, PureTask blue #0099FF accent. Magazine-quality design."
- Proof pillar: "Clean premium infographic design: white background, PureTask blue #0099FF headers, large bold stats (4.9★, 10,000+, 98%), minimal layout, magazine typography."
- Trust pillar: "Real lifestyle scene: [specific scenario]. Natural window light. Warm tones. PureTask blue #0099FF detail visible."
- Local pillar: "Home interior in [city]. Through large windows: [specific city landmark]. PureTask blue #0099FF accent. Natural light."
- NEVER write: "nice clean home", "professional cleaner", "happy homeowners" — always be SPECIFIC

OUTPUT FORMAT: Valid JSON array only. No markdown fences. No explanatory text outside the JSON.`;

const AUDITOR_PROMPT = `You are an independent content auditor for PureTask (home cleaning marketplace).
Context: https://www.puretask.co | 4.9★ | 10,000+ clients | 98% satisfaction | 2,400+ cleaners | 50+ cities
Your job: catch score inflation. Be a skeptical consumer who has seen 1,000 cleaning ads.

NOTE: The image_url field will be "CONFIRMED" if a real image was successfully generated, or "MISSING" if none.
A CONFIRMED image satisfies the visual requirement — do NOT penalize for missing image if image_url is CONFIRMED.
A MISSING image means the post cannot be published — subtract 3 from conversion score.

CLARITY (1-10): Does a complete stranger instantly understand what PureTask is and exactly what to do?
10=crystal clear product+CTA+URL. 8=clear, minor polish. 6=vague CTA or had to re-read. 4=confusing. 2=no idea.

RELATABILITY (1-10): Does this feel written for a SPECIFIC real person, not just anyone?
10=hyper-specific scenario, reader says "this is literally me." 8=recognizable, feels personal. 6=somewhat relatable but broad. 4=generic. 2=corporate speak.

CONVERSION (1-10): Is there a compelling reason to act RIGHT NOW?
10=urgency+real stats+direct CTA+URL, hard to ignore. 8=at least 2 strong signals. 6=CTA present but weak. 4=vague. 2=no reason to click.
If image_url is "MISSING" → subtract 3 from your conversion score before responding.

POSITIVE SIGNALS to recognize (boost scores accordingly):
- URL https://www.puretask.co present → clarity signal
- Real stats (4.9★, 10,000+, 98%, 6 hrs) present → conversion signal
- Specific scenario (not generic) → relatability signal
- Clear direct CTA → conversion signal
- image_url = CONFIRMED → visual requirement satisfied, no penalty

RESPOND JSON ONLY — no text outside the JSON:
{"clarity": number, "relatability": number, "conversion": number, "verdict": "1 sentence: strongest element AND biggest weakness"}`;

const DRAFT_SCHEMA = `{
  "title": "descriptive specific title — city name if local",
  "audience": "Busy Homeowners|Working Professionals|Families|Seniors|Cleaners / Gig Workers|Airbnb Hosts",
  "pillar": "Convenience|Trust|Transformation|Recruitment|Local|Proof",
  "hook": "SPECIFIC scenario or emotional contrast — see approved examples above. NEVER a generic question.",
  "primary_caption": "2-3 punchy sentences. At least one real stat. Ends https://www.puretask.co",
  "cta_1": "specific action CTA ending https://www.puretask.co",
  "cta_2": "secondary angle CTA ending https://www.puretask.co",
  "cta_3": "softer CTA ending https://www.puretask.co",
  "image_prompt": "SPECIFIC DALL-E 3 scene — people, setting, lighting, PureTask blue #0099FF element. See rules above.",
  "script_15sec": "~38 words natural spoken VO. Ends: Visit https://www.puretask.co",
  "script_30sec": "~75 words natural spoken VO. Ends: Visit https://www.puretask.co",
  "platform_x": "under 280 chars, punchy, URL",
  "platform_instagram": "short punchy lines with line breaks, 8-15 hashtags, URL",
  "platform_facebook": "3-5 sentence story format, 3-5 hashtags, URL",
  "platform_linkedin": "story → insight → CTA, 3-5 pro hashtags, URL",
  "platform_tiktok": "POV or tell-me-you format, fast punchy, URL — REQUIRED, NEVER null or empty string",
  "platform_pinterest": "aspirational how-to framing, 8-12 keyword hashtags, URL",
  "city": null,
  "week_tag": "",
  "campaign_tag": "",
  "clarity_score": 0,
  "relatability_score": 0,
  "conversion_score": 0,
  "editor_notes": "1 sentence: strongest element and main weakness"
}`;

const CONTENT_THEMES = [
  { pillar: "Convenience", audience: "Busy Homeowners",        angle: "9pm Friday. Sink full. Company coming tomorrow. 3-minute booking solves it." },
  { pillar: "Convenience", audience: "Working Professionals",   angle: "47 billed hours this week. Zero of your 48 weekend hours should involve a mop." },
  { pillar: "Trust",       audience: "Families",                angle: "Same cleaner every visit. Your kids know her name. Background checked." },
  { pillar: "Trust",       audience: "Busy Homeowners",         angle: "GPS check-in on arrival. Before/after photos in your inbox. Full visibility every job." },
  { pillar: "Transformation", audience: "Busy Homeowners",     angle: "Split-panel: LEFT=counters piled with mail, dusty blinds, grimy stovetop. RIGHT=gleaming kitchen, fresh flowers, morning light." },
  { pillar: "Proof",       audience: "Busy Homeowners",         angle: "10,000+ clients. 4.9★. 98% satisfaction. Numbers don't lie — and ours are earned." },
  { pillar: "Recruitment", audience: "Cleaners / Gig Workers",  angle: "Handy keeps 35%. TaskRabbit keeps 30%. PureTask keeps 15-20%. Same work. Dramatically more money." },
  { pillar: "Local",       audience: "Busy Homeowners",         angle: "City-specific verified cleaners, booked online in 3 minutes." },
];

const BRAND_IMAGE_PREFIX = `PureTask branded lifestyle photography. Clean minimal aesthetic. White and light gray tones. Bright PureTask blue (#0099FF) accents. Bright natural lighting. Aspirational magazine-quality. No text overlays. Modern home interiors. `;

async function callGPT(messages: any[], temp = 0.85, maxTokens = 4000): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o", messages, temperature: temp, max_tokens: maxTokens })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// ─────────────────────────────────────────────
// STEP 1: Generate copy
// ─────────────────────────────────────────────
async function generateDrafts(theme: any, count: number, weekTag: string, campaignTag: string): Promise<any[]> {
  const raw = await callGPT([
    { role: "system", content: WRITER_PROMPT },
    { role: "user", content: `Generate ${count} PureTask draft(s) as a JSON array. Schema per item:\n${DRAFT_SCHEMA}\n\nPillar: ${theme.pillar} | Audience: ${theme.audience}\nAngle: ${theme.angle}\n\nCRITICAL: clarity_score, relatability_score, conversion_score MUST be integers between 1-10. NOT 0. NOT null. NOT a string.\nweek_tag="${weekTag}" campaign_tag="${campaignTag}"\nEvery platform field must be unique — not copy-pasted.\nJSON array only, no markdown.` }
  ]);
  try { return JSON.parse(raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()); }
  catch { return []; }
}

// ─────────────────────────────────────────────
// STEP 2: Generate image (BEFORE scoring)
// ─────────────────────────────────────────────
async function generateImage(imagePrompt: string): Promise<string | null> {
  if (!imagePrompt || imagePrompt.length < 20) return null;
  try {
    const fullPrompt = BRAND_IMAGE_PREFIX + imagePrompt;
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: fullPrompt.slice(0, 4000),
        n: 1,
        size: "1792x1024",
        quality: "hd",
        style: "vivid",
      })
    });
    const data = await res.json();
    const url = data?.data?.[0]?.url;
    if (!url) {
      console.warn("[ImageGen] No URL returned:", JSON.stringify(data).slice(0, 200));
      return null;
    }
    return url;
  } catch (e: any) {
    console.error("[ImageGen] Error:", e.message);
    return null;
  }
}

// ─────────────────────────────────────────────
// STEP 3: Audit with image_url status included
// ─────────────────────────────────────────────
async function auditDraft(draft: any, imageUrl: string | null): Promise<{ clarity: number; relatability: number; conversion: number; verdict: string }> {
  const hasURL = (draft.platform_facebook || "").includes("puretask.co");
  const hasStats = !!(draft.platform_facebook || "").match(/4\.9|10,000|98%|2,400|6 hour/);
  const imageStatus = imageUrl ? "CONFIRMED" : "MISSING";

  const text = `Hook: "${draft.hook}"
Facebook: "${(draft.platform_facebook || "").slice(0, 300)}"
Instagram: "${(draft.platform_instagram || "").slice(0, 200)}"
Image prompt: "${(draft.image_prompt || "").slice(0, 200)}"
image_url: ${imageStatus}
URL present: ${hasURL ? "YES" : "NO"} | Stats present: ${hasStats ? "YES" : "NO"}`;

  const raw = await callGPT([{ role: "system", content: AUDITOR_PROMPT }, { role: "user", content: text }], 0.2, 250);
  try {
    const p = JSON.parse(raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
    return {
      clarity: Math.min(10, Math.max(1, Number(p.clarity) || 5)),
      relatability: Math.min(10, Math.max(1, Number(p.relatability) || 5)),
      conversion: Math.min(10, Math.max(1, Number(p.conversion) || 5)),
      verdict: p.verdict || ""
    };
  } catch {
    return { clarity: 5, relatability: 5, conversion: imageUrl ? 5 : 2, verdict: "Parse error in auditor response" };
  }
}

// ─────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────
export default async function handler(req: Request) {
  const db = createClientFromRequest(req);

  try {
    const body = await req.json().catch(() => ({}));
    const {
      week_tag = `Week-${new Date().toISOString().slice(0,7)}`,
      campaign_tag = "",
      drafts_per_theme = 1,
      themes = null,
      source_idea_id = null,
    } = body;

    const selectedThemes = themes
      ? CONTENT_THEMES.filter(t => themes.includes(t.pillar))
      : CONTENT_THEMES;

    const saved: any[] = [];
    const rejected: any[] = [];

    for (const theme of selectedThemes) {
      const drafts = await generateDrafts(theme, drafts_per_theme, week_tag, campaign_tag);

      for (const draft of drafts) {
        if (!draft.hook || !draft.platform_facebook) {
          rejected.push({ title: draft.title, reason: "Missing required fields" });
          continue;
        }

        // v4.2 writer scores (parse as numbers)
        const writerC  = Math.min(10, Math.max(1, Number(draft.clarity_score)     || 5));
        const writerR  = Math.min(10, Math.max(1, Number(draft.relatability_score) || 5));
        const writerCo = Math.min(10, Math.max(1, Number(draft.conversion_score)   || 5));

        // ─── STEP 2: Generate image BEFORE scoring ───
        console.log(`[v5.0] 🖼 Generating image for "${draft.title}"...`);
        const imageUrl = await generateImage(draft.image_prompt);
        console.log(`[v5.0] ${imageUrl ? "✅ Image ready" : "❌ Image failed"} for "${draft.title}"`);

        // ─── STEP 3: Audit with image status ───
        const audit = await auditDraft(draft, imageUrl);

        // DUAL-PASS: take minimum per dimension to prevent inflation
        const finalC  = Math.min(writerC,  audit.clarity);
        const finalR  = Math.min(writerR,  audit.relatability);
        const finalCo = Math.min(writerCo, audit.conversion);
        const avg = (finalC + finalR + finalCo) / 3;

        const imageNote = imageUrl ? `image=✅` : `image=❌ (scored without image — penalty applied)`;
        const editorNotes = `[v5.0] Writer C${writerC}/R${writerR}/Co${writerCo} | Auditor C${audit.clarity}/R${audit.relatability}/Co${audit.conversion} | ${imageNote} | Final avg ${avg.toFixed(1)} | ${audit.verdict}`;

        // Hard block: reject if no image (can't post without one)
        if (!imageUrl) {
          console.log(`[v5.0] 🚫 NO IMAGE — saving as Draft regardless of score: "${draft.title}"`);
          // Still save as Draft (not Rejected) — image may generate via hourly automation later
          const record = await db.ContentDraft.create({
            title: draft.title || `${theme.pillar} — ${theme.audience}`,
            audience: draft.audience || theme.audience,
            pillar: draft.pillar || theme.pillar,
            hook: draft.hook,
            primary_caption: draft.primary_caption || "",
            cta_1: draft.cta_1 || "",
            cta_2: draft.cta_2 || "",
            cta_3: draft.cta_3 || "",
            image_prompt: draft.image_prompt || "",
            image_url: null,
            script_15sec: draft.script_15sec || "",
            script_30sec: draft.script_30sec || "",
            platform_x: draft.platform_x || "",
            platform_instagram: draft.platform_instagram || "",
            platform_facebook: draft.platform_facebook || "",
            platform_linkedin: draft.platform_linkedin || "",
            platform_tiktok: draft.platform_tiktok || "",
            platform_pinterest: draft.platform_pinterest || "",
            city: draft.city || null,
            week_tag,
            campaign_tag,
            status: "Draft",  // never Approved without image
            clarity_score: finalC,
            relatability_score: finalR,
            conversion_score: finalCo,
            editor_notes: editorNotes,
            posted_platforms: "",
          });
          saved.push({ id: record.id, title: record.title, status: "Draft (no image)", avg: avg.toFixed(1) });
          continue;
        }

        // ─── STEP 4: Determine status from final scored result ───
        let status = avg >= 7.5 ? "Approved" : avg >= 5.0 ? "Draft" : "Rejected";

        if (status === "Rejected") {
          rejected.push({ title: draft.title, avg: avg.toFixed(1), notes: editorNotes });
          console.log(`[v5.0] ❌ REJECTED "${draft.title}" avg=${avg.toFixed(1)}`);
          continue;
        }

        // ─── STEP 5: Save with image_url populated ───
        const record = await db.ContentDraft.create({
          title: draft.title || `${theme.pillar} — ${theme.audience}`,
          audience: draft.audience || theme.audience,
          pillar: draft.pillar || theme.pillar,
          hook: draft.hook,
          primary_caption: draft.primary_caption || "",
          cta_1: draft.cta_1 || "",
          cta_2: draft.cta_2 || "",
          cta_3: draft.cta_3 || "",
          image_prompt: draft.image_prompt || "",
          image_url: imageUrl,  // ✅ Real DALL-E 3 URL stored immediately
          script_15sec: draft.script_15sec || "",
          script_30sec: draft.script_30sec || "",
          platform_x: draft.platform_x || "",
          platform_instagram: draft.platform_instagram || "",
          platform_facebook: draft.platform_facebook || "",
          platform_linkedin: draft.platform_linkedin || "",
          platform_tiktok: draft.platform_tiktok || "",
          platform_pinterest: draft.platform_pinterest || "",
          city: draft.city || null,
          week_tag,
          campaign_tag,
          status,
          clarity_score: finalC,
          relatability_score: finalR,
          conversion_score: finalCo,
          editor_notes: editorNotes,
          posted_platforms: "",
        });

        if (source_idea_id) {
          try { await db.ContentIdea.update(source_idea_id, { converted_draft_id: record.id, status: "Converted" }); } catch {}
        }

        saved.push({ id: record.id, title: record.title, status, avg: avg.toFixed(1), image: "✅" });
        console.log(`[v5.0] ✅ ${status} "${record.title}" avg=${avg.toFixed(1)} image=✅`);
      }
    }

    return Response.json({
      ok: true,
      version: "5.0 — image-first pipeline",
      generated: saved.length,
      rejected: rejected.length,
      approved: saved.filter(s => s.status === "Approved").length,
      draft_count: saved.filter(s => s.status !== "Approved").length,
      images_generated: saved.filter(s => s.image === "✅").length,
      results: saved,
      rejections: rejected,
    });

  } catch (e: any) {
    console.error("[ContentGen v5.0 Error]", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
