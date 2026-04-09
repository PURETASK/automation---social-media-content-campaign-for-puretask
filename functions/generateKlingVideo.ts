// PureTask — Kling AI Video Generation v3
// text2video + image2video (DALL-E reference frames)
// Deploy timestamp: 2026-04-09

const APP_ID = "69d5e4bdf3e0e9aab2818c8a";
const KLING_ACCESS_KEY = Deno.env.get("KLING_ACCESS_KEY") ?? "";
const KLING_SECRET_KEY = Deno.env.get("KLING_SECRET_KEY") ?? "";
const BASE44_API_KEY = Deno.env.get("BASE44_API_KEY") ?? "";

function base64urlEncode(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const b64 = btoa(String.fromCharCode(...bytes));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function generateKlingJWT(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const h = base64urlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const p = base64urlEncode(JSON.stringify({ iss: KLING_ACCESS_KEY, exp: now + 1800, nbf: now - 5 }));
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(KLING_SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${h}.${p}`));
  return `${h}.${p}.${base64urlEncode(new Uint8Array(sigBytes))}`;
}

async function submitText2Video(jwt: string, opts: {
  prompt: string; aspect_ratio: string; duration: string; mode: string; model: string;
}): Promise<string> {
  const res = await fetch("https://api.klingai.com/v1/videos/text2video", {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model_name: opts.model,
      prompt: opts.prompt,
      negative_prompt: "blurry, dark, messy, cluttered, distorted, low quality",
      cfg_scale: 0.5,
      mode: opts.mode,
      aspect_ratio: opts.aspect_ratio,
      duration: opts.duration,
    }),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`Kling t2v error: ${data.message} (code ${data.code})`);
  return data.data.task_id;
}

async function submitImage2Video(jwt: string, opts: {
  image_url: string; prompt: string; duration: string; mode: string; model: string;
}): Promise<string> {
  const res = await fetch("https://api.klingai.com/v1/videos/image2video", {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model_name: opts.model,
      image: opts.image_url,
      prompt: opts.prompt,
      negative_prompt: "blurry, dark, messy, cluttered, distorted, low quality",
      cfg_scale: 0.5,
      mode: opts.mode,
      duration: opts.duration,
    }),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`Kling i2v error: ${data.message} (code ${data.code})`);
  return data.data?.task_id ?? data.task_id;
}

async function pollVideoStatus(jwt: string, task_id: string, type: "text2video" | "image2video"): Promise<string> {
  for (let i = 0; i < 72; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const res = await fetch(`https://api.klingai.com/v1/videos/${type}/${task_id}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const data = await res.json();
    const status = data?.data?.task_status;
    console.log(`[Kling] Poll ${i + 1}/72 — ${status}`);
    if (status === "succeed") {
      const videos = data?.data?.task_result?.videos ?? [];
      if (videos.length > 0) return videos[0].url;
      throw new Error("Succeeded but no video URL returned");
    }
    if (status === "failed") throw new Error(`Render failed: ${JSON.stringify(data?.data?.task_status_msg)}`);
  }
  throw new Error("Timed out after 6 minutes");
}

async function getDraft(id: string): Promise<any> {
  const res = await fetch(`https://api.base44.com/api/apps/${APP_ID}/entities/ContentDraft/${id}`, {
    headers: { "api-key": BASE44_API_KEY },
  });
  return res.json();
}

async function updateDraft(id: string, payload: any): Promise<void> {
  await fetch(`https://api.base44.com/api/apps/${APP_ID}/entities/ContentDraft/${id}`, {
    method: "PUT",
    headers: { "api-key": BASE44_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function buildVideoPrompt(draft: any, ar: string): string {
  const base = draft.video_prompt || draft.script_15sec || draft.hook || "";
  const pillarMap: Record<string, string> = {
    Convenience: "effortless booking, relaxed homeowner, time-saving, modern clean home",
    Trust: "verified professional cleaner, GPS check-in, background check badge, before/after photo proof",
    Transformation: "stunning before/after reveal, sparkling clean home, dramatic transformation",
    Recruitment: "happy cleaner earning well, flexible schedule, phone showing high earnings",
    Local: "neighborhood street, local city feel, familiar community",
    Proof: "5-star testimonial, satisfied family, 4.9 star rating badge, real results",
  };
  const ctx = pillarMap[draft.pillar] ?? pillarMap["Trust"];
  const fmt = ar === "9:16"
    ? "vertical 9:16, TikTok/Reels, fast dynamic cuts"
    : "horizontal 16:9, YouTube Shorts, cinematic";
  return `${base}. PureTask brand: white minimalist, bright blue #0099FF, premium modern homes. Audience: ${draft.audience || "Busy Homeowners"}. ${ctx}. ${fmt}. High quality. No clutter, no dark tones.`.trim();
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok");
  try {
    const body = await req.json().catch(() => ({}));
    const {
      draft_id,
      prompt,
      image_url,
      use_draft_image = false,
      aspect_ratio = "9:16",
      duration = "5",
      mode = "std",
      model = "kling-v1",
      generate_both = false,
    } = body;

    let draft: any = null;
    if (draft_id) {
      draft = await getDraft(draft_id);
      console.log(`[Kling] Draft: "${draft.title}" | Pillar: ${draft.pillar}`);
    }

    const finalPrompt = prompt || (draft ? buildVideoPrompt(draft, aspect_ratio)
      : "Professional cleaner at a bright modern home. PureTask: white minimalist, blue accents. Trust, reliability. Cinematic.");

    // Auto-detect image URL from draft editor_notes if use_draft_image
    let finalImageUrl = image_url || null;
    if (!finalImageUrl && use_draft_image && draft?.editor_notes) {
      const m = draft.editor_notes.match(/https?:\/\/[^\s"]+\.(jpg|jpeg|png|webp)/i);
      if (m) finalImageUrl = m[0];
    }

    const jwt = await generateKlingJWT();
    const aspects: string[] = generate_both ? ["9:16", "16:9"] : [aspect_ratio];
    const results: any[] = [];

    for (const ar of aspects) {
      const isI2V = !!finalImageUrl;
      const jobType = isI2V ? "image2video" : "text2video";

      console.log(`[Kling] Submitting ${jobType} | ${ar} | ${mode} | ${duration}s`);

      const task_id = isI2V
        ? await submitImage2Video(jwt, { image_url: finalImageUrl!, prompt: finalPrompt, duration, mode, model })
        : await submitText2Video(jwt, { prompt: finalPrompt, aspect_ratio: ar, duration, mode, model });

      console.log(`[Kling] Task ID: ${task_id}`);
      const video_url = await pollVideoStatus(jwt, task_id, jobType);
      console.log(`[Kling] ✅ Done (${ar}): ${video_url}`);

      results.push({ aspect_ratio: ar, task_id, video_url });

      if (draft_id && draft) {
        const upd: any = {
          editor_notes: `${draft.editor_notes || ""}\n[Kling ${ar} ${new Date().toISOString()}] ${video_url}`.trim(),
        };
        if (ar === "9:16") {
          upd.platform_tiktok = `VIDEO_URL: ${video_url}\n\n${draft.platform_tiktok || ""}`.trim();
        } else {
          upd.platform_instagram = `VIDEO_URL: ${video_url}\n\n${draft.platform_instagram || ""}`.trim();
        }
        await updateDraft(draft_id, upd);
        // Refresh draft for next iteration
        draft = await getDraft(draft_id);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      draft_id: draft_id || null,
      draft_title: draft?.title || null,
      videos: results,
      prompt_used: finalPrompt,
      mode,
      duration_seconds: duration,
    }), { headers: { "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("[Kling] ERROR:", err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
}
