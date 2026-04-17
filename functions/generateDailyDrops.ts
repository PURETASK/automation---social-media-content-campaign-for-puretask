import Deno from "https://deno.land/std@0.208.0/mod.ts";

export default async function handler(req: Request) {
  try {
    // Call GPT-4o via edge function - using native Deno capabilities
    const prompt = `You are the PureTask Content Engine v3.1 in FULL AUTOPILOT MODE.

Generate 3 NEW, production-ready ContentDraft records for posting TODAY (April 14, 2026).

ABSOLUTE RULES:
- https://www.puretask.co in EVERY post (no exceptions)
- Every post needs a unique image_prompt (not generic/stock)
- Platform-specific copy (NOT copy-pasted between platforms)
- Real stats only: 10K+, 4.9★, 98%, 6 hrs, 2,400+ cleaners
- One audience, one pillar, one emotional transformation per draft
- No hype language, no false claims, no guarantees

FILL THESE GAPS IN CONTENT CALENDAR:

1. **Families** / **Transformation** pillar
   - Hook style: Parent/child emotional perspective (like "My kid asked why we never go...")
   - Angle: Family bonding, quality time reclaimed, memories together
   - Primary platform: Facebook
   - Emotional trigger: Parent guilt → joy/relief

2. **Busy Homeowners** / **Proof** pillar  
   - Build confidence using real brand stats
   - Angle: 10K+ homes served, 4.9★ rating, 2,400+ vetted cleaners, 98% satisfaction
   - Primary platform: LinkedIn
   - Emotional trigger: Doubt/skepticism → confidence via numbers

3. **Working Professionals** / **Convenience** pillar
   - Angle: 6 hours saved per booking, work-life balance, Friday afternoon freedom
   - Time-scarcity + value clarity
   - Primary platform: LinkedIn
   - Emotional trigger: Time scarcity/burnout → reclaimed weekends

OUTPUT REQUIREMENTS:
Respond with ONLY a valid JSON array of 3 objects. Each object must have exactly these fields:
- title (unique, descriptive)
- audience (one specific audience segment)
- pillar (one of: Convenience, Trust, Transformation, Recruitment, Local, Proof)
- hook (first line that stops scroll - specific, not generic)
- primary_caption (100-150 chars, natural tone, includes https://www.puretask.co)
- short_caption (X/Twitter version, <280 chars, includes URL)
- long_caption (LinkedIn/blog version, 300-400 chars, professional, includes URL)
- cta_1 (primary CTA - action-oriented)
- cta_2 (secondary CTA - alternative action)
- cta_3 (tertiary CTA - sharing/engagement)
- image_prompt (detailed DALL-E 3 prompt - must be PureTask-specific, bright/modern aesthetic)
- platform_facebook (long conversational copy, includes URL)
- platform_instagram (short visual-first, 5 hashtags max, includes URL)
- platform_linkedin (professional tone, thought-leadership if applicable, includes URL)
- platform_pinterest (aspirational, keyword-rich title + description, includes URL)
- platform_x (punchy, <280 chars, includes URL)

NO explanations, NO metadata, ONLY valid JSON array.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") || "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 6000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data.content || !data.content[0]) {
      return new Response(
        JSON.stringify({
          error: "No content in response",
          raw: data,
        }),
        { status: 500 }
      );
    }

    const text = data.content[0].text;

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({
          error: "No JSON array found in response",
          raw: text.substring(0, 500),
        }),
        { status: 500 }
      );
    }

    const drafts = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(drafts), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
