// PureTask Image Generator v6.0 — Base44 Native Image Generation
// ─────────────────────────────────────────────────────────────────────────────
// KEY CHANGE from v5.0: Uses Base44's built-in generate_image tool instead of
// OpenAI DALL-E. This means:
//   ✅ No OpenAI billing required
//   ✅ Images saved directly to permanent Base44 CDN (media.base44.com)
//   ✅ URLs never expire
//   ✅ No separate CDN upload step needed
//
// Exports used by other content generators:
//   generateImageForDraft(draft)  → string | null  (permanent CDN URL)
//   buildImagePrompt(draft)       → string
//   PILLAR_VISUAL_GUIDE           → Record<string, string>
// ─────────────────────────────────────────────────────────────────────────────

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const APP_ID = "69d5e4bdf3e0e9aab2818c8a";

// ── Fallback / expired URL detection ────────────────────────────────────────
const BLOCKED_PATTERNS = [
  "unsplash.com",
  "photo-1558618666",
  "photo-1584820927",
  "photo-1609220136",
  "oaidalleapiprodscus.blob.core.windows.net", // OpenAI temp URLs — always expired
];

export function isFallback(url: string | null | undefined): boolean {
  if (!url) return true;
  return BLOCKED_PATTERNS.some(p => url.includes(p));
}

export function isPermanentCDN(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("media.base44.com");
}

// ── Visual style guide per pillar ────────────────────────────────────────────
export const PILLAR_VISUAL_GUIDE: Record<string, string> = {
  Transformation:
    "Split-panel before/after: LEFT = cluttered messy room (visible dust, piled mail, laundry on chair, dim lighting). RIGHT = exact same room completely transformed — gleaming floors, fresh flowers, bright sunlight, immaculate surfaces. Text overlay: 'Before' left, 'After — PureTask' right in PureTask blue #0099FF. Magazine-quality reveal.",
  Proof:
    "Clean premium infographic: white background, PureTask blue #0099FF headers. Large bold stats: 4.9★ rating, 10,000+ clients, 98% satisfaction, 2,400+ verified cleaners. Minimal Apple-product-marketing aesthetic. Trust and credibility in every detail.",
  Trust:
    "Warm lifestyle moment: homeowner at front door warmly greeting a professional cleaner. Natural window light, golden tones. Genuine smiles. Real, human — NOT staged or stock. Warmth and confidence.",
  Convenience:
    "Bright modern home — morning light. Person relaxed on couch with coffee, clean home around them. Phone in hand, visibly at ease and happy. Aspirational but real. Time reclaimed.",
  Recruitment:
    "Empowering scene: professional cleaner in crisp white uniform, confident, genuinely smiling, in control. Bright clean work environment. Independence and opportunity energy. NOT servile. NOT stock.",
  Local:
    "Premium home interior. Through large floor-to-ceiling windows: the city's most recognizable skyline or landmark clearly visible outside. Natural daylight. Polished lifestyle feel.",
  Seniors:
    "Warm dignified scene: senior in spotlessly clean bright home, relaxed with cup of tea. Warm golden afternoon light. NOT frail, NOT medical. Peace of mind and independence evident. Adult child may be present with warm smile.",
  Spring:
    "Bright spring transformation: fresh tulips/lilies in a clear vase on a polished table, natural spring light through sparkling clean windows, gleaming surfaces. Open-window spring-breeze energy. Relief and freshness.",
};

const BRAND_PREFIX =
  `Magazine-quality lifestyle photography for PureTask, a premium home cleaning marketplace. ` +
  `Brand values: clean, modern, premium, warm, trustworthy, human. ` +
  `Color palette: PureTask blue #0099FF accents, white backgrounds, natural warm light. ` +
  `Style: real lifestyle photography — NOT stock, NOT corporate, NOT staged. ` +
  `Always include a subtle PureTask blue #0099FF design element (throw pillow, artwork, wall accent, text overlay).`;

// ── Build image prompt ───────────────────────────────────────────────────────
export function buildImagePrompt(draft: any): string {
  const pillarHint = PILLAR_VISUAL_GUIDE[draft.pillar] ?? "";
  const cityHint   = draft.city
    ? `Setting: ${draft.city} home. Show recognizable ${draft.city} landmark or skyline through a window if possible.`
    : "";
  const scene = draft.image_prompt?.trim()
    ?? `PureTask ${draft.pillar ?? "Convenience"} content — ${draft.audience ?? "homeowner"} audience. Clean, premium, lifestyle-authentic scene.`;

  return `${BRAND_PREFIX}\n\n${pillarHint ? `PILLAR VISUAL:\n${pillarHint}\n\n` : ""}${cityHint ? `${cityHint}\n\n` : ""}SCENE:\n${scene}`.slice(0, 3900);
}

// ── Generate image via Base44 API → returns permanent CDN URL ────────────────
async function generateBase44Image(prompt: string): Promise<string | null> {
  const apiKey = Deno.env.get("BASE44_API_KEY") ?? Deno.env.get("APP_API_KEY") ?? "";

  const res = await fetch(`https://app.base44.com/api/apps/${APP_ID}/tools/generate_image`, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "X-API-Key": apiKey } : {}),
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[ImageGen v6] Base44 API ${res.status}: ${text.slice(0, 200)}`);
    return null;
  }

  const data = await res.json();
  // Base44 returns { url: "https://media.base44.com/..." }
  const url = data?.url ?? data?.file_url ?? data?.image_url ?? null;
  if (url) console.log(`[ImageGen v6] ✅ CDN: ${url}`);
  return url;
}

// ── Main export: generate image for a draft ──────────────────────────────────
export async function generateImageForDraft(draft: {
  id?:           string;
  title?:        string;
  pillar?:       string;
  audience?:     string;
  city?:         string;
  image_prompt?: string;
}): Promise<string | null> {
  const prompt = buildImagePrompt(draft);
  console.log(`[ImageGen v6] Generating for: "${draft.title ?? 'untitled'}"`);
  const url = await generateBase44Image(prompt);
  if (!url) console.warn(`[ImageGen v6] ❌ Failed for "${draft.title}"`);
  return url;
}

// ── HTTP batch handler ───────────────────────────────────────────────────────
// Manual trigger only (hourly automation is paused).
// Processes drafts missing permanent images — prioritized by pillar.
Deno.serve(async (req) => {
  try {
    const base44    = createClientFromRequest(req);
    const db        = base44.asServiceRole.entities;
    const body      = await req.json().catch(() => ({}));
    const batchSize = Number(body.batch_size ?? 5);

    const PRIORITY = ["Transformation","Proof","Trust","Convenience","Local","Recruitment","Seniors","Spring"];

    const all: any[] = await db.ContentDraft.list({ limit: 200 });

    // Target: any draft that lacks a permanent CDN image and has no video
    const needsImage = all.filter((d: any) =>
      ["Approved", "Draft"].includes(d.status) &&
      !d.video_cdn_url &&
      !isPermanentCDN(d.image_url)
    );

    needsImage.sort((a: any, b: any) => {
      const ai = PRIORITY.indexOf(a.pillar) >= 0 ? PRIORITY.indexOf(a.pillar) : 99;
      const bi = PRIORITY.indexOf(b.pillar) >= 0 ? PRIORITY.indexOf(b.pillar) : 99;
      return ai - bi;
    });

    const batch     = needsImage.slice(0, batchSize);
    const remaining = needsImage.length - batch.length;

    console.log(`[ImageGen v6] ${needsImage.length} need permanent images. Batch: ${batch.length}`);

    const results: any[] = [];

    for (const draft of batch) {
      try {
        const url = await generateImageForDraft(draft);
        if (url && isPermanentCDN(url)) {
          await db.ContentDraft.update(draft.id, { image_url: url });
          results.push({ id: draft.id, title: draft.title, status: "✅ permanent CDN saved" });
        } else if (url) {
          await db.ContentDraft.update(draft.id, { image_url: url });
          results.push({ id: draft.id, title: draft.title, status: "⚠️ saved (not recognized as CDN)" });
        } else {
          results.push({ id: draft.id, title: draft.title, status: "❌ generation failed" });
        }
      } catch (e: any) {
        console.error(`[ImageGen v6] Exception "${draft.title}":`, e.message);
        results.push({ id: draft.id, title: draft.title, status: `❌ error: ${e.message.slice(0, 80)}` });
      }
      // Small delay between requests
      await new Promise(r => setTimeout(r, 1500));
    }

    const ok   = results.filter(r => r.status.startsWith("✅") || r.status.startsWith("⚠️")).length;
    const fail = results.filter(r => r.status.startsWith("❌")).length;

    return Response.json({
      ok:                    true,
      engine:                "base44_native",
      processed:             batch.length,
      saved_to_cdn:          ok,
      failed:                fail,
      remaining_after_batch: remaining,
      results,
    });

  } catch (e: any) {
    console.error("[ImageGen v6 Error]", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});
