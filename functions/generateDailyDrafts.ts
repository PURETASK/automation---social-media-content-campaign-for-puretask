import Anthropic from "@anthropic-ai/sdk";

interface DraftConfig {
  title: string;
  audience: string;
  pillar: string;
  hookStyle: string;
  emotionalTransformation: string;
  hook: string;
}

interface DraftOutput {
  title: string;
  audience: string;
  pillar: string;
  hook: string;
  primary_caption: string;
  platform_facebook: string;
  platform_instagram: string;
  platform_linkedin: string;
  platform_x: string;
  platform_pinterest: string;
  platform_threads: string;
  cta_1: string;
  cta_2: string;
  cta_3: string;
  image_prompt: string;
}

async function generateDraft(config: DraftConfig): Promise<DraftOutput> {
  const client = new Anthropic({
    apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
  });

  const prompt = `You are a master social media copywriter for PureTask, a home cleaning marketplace platform.

CONTEXT:
- Website: https://www.puretask.co
- Brand tone: Trustworthy, modern, helpful, efficient, polished, human, operationally reliable
- Clean-tech service marketplace focused on convenience and trust

BRAND STATS (use ONLY these—never invent):
- 10,000+ happy clients
- 2,400+ verified cleaners
- 4.9★ average rating
- 98% satisfaction rate
- 50+ cities
- 6 hours saved per deep clean visit
- Cleaners keep 80–85% of every booking

YOUR TASK: Generate a complete, platform-ready content draft.

REQUIRED PARAMETERS:
- Title: ${config.title}
- Primary Audience: ${config.audience}
- Content Pillar: ${config.pillar}
- Hook Style: ${config.hookStyle}
- Emotional Transformation: ${config.emotionalTransformation}
- Hook: ${config.hook}

RULES YOU MUST FOLLOW:
1. Every post MUST include https://www.puretask.co in the copy
2. No generic hooks ("Are you tired of...?") — use the specific hook provided
3. No hype language ("insane", "unbelievable", "crazy")
4. No guarantees or false financial claims
5. Clarity > Cleverness always
6. Each platform gets adapted copy (NOT the same text)
7. CTAs must be specific and actionable
8. Use real stats from the brand stats list only

OUTPUT FORMAT (JSON):
{
  "title": "string",
  "audience": "string",
  "pillar": "string",
  "hook": "string",
  "primary_caption": "Main Facebook/default copy (150–200 words)",
  "platform_facebook": "Facebook-specific version (max 200 words)",
  "platform_instagram": "Instagram caption (max 150 words)",
  "platform_linkedin": "LinkedIn professional version (max 300 words)",
  "platform_x": "X/Twitter version (max 280 chars)",
  "platform_pinterest": "Pinterest description (keyword-rich, max 150 words)",
  "platform_threads": "Threads version (max 500 chars)",
  "cta_1": "Primary CTA",
  "cta_2": "Secondary CTA",
  "cta_3": "Tertiary CTA",
  "image_prompt": "DALL-E 3 image prompt (specific, branded, descriptive)"
}

Generate the content NOW. Output ONLY valid JSON.`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  return JSON.parse(text);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const draft1 = await generateDraft({
      title: "Weekends With Kids Again",
      audience: "Families",
      pillar: "Convenience",
      hookStyle: "Emotional quote / kid perspective",
      emotionalTransformation: "Parental guilt resolved → relief + quality time",
      hook: "My kids asked why we stopped going to the park on Saturdays. I didn't have a good answer.",
    });

    const draft2 = await generateDraft({
      title: "Stop Losing 30% to Other Platforms",
      audience: "Cleaners / Recruiting",
      pillar: "Recruitment",
      hookStyle: "Data/math reveal with competitor contrast",
      emotionalTransformation: "Underpaid frustration → financial empowerment",
      hook: "TaskRabbit takes 30%. Handy takes 35%. PureTask? You keep 80-85% of every booking.",
    });

    const draft3 = await generateDraft({
      title: "Why 10,000+ Homeowners Choose PureTask",
      audience: "Busy Homeowners",
      pillar: "Proof",
      hookStyle: "Social proof + stats reveal",
      emotionalTransformation:
        "Uncertainty about service quality → confidence",
      hook: "10,000+ homeowners. 4.9 stars. 98% satisfaction. No coincidence. No marketing fluff.",
    });

    return new Response(JSON.stringify({ draft1, draft2, draft3 }, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating drafts:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
