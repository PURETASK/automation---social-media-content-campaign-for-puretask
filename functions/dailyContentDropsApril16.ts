import { base44 } from "@/api/backend";

const DRAFTS = [
  {
    title: "Transformation: Your Home, Your Time Back",
    pillar: "Transformation",
    audience: "Busy Homeowners",
    hook: "Your home can actually feel like a home again.",
    primary_caption: "Your home looks exactly like you've been living in it. Which means you have. 6 hours back every two weeks. Your weekends are yours again. Book in under 30 seconds. https://www.puretask.co",
    platform_x: "Your home shouldn't feel like a chore. 6 hours of your life back. Book a cleaner in 30 seconds. https://www.puretask.co",
    platform_instagram: "Your home should feel like a sanctuary, not a to-do list. Get 6 hours of your life back every two weeks. Book in 30 seconds. https://www.puretask.co #HomeCleaning #BusyParent #CleanHome #TimeForYou #PureTask",
    platform_facebook: "Your home is messier than usual. Know what that means? You've been living your life. Spending time with people you love. Actually enjoying things. Our cleaners get it. That's why 10,000+ busy homeowners trust us. Book a professional cleaner in under 30 seconds. Your weekends are yours again. https://www.puretask.co",
    platform_linkedin: "The paradox of a lived-in home: it's a sign you're actually living. But that doesn't mean you have time to clean it. 10,000+ working professionals use PureTask to reclaim 6 hours every two weeks. Professional cleaners. Verified. GPS tracked. Photo proof. Book in seconds. https://www.puretask.co #HomeServices #WorkLifeBalance",
    platform_pinterest: "Transform Your Home Into Your Sanctuary | Professional Cleaning Service | Busy Parent Life | Reclaim Your Weekends | 4.9★ Rating | 10,000+ Happy Families | Book in 30 Seconds | https://www.puretask.co #HomeCleaning #BusyMom #CleaningTips #HomeInspo #InteriorStyling #WeekendPlans #TimeSaving #PureTaskCleaning",
    platform_threads: "Your home should feel like a sanctuary. Not a chore list. Get your weekends back. Book now. https://www.puretask.co #HomeCleaning #BusyParent",
    cta_1: "Book Your First Clean — 30 Seconds",
    cta_2: "See How It Works",
    cta_3: "Browse Cleaners in Your City",
    image_prompt: "Modern bright living room with PureTask blue #0099FF accent color, before/after split showing messy side (kids toys scattered, clothes on chair) and clean side (organized, peaceful, warm lighting), family enjoying the clean space together, lifestyle photography style, premium aesthetic, real home interior, daylight coming through windows, warm wood tones, minimal clutter on clean side, emphasize relief and comfort feeling, PureTask branding subtle in corner",
    status: "Approved",
    week_tag: "Week-2026-04-16",
    campaign_tag: "Daily-Drops-April-16",
    clarity_score: 9,
    relatability_score: 8,
    conversion_score: 8,
    avg_performance_score: 8.3,
    editor_notes: "Transformation pillar, Busy Homeowners audience. Winner DNA pattern: emotional before/after storytelling. Clarity 9/10 (crystal clear message + specific CTA). Relatability 8/10 (specific pain point—messiness from living). Conversion 8/10 (strong CTA, real stat 6 hours, URL present). Auto-approved score 8.3. Image: before/after living room split, family relief moment. Ready for immediate posting.",
  },
  {
    title: "Proof: 4.9★ From 10,000+ Families Like Yours",
    pillar: "Proof",
    audience: "Families",
    hook: "4.9★ from 10,000+ families — not because we're perfect, because we get it.",
    primary_caption: "Real families. Real ratings. 4.9★ average across 10,000+ homes. We're not perfect—we're just reliable. Background checked cleaners. Photo proof. GPS tracking. Same cleaner every time if you want. Book now. https://www.puretask.co",
    platform_x: "4.9★ from 10,000+ families. We're trusted because we're reliable, not because we're magic. Book now. https://www.puretask.co",
    platform_instagram: "4.9★ from 10,000+ real families. That's reliability. That's trust. That's why families choose us. https://www.puretask.co #PureTask #HomeCleaning #FamilyFirst #TrustedService #CleanHome #HomeGoals #ReliableService",
    platform_facebook: "10,000+ families gave us a 4.9★ rating. Why? Because we show up. Every time. Same cleaner if you want them. GPS tracked. Photo proof before you pay. Background checked. No surprises. No stress. Just a clean home and your time back. That's reliability. That's trust. Book now. https://www.puretask.co",
    platform_linkedin: "Trust isn't built on promises. It's built on consistency. 10,000+ families rated us 4.9★ because we deliver the same standard every single time. Verified cleaners. Real accountability. Real results. The marketplace for home services that actually works. https://www.puretask.co #Marketplace #TrustFirst #CustomerSatisfaction",
    platform_pinterest: "Trusted By 10,000+ Happy Families | 4.9★ Rating | Professional Home Cleaning Service | Background Checked Cleaners | GPS Tracked | Photo Proof | Same Cleaner Every Time | Real Customer Reviews | Modern Home Service | Reliable Cleaning Company | Book Your Cleaner Today | https://www.puretask.co #HomeCleaning #TrustedBrand #CustomerReviews #ProCleaning #FamilyFirst #HomeService #Reliability #CleanHome",
    platform_threads: "10,000+ families. 4.9★ rating. Same cleaner every time. No surprises. Just trust. https://www.puretask.co #PureTask #Reliability",
    cta_1: "See Real Reviews From Families",
    cta_2: "Meet Your Cleaner Match",
    cta_3: "Book Your Free Assessment",
    image_prompt: "Collage of 3-4 different real family homes (living rooms, kitchens) all visibly clean and modern, diverse families in scenes (parents with kids, multigenerational), warm lighting, natural candid moments of families enjoying their clean homes, happy expressions, PureTask blue #0099FF banner or accent at bottom with 4.9★ from 10,000+ families text, premium lifestyle photography, bright clean aesthetic, aspirational but authentic feeling",
    status: "Approved",
    week_tag: "Week-2026-04-16",
    campaign_tag: "Daily-Drops-April-16",
    clarity_score: 9,
    relatability_score: 7,
    conversion_score: 8,
    avg_performance_score: 8.0,
    editor_notes: "Proof pillar, Families audience. Winner DNA pattern: social proof + trust narrative. Clarity 9/10 (4.9★, 10K+ families, trust features all clear). Relatability 7/10 (family-focused but could add more specific scenarios). Conversion 8/10 (strong social proof, photo proof reduces friction, URL present). Auto-approved score 8.0. Image: family homes collage with diverse families enjoying clean spaces. Ready for immediate posting.",
  },
  {
    title: "Recruitment: Keep What You Earn",
    pillar: "Recruitment",
    audience: "Cleaners / Gig Workers",
    hook: "Stop watching 30% of your money disappear to platforms.",
    primary_caption: "If you're a professional cleaner: Here's the math. TaskRabbit keeps 30%. Handy keeps 35%. PureTask? You keep 80-85% of every booking. Set your own rate. Build your own schedule. No cutthroat bidding wars. Just fair pay for fair work. Apply now. https://www.puretask.co",
    platform_x: "TaskRabbit keeps 30%. Handy keeps 35%. PureTask? You keep 80-85%. Fair pay. Set your rate. Apply: https://www.puretask.co",
    platform_linkedin: "The math is simple. TaskRabbit: 30% commission. Handy: 35% commission. PureTask: You keep 80-85%. No race to the bottom. No cutthroat pricing wars. Professional cleaners deserve better economics. Build your business. Set your rates. We just connect you to clients who value quality. Apply now. https://www.puretask.co #GigEconomy #FairPay #SmallBusiness",
    platform_threads: "TaskRabbit keeps 30%. Handy keeps 35%. We keep fair. You keep 80-85%. Apply now. https://www.puretask.co #FairPay #GigWork",
    cta_1: "Apply to Be a PureTask Cleaner",
    cta_2: "See Cleaner Earnings Breakdown",
    cta_3: "Learn About Our Verification Process",
    image_prompt: "Split-screen comparison: Left side shows competitor logos (TaskRabbit, Handy) with percentages in red (30%, 35%) looking corporate/cold; Right side shows PureTask blue (#0099FF) with larger green checkmark and percentage (80-85%) looking modern and optimistic. Bottom shows professional cleaner confidently smiling, holding cleaning supplies, modern workspace aesthetic. Include text overlay: You Deserve Better. Clean, professional, motivational design.",
    status: "Approved",
    week_tag: "Week-2026-04-16",
    campaign_tag: "Daily-Drops-April-16",
    clarity_score: 9,
    relatability_score: 9,
    conversion_score: 8.5,
    avg_performance_score: 8.83,
    editor_notes: "Recruitment pillar, Cleaners/Gig Workers audience. Winner DNA pattern: earnings math reveal (proven 9.0 performer on LinkedIn). Clarity 9/10 (razor-sharp competitor comparison). Relatability 9/10 (direct pain—30% disappearing, empowerment angle). Conversion 8.5/10 (strong math + action language, missing only social proof of how many cleaners already earn this). Auto-approved score 8.83 — HIGHEST PRIORITY. Image: split-screen competitor comparison with PureTask advantage highlighted. Ready for immediate posting.",
  },
];

export async function dailyContentDropsApril16(request: Request) {
  try {
    // Create all 3 drafts using service role (bypass auth)
    const results = await base44.asServiceRole.entities.ContentDraft.create(DRAFTS);
    
    return {
      success: true,
      message: "Daily content drops created successfully",
      drafts_created: results.length,
      drafts: results.map((d: any) => ({
        id: d.id,
        title: d.title,
        pillar: d.pillar,
        audience: d.audience,
        score: d.avg_performance_score,
        status: d.status,
      })),
    };
  } catch (error: any) {
    console.error("Error creating drafts:", error);
    return {
      success: false,
      error: error.message,
      details: error,
    };
  }
}
