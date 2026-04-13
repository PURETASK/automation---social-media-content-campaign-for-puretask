import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const PURETASK_URL = "https://www.puretask.co";
const BRAND_STATS = {
  clients: "10,000+",
  cleaners: "2,400+",
  rating: "4.9★",
  satisfaction: "98%",
  cities: "50+",
  time_saved: "6 hours",
  cleaner_keep_pct: "80-85%"
};

const GAPS = [
  { pillar: "Proof", audience: "Working Professionals", pattern: "trust_vetting" },
  { pillar: "Convenience", audience: "Seniors", pattern: "emotional_story" },
  { pillar: "Recruitment", audience: "Cleaners", pattern: "recruitment_math" }
];

async function generateDraft(
  pillar: string,
  audience: string,
  pattern: string
) {
  const patternGuides: Record<string, string> = {
    trust_vetting:
      "Competitor contrast + vetting checklist format. Hook: Direct comparison (e.g., 'Most send whoever signed up. PureTask won't'). Emotional trigger: Safety fear → relief.",
    emotional_story:
      "Emotional narrative with specific character perspective. Hook: Quote from real person (e.g., 'My kid asked why...'). Build story: problem → transformation → relief.",
    recruitment_math:
      "Earnings comparison + independence. Hook: Data reveal (e.g., 'Here's the math'). Compare PureTask (cleaners keep 80-85%) vs competitors (TaskRabbit 30%, Handy 35%)."
  };

  const prompt = `Generate ONE PureTask social media draft for ${audience} targeting ${pillar} pillar using the ${pattern} pattern.

CRITICAL RULES:
1. Website URL MUST be: ${PURETASK_URL} (in EVERY platform copy)
2. Use only real stats: 10,000+ clients | 4.9★ | 98% satisfaction | 2,400+ cleaners | 50+ cities | 6 hours saved | cleaners keep 80-85%
3. NO generic hooks ("Are you tired of..." "Don't you hate...") — be specific and relatable
4. Each platform copy must be unique (NOT copy-pasted)
5. Include detailed image_prompt for DALL-E 3 (specific, branded, blue #0099FF, clean modern aesthetic)
6. Provide 3 different CTA variants

PATTERN GUIDE: ${patternGuides[pattern]}

OUTPUT as valid JSON only:
{
  "title": "Brief title",
  "audience": "${audience}",
  "pillar": "${pillar}",
  "hook": "Specific, relatable hook under 140 chars",
  "primary_caption": "Main story (150-200 words, include ${PURETASK_URL})",
  "short_caption": "X-version (under 280 chars, include URL)",
  "long_caption": "Instagram version (250-350 words, 8-10 hashtags, include URL)",
  "platform_facebook": "Facebook copy (180-220 words, warm tone, include URL)",
  "platform_instagram": "Instagram copy (200-280 words, visual language, 5-8 hashtags, include URL)",
  "platform_linkedin": "LinkedIn copy (200-250 words, professional, include URL)",
  "platform_x": "X copy (under 280 chars, include URL)",
  "platform_pinterest": "Pinterest copy (100-150 words, aspirational, 8-10 hashtags, include URL)",
  "platform_threads": "Threads copy (150-200 words, conversational, include URL)",
  "platform_tiktok": "TikTok copy (50-100 words, urgent, include URL)",
  "cta_1": "First CTA (7-12 words)",
  "cta_2": "Second CTA (7-12 words, different angle)",
  "cta_3": "Third CTA (7-12 words, emotional)",
  "image_prompt": "Detailed DALL-E prompt (80-120 words, specific, branded, blue #0099FF, clean modern, real lifestyle style, NOT stock photos)"
}`;

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  } catch (error) {
    console.error("Generation error:", error);
    return null;
  }
}

export async function dailyContentDropsV2() {
  const drafts = [];

  for (const gap of GAPS) {
    const draft = await generateDraft(gap.pillar, gap.audience, gap.pattern);
    if (draft) {
      drafts.push(draft);
    }
  }

  return { drafts, count: drafts.length };
}
