// PureTask Core Content Generator v3.1
// Fixes: inline image gen, score audit layer, city image_prompt enforcement,
//        TikTok never null, Facebook min 3 sentences, platform_tiktok always present

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { generateImageForDraft } from './generateImages.ts';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// ── Score Auditor — catches GPT inflation ─────────────────────────────────
// Re-scores the draft using the actual rubric rules as a second pass
async function auditScore(draft: any): Promise<{ clarity: number; relatability: number; conversion: number; notes: string }> {
  const auditPrompt = `You are a STRICT content auditor for PureTask social media.
You must re-score this draft honestly using the v3.0 rubric. Grade like a skeptical consumer — NOT the marketer who wrote it.

RUBRIC:
CLARITY (1-10): Would a complete stranger instantly understand what PureTask is and EXACTLY what to do next?
- 9-10: Zero ambiguity. Message + CTA + URL crystal clear.
- 7-8: Clear message, obvious CTA, URL present.
- 5-6: Message understandable but CTA vague or URL missing.
- 3-4: Confusing, generic, or missing key info.

RELATABILITY (1-10): Would someone stop mid-scroll and say "that's LITERALLY me"?
- 9-10: Hyper-specific real pain point. Reader feels SEEN. Strong emotional resonance.
- 7-8: Clear targeting, recognizable scenario, feels personal.
- 5-6: Somewhat relatable but too broad. Could apply to anyone.
- 3-4: Generic "cleaning is hard". No specificity. Could be ANY cleaning brand.
- 1-2: Talks AT the audience, not TO them.

CONVERSION (1-10): Does this make someone click, book, or share RIGHT NOW?
- 9-10: Strong urgency + real stats + direct CTA + URL. Hard to ignore.
- 7-8: At least 2 of: urgency, proof, direct CTA. Drives action.
- 5-6: Has a CTA but weak or missing proof/urgency.
- 3-4: Vague CTA. No reason to act NOW.

AUTO-PENALTIES (apply before final score):
- No image_url or image_prompt → -3 Conversion
- Missing https://www.puretask.co in captions → -2 Clarity
- Generic hook (feature statement, not emotional scenario) → -2 Relatability
- Missing real stats when available → -1 Conversion
- Platform copy copy-pasted (not adapted) → -2 Clarity
- City post with no city in image_prompt → -2 Relatability

DRAFT TO AUDIT:
Hook: "${draft.hook}"
Primary caption: "${(draft.primary_caption || '').slice(0, 300)}"
Facebook copy: "${(draft.platform_facebook || '').slice(0, 200)}"
Image prompt: "${(draft.image_prompt || '').slice(0, 200)}"
City: "${draft.city || 'none'}"
Original scores: Clarity ${draft.clarity_score}, Relatability ${draft.relatability_score}, Conversion ${draft.conversion_score}

Respond in JSON only:
{"clarity": number, "relatability": number, "conversion": number, "audit_notes": "1-2 sentences on what's strong and what's weak"}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: auditPrompt }],
      temperature: 0.2, max_tokens: 300
    })
  });
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "{}";
  try {
    const parsed = JSON.parse(raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
    return { clarity: parsed.clarity, relatability: parsed.relatability, conversion: parsed.conversion, notes: parsed.audit_notes || "" };
  } catch {
    return { clarity: draft.clarity_score, relatability: draft.relatability_score, conversion: draft.conversion_score, notes: "Audit parse failed — using original scores" };
  }
}

const SYSTEM_PROMPT = `You are the PureTask AI content engine — full autopilot mode.
PureTask is a trust-first home cleaning marketplace. URL: https://www.puretask.co

LOCKED CONSTANTS:
- URL https://www.puretask.co in EVERY caption, EVERY platform. No exceptions.
- Stats: 10,000+ clients | 4.9★ | 98% satisfaction | 2,400+ cleaners | 50+ cities | 6 hrs saved | cleaners keep 80-85%
- Brand voice: Direct. Confident. Warm. Short punchy lines. No fluff. No fake urgency. No hype words.

CONTENT PILLARS: Convenience | Trust | Transformation | Recruitment | Local | Proof
AUDIENCES: Busy Homeowners | Working Professionals | Families | Seniors | Cleaners / Gig Workers | Airbnb Hosts

SCORING — grade like a SKEPTICAL CONSUMER, not a marketer. A 7 is hard to earn.
CLARITY: stranger instantly understands PureTask + exactly what to do (9-10=crystal clear, 7-8=clear minor polish, 5-6=vague CTA, 3-4=confusing)
RELATABILITY: person stops scrolling saying "that's LITERALLY me" (9-10=hyper-specific felt pain, 7-8=recognizable scenario, 5-6=too broad, 3-4=generic)
CONVERSION: makes someone click/book/share RIGHT NOW (9-10=urgency+proof+CTA irresistible, 7-8=drives action, 5-6=weak, 3-4=no reason to act)

AUTO-PENALTIES before final scores:
- No image_prompt → -3 Conversion
- URL missing from any caption → -2 Clarity
- Generic hook (feature statement not emotional scenario) → -2 Relatability
- City post, no city in image_prompt → -2 Relatability
- Stats available but not used → -1 Conversion
- Copy-pasted across platforms → -2 Clarity

THRESHOLDS: ≥7.5 avg = Approved | 5.0-7.4 = Draft | <5.0 = Rejected

PLATFORM RULES:
- Facebook: 3+ sentences minimum, practical community feel, 3-5 hashtags, URL
- Instagram: emotional visual-first, 8-15 hashtags, URL
- TikTok: ALWAYS PRESENT, fast hook POV format, URL — NEVER null
- LinkedIn: story→insight→connection, 3-5 pro hashtags, URL
- Pinterest: aspirational keyword-rich, 8-12 hashtags, URL
- X: under 280 chars, URL

IMAGE PROMPT RULES:
- ALWAYS specific enough for DALL-E 3 to produce a real branded image
- City posts: MUST include city name AND landmark in image_prompt
- Transformation: use illustrated split-panel description (LEFT=messy, RIGHT=clean)
- Proof: use infographic stats design description
- NEVER generic ("nice clean home") — always scene + people + lighting + brand color

OUTPUT: Valid JSON array only. No markdown.`;

const DRAFT_SCHEMA = `Each draft MUST have ALL fields:
{
  "title": "descriptive title — city name if local",
  "audience": "Busy Homeowners|Working Professionals|Families|Seniors|Cleaners / Gig Workers|Airbnb Hosts",
  "pillar": "Convenience|Trust|Transformation|Recruitment|Local|Proof",
  "hook": "specific emotional scroll-stopper — NOT a feature statement",
  "primary_caption": "2-3 sentences ends with https://www.puretask.co",
  "cta_1": "specific CTA ends with https://www.puretask.co",
  "cta_2": "secondary CTA ends with https://www.puretask.co",
  "cta_3": "soft CTA ends with https://www.puretask.co",
  "image_prompt": "Full DALL-E 3 scene: specific people, lighting, mood, PureTask blue #0099FF. City=landmark required. Transform=split panel. Proof=infographic.",
  "script_15sec": "15s VO ends: https://www.puretask.co",
  "script_30sec": "30s VO ends: https://www.puretask.co",
  "platform_x": "under 280 chars URL included",
  "platform_instagram": "emotional 8-15 hashtags URL",
  "platform_facebook": "min 3 sentences practical 3-5 hashtags URL",
  "platform_linkedin": "story insight connection 3-5 hashtags URL",
  "platform_tiktok": "REQUIRED — fast hook POV URL — NEVER null",
  "platform_pinterest": "aspirational 8-12 hashtags URL",
  "city": null,
  "clarity_score": number,
  "relatability_score": number,
  "conversion_score": number,
  "editor_notes": "honest 1-2 sentences on strengths and weaknesses"
}`;

const CONTENT_THEMES = [
  { pillar: "Convenience", audience: "Busy Homeowners", angle: "6 hours saved per clean — time reclaimed for what matters" },
  { pillar: "Trust", audience: "Busy Homeowners", angle: "Background checks, GPS, before/after photos — real safety not just a promise" },
  { pillar: "Transformation", audience: "Families", angle: "Winter grime → spring fresh — illustrated split panel emotional reset" },
  { pillar: "Recruitment", audience: "Cleaners / Gig Workers", angle: "80-85% earnings vs TaskRabbit 30% / Handy 35% — the math is clear" },
  { pillar: "Proof", audience: "Busy Homeowners", angle: "4.9★, 10K+ clients, 98% satisfaction — let the numbers speak" },
  { pillar: "Convenience", audience: "Working Professionals", angle: "You work 40+ hours a week. Weekend cleaning shouldn't be on you." },
  { pillar: "Trust", audience: "Families", angle: "Same cleaner every visit — your kids know the face coming through the door" },
  { pillar: "Local", audience: "Busy Homeowners", angle: "City-specific — your neighborhood, your cleaners, local trust" },
];

async function generateBatch(theme: any, count: number): Promise<any[]> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Generate ${count} PureTask content draft(s). Pillar: ${theme.pillar}. Audience: ${theme.audience}. Angle: ${theme.angle}. Schema: ${DRAFT_SCHEMA}. JSON array only. platform_tiktok is REQUIRED and must NEVER be null.` }
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
    const {
      drafts_per_theme = 1,
      themes = null,          // null = all 8 themes
      week_tag = "",
      audit_scores = true,    // enable score audit by default
    } = body;

    const selectedThemes = themes
      ? CONTENT_THEMES.filter(t => themes.includes(t.pillar))
      : CONTENT_THEMES;

    console.log(`[ContentGen v3.1] ${selectedThemes.length} themes, audit_scores=${audit_scores}`);
    const created: any[] = [], skipped: any[] = [];

    for (const theme of selectedThemes) {
      const drafts = await generateBatch(theme, drafts_per_theme);

      for (const draft of drafts) {
        // ── Score Audit — catches inflation ──────────────────────────────
        let clarity = draft.clarity_score || 0;
        let relatability = draft.relatability_score || 0;
        let conversion = draft.conversion_score || 0;
        let editorNotes = draft.editor_notes || "";

        if (audit_scores) {
          const audit = await auditScore(draft);
          // Use LOWER of GPT's self-score vs auditor score (conservative)
          clarity = Math.min(clarity, audit.clarity);
          relatability = Math.min(relatability, audit.relatability);
          conversion = Math.min(conversion, audit.conversion);
          editorNotes = `${editorNotes} | AUDIT: ${audit.notes}`;
          console.log(`[ContentGen] Score audit: ${draft.clarity_score}/${draft.relatability_score}/${draft.conversion_score} → ${clarity}/${relatability}/${conversion}`);
        }

        const avg = (clarity + relatability + conversion) / 3;
        const status = avg >= 7.5 ? "Approved" : avg >= 5 ? "Draft" : "Rejected";

        if (status === "Rejected") {
          skipped.push({ theme: theme.pillar, title: draft.title, avg: avg.toFixed(1), reason: editorNotes });
          continue;
        }

        // ── Enforce TikTok always present ──────────────────────────────
        if (!draft.platform_tiktok) {
          draft.platform_tiktok = `${draft.hook} Book now → https://www.puretask.co #PureTask #HomeCleaning #CleanTok`;
        }

        // ── Enforce city in image_prompt if city post ──────────────────
        if (draft.city && draft.image_prompt && !draft.image_prompt.toLowerCase().includes(draft.city.toLowerCase())) {
          draft.image_prompt = `${draft.image_prompt} — MUST show ${draft.city} skyline or landmark visually. Include text "PureTask — Now in ${draft.city}".`;
        }

        // ── Generate image INLINE ──────────────────────────────────────
        console.log(`[ContentGen v3.1] Generating image: "${draft.title}"...`);
        const image_url = await generateImageForDraft({
          pillar: theme.pillar,
          city: draft.city,
          audience: draft.audience,
          image_prompt: draft.image_prompt,
        });

        const record = await db.ContentDraft.create({
          ...draft,
          clarity_score: clarity,
          relatability_score: relatability,
          conversion_score: conversion,
          editor_notes: editorNotes,
          status,
          image_url: image_url || null,
          pillar: theme.pillar,
          week_tag: week_tag || `Week-${new Date().toISOString().split("T")[0]}`,
          heygen_status: (draft.script_30sec || draft.script_15sec) ? "Queued" : "None",
          posted_platforms: "",
          is_winner: false,
        });

        created.push({ id: record.id, title: draft.title, pillar: theme.pillar, status, avg: avg.toFixed(1), has_image: !!image_url });
        console.log(`[ContentGen v3.1] ✅ "${draft.title}" (${avg.toFixed(1)}) → ${status} | Image: ${image_url ? '✅' : '❌'}`);

        await new Promise(r => setTimeout(r, 12000)); // DALL-E 3 rate limit
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    return Response.json({
      ok: true,
      themes_processed: selectedThemes.length,
      drafts_created: created.length,
      approved: created.filter(c => c.status === "Approved").length,
      drafted: created.filter(c => c.status === "Draft").length,
      images_generated: created.filter(c => c.has_image).length,
      skipped: skipped.length,
      created,
      skipped_list: skipped,
    });

  } catch (error: any) {
    console.error("[ContentGen v3.1 Error]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
