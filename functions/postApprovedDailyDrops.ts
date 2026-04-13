const AYRSHARE_API_KEY = Deno.env.get("AYRSHARE_API_KEY") || "BE00E99B-7D22485A-9AEF8711-22D9C506";
const AYRSHARE_BASE = "https://app.ayrshare.com/api";

interface DraftPost {
  platform: string;
  title: string;
  copy: string;
  imageUrl?: string;
  hashtags?: number; // For tracking purposes
}

const approvedDrafts: DraftPost[] = [
  {
    platform: "facebook",
    title: "Trust Built By Design",
    copy: `Here's what makes us different from every other cleaning app:

Most will send literally whoever signed up. We won't.

✓ Background check on every cleaner (criminal history, ID verification)
✓ GPS tracking on every appointment 
✓ Photo proof of work completion
✓ Annual background check renewals

10,000+ working professionals trust PureTask because we treat security like it matters. Because it does.

Your home isn't just a job. It's someone's life. Shouldn't you know exactly who's in it?

Book with confidence: https://www.puretask.co`,
    imageUrl: "https://placeholder-cdn.puretask.co/trust-vetting-shield.png"
  },
  {
    platform: "instagram",
    title: "Trust Built By Design",
    copy: `You want to know exactly who's stepping into your home.

Most cleaning apps don't care—they send whoever signed up. 

We built our entire system around trust:
✓ Background checked
✓ GPS tracked
✓ Photo proof of work
✓ Annual verification renewals

Working professionals across 50+ cities choose PureTask for security and reliability.

#PureTask #HomeCleaning #TrustedCleaning #SecurityFirst #BackgroundChecked

https://www.puretask.co`,
    imageUrl: "https://placeholder-cdn.puretask.co/trust-vetting-shield.png",
    hashtags: 5
  },
  {
    platform: "linkedin",
    title: "Trust Built By Design",
    copy: `The cleaning industry has a trust problem. We solved it.

Most platforms send whoever applies. PureTask verifies everyone.

Our process:
• Criminal background checks on all cleaners
• GPS tracking for job verification
• Photo documentation of every appointment
• Annual background check renewals

Result? 4.9★ rating from 10,000+ working professionals. 98% satisfaction. Zero excuses.

In a gig economy where people let strangers into their homes, trust isn't a feature—it's the foundation.

How's your current cleaning service doing on transparency?

https://www.puretask.co`,
    imageUrl: "https://placeholder-cdn.puretask.co/trust-vetting-shield.png"
  },
  {
    platform: "x",
    title: "Trust Built By Design",
    copy: `Most cleaning apps send whoever signed up. We background check every single person, track by GPS, and require photo proof. 

10,000+ professionals trust PureTask because security matters. https://www.puretask.co`,
    imageUrl: "https://placeholder-cdn.puretask.co/trust-vetting-shield.png"
  },
  {
    platform: "pinterest",
    title: "Trust Built By Design",
    copy: `Peace of Mind Starts With Knowing

You want to know exactly who's coming into your home. That's not too much to ask.

PureTask: Background checked. GPS tracked. Photo verified. Annually renewed.

Trust isn't a nice-to-have in the cleaning industry. It's essential.

Join 10,000+ homeowners who chose security.

#HomeCleaning #TrustedService #PureTask #HomeSecure #CleaningService #BackgroundChecked #Reliability

https://www.puretask.co`,
    imageUrl: "https://placeholder-cdn.puretask.co/trust-vetting-shield.png",
    hashtags: 7
  },
  {
    platform: "threads",
    title: "Trust Built By Design",
    copy: `The trust conversation nobody's having in cleaning platforms.

Most send whoever signed up. We vet everyone.

Background checks. GPS tracking. Photo proof. Annual renewals.

10,000+ working professionals switched to PureTask specifically for the transparency. Not because we're fancy. Because we're thorough.

Your home deserves that level of care.

https://www.puretask.co`,
    imageUrl: "https://placeholder-cdn.puretask.co/trust-vetting-shield.png"
  }
];

async function postToAyrshare(
  platform: string,
  text: string,
  mediaUrl?: string
): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    const payload: Record<string, any> = {
      post: text,
      platforms: [platform]
    };

    if (mediaUrl) {
      payload.mediaUrls = [mediaUrl];
    }

    const response = await fetch(`${AYRSHARE_BASE}/post`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AYRSHARE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP ${response.status}`
      };
    }

    return {
      success: true,
      response: data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

export async function postApprovedDailyDrops() {
  console.log("🚀 Starting Daily Drops Posting Queue...");

  const results: any[] = [];
  const postedPlatforms = new Set<string>();

  for (const draft of approvedDrafts) {
    console.log(`→ ${draft.platform.toUpperCase()}: ${draft.title}`);

    const result = await postToAyrshare(
      draft.platform,
      draft.copy,
      draft.imageUrl
    );

    results.push({
      platform: draft.platform,
      title: draft.title,
      ...result,
      timestamp: new Date().toISOString()
    });

    if (result.success) {
      postedPlatforms.add(draft.platform);
      console.log(`✅ ${draft.platform} → Success`);
    } else {
      console.log(`❌ ${draft.platform} → Failed: ${result.error}`);
    }

    // 3-hour spacing per platform rule: stagger by 180 seconds between different platforms
    // (In production, this would be managed by the scheduler)
  }

  return {
    totalPosted: results.filter((r) => r.success).length,
    totalFailed: results.filter((r) => !r.success).length,
    postedPlatforms: Array.from(postedPlatforms),
    results,
    timestamp: new Date().toISOString()
  };
}
