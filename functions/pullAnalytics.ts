// PureTask Analytics Pull v1.0
// Pulls real engagement stats from Ayrshare → populates PostPerformance entity
// Requires Ayrshare Business plan for analytics API access
// Runs daily — triggered by 48hr Performance Analyzer automation

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const AYRSHARE_API_KEY = Deno.env.get("AYRSHARE_API_KEY");
const AYRSHARE_BASE = "https://app.ayrshare.com/api";

const PLATFORM_MAP: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  twitter: "X",
  pinterest: "Pinterest",
  threads: "Threads"
};

// Calculate performance score from real metrics
function calcPerformanceScore(reach: number, likes: number, comments: number, shares: number, clicks: number, saves: number): number {
  if (reach === 0) return 0;
  const engagementScore = (likes + comments * 2 + shares * 3 + saves * 2 + clicks * 2) / Math.max(reach, 1) * 100;
  // Scale to 1-10
  if (engagementScore >= 8) return 10;
  if (engagementScore >= 5) return 9;
  if (engagementScore >= 3) return 8;
  if (engagementScore >= 2) return 7;
  if (engagementScore >= 1.5) return 6;
  if (engagementScore >= 1) return 5;
  if (engagementScore >= 0.5) return 4;
  if (engagementScore >= 0.2) return 3;
  return 2;
}

function getPerformanceLabel(score: number): string {
  if (score >= 8) return "Winner";
  if (score >= 6) return "Good";
  if (score >= 4) return "Average";
  return "Underperformer";
}

// Pull analytics for a specific post from Ayrshare
async function getPostAnalytics(postId: string, platform: string): Promise<any> {
  try {
    const res = await fetch(`${AYRSHARE_BASE}/analytics/post?id=${postId}&platforms=${platform}`, {
      headers: {
        "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
        "User-Agent": "curl/7.88.1"
      }
    });
    const data = await res.json();
    return data;
  } catch (e: any) {
    return { error: e.message };
  }
}

// Pull social analytics (requires Business plan)
async function getSocialAnalytics(platform: string, days: number = 7): Promise<any> {
  try {
    const res = await fetch(`${AYRSHARE_BASE}/analytics/social?platforms=${platform}&lastDays=${days}`, {
      headers: {
        "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
        "User-Agent": "curl/7.88.1"
      }
    });
    const data = await res.json();
    return data;
  } catch (e: any) {
    return { error: e.message };
  }
}

// Check if Ayrshare plan supports analytics
async function checkPlanAnalytics(): Promise<boolean> {
  try {
    const res = await fetch(`${AYRSHARE_BASE}/user`, {
      headers: {
        "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
        "User-Agent": "curl/7.88.1"
      }
    });
    const data = await res.json();
    // Business plan has analyticsEnabled or similar
    return data.plan === "business" || data.analyticsEnabled === true || (data.monthlyApiCalls && data.monthlyApiCalls > 500);
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const body = await req.json().catch(() => ({}));
    const { force = false, days_back = 7 } = body;

    // Check if analytics available
    const hasAnalytics = await checkPlanAnalytics();

    if (!hasAnalytics && !force) {
      // On lower plan — use manual estimation mode
      console.log("[Analytics] Business plan not detected — running estimation mode");

      // Find all Posted drafts that don't have performance data yet
      const allDrafts = await db.ContentDraft.list();
      const postedDrafts = allDrafts.filter((d: any) =>
        d.status === "Posted" &&
        d.posted_platforms &&
        d.posted_platforms !== "" &&
        d.posted_platforms !== "[]"
      );

      const existingPerfs = await db.PostPerformance.list();
      const existingIds = new Set(existingPerfs.map((p: any) => `${p.content_draft_id}-${p.platform}`));

      let created = 0;
      for (const draft of postedDrafts) {
        const platforms = draft.posted_platforms.split(",").map((s: string) => s.trim()).filter(Boolean);
        for (const platform of platforms) {
          const key = `${draft.id}-${platform}`;
          if (existingIds.has(key)) continue; // already tracked

          // Create placeholder record — to be updated with real data manually
          await db.PostPerformance.create({
            content_draft_id: draft.id,
            content_title: draft.title || "",
            platform,
            pillar: draft.pillar || "",
            audience: draft.audience || "",
            hook: draft.hook || "",
            week_tag: draft.week_tag || "",
            reach: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            saves: 0,
            clicks: 0,
            engagement_rate: 0,
            performance_score: 0,
            performance_label: "Pending",
            analyzed: false,
            notes: "Awaiting real data — update via dashboard Log Performance or upgrade Ayrshare to Business plan for auto-pull"
          });
          created++;
        }
      }

      return Response.json({
        ok: true,
        mode: "estimation",
        message: "Ayrshare Business plan required for auto-pull. Placeholder records created for manual entry.",
        placeholder_records_created: created,
        upgrade_note: "Upgrade Ayrshare to Business plan to enable automatic real analytics pull"
      });
    }

    // ── BUSINESS PLAN MODE: Pull real analytics ──
    console.log("[Analytics] Business plan detected — pulling real data...");

    const platforms = ["facebook", "instagram", "linkedin", "tiktok", "twitter", "pinterest"];
    const allUpdated: any[] = [];
    const allErrors: any[] = [];

    // Get all Posted drafts
    const allDrafts = await db.ContentDraft.list();
    const postedDrafts = allDrafts.filter((d: any) => d.status === "Posted");

    for (const platform of platforms) {
      try {
        const analytics = await getSocialAnalytics(platform, days_back);

        if (analytics.error || !analytics.data) {
          allErrors.push({ platform, error: analytics.error || "No data returned" });
          continue;
        }

        // Match analytics to drafts by post ID stored in posted_platforms data
        const posts = analytics.data?.posts || analytics.posts || [];

        for (const post of posts) {
          // Try to match to a draft
          const matchingDraft = postedDrafts.find((d: any) => {
            return d.posted_platforms?.toLowerCase().includes(PLATFORM_MAP[platform]?.toLowerCase() || platform);
          });

          if (!matchingDraft) continue;

          const reach = post.reach || post.impressions || 0;
          const likes = post.likes || post.reactions || 0;
          const comments = post.comments || 0;
          const shares = post.shares || post.reposts || 0;
          const saves = post.saves || post.bookmarks || 0;
          const clicks = post.clicks || post.link_clicks || 0;
          const videoCompletion = post.video_completion_rate || post.completion_rate || 0;
          const engRate = reach > 0 ? ((likes + comments + shares) / reach * 100) : 0;
          const score = calcPerformanceScore(reach, likes, comments, shares, clicks, saves);
          const label = getPerformanceLabel(score);

          // Check if record already exists
          const existing = await db.PostPerformance.filter({
            content_draft_id: matchingDraft.id,
            platform: PLATFORM_MAP[platform] || platform
          });

          if (existing.length > 0) {
            // Update existing
            await db.PostPerformance.update(existing[0].id, {
              reach, likes, comments, shares, saves, clicks,
              engagement_rate: parseFloat(engRate.toFixed(2)),
              performance_score: score,
              performance_label: label,
              video_completion_rate: videoCompletion,
              analyzed: true,
              posted_at: post.created_at || post.timestamp || new Date().toISOString()
            });
          } else {
            // Create new
            await db.PostPerformance.create({
              content_draft_id: matchingDraft.id,
              content_title: matchingDraft.title || "",
              platform: PLATFORM_MAP[platform] || platform,
              pillar: matchingDraft.pillar || "",
              audience: matchingDraft.audience || "",
              hook: matchingDraft.hook || "",
              week_tag: matchingDraft.week_tag || "",
              reach, likes, comments, shares, saves, clicks,
              engagement_rate: parseFloat(engRate.toFixed(2)),
              performance_score: score,
              performance_label: label,
              video_completion_rate: videoCompletion,
              analyzed: true,
              posted_at: post.created_at || post.timestamp || new Date().toISOString()
            });
          }

          // If winner, flag the draft
          if (label === "Winner") {
            await db.ContentDraft.update(matchingDraft.id, {
              is_winner: true,
              avg_performance_score: score,
              top_performing_platform: PLATFORM_MAP[platform] || platform
            });
          }

          allUpdated.push({ platform, title: matchingDraft.title, score, label, reach, engagement: engRate.toFixed(1) + "%" });
        }
      } catch (e: any) {
        allErrors.push({ platform, error: e.message });
      }
    }

    return Response.json({
      ok: true,
      mode: "live_analytics",
      records_updated: allUpdated.length,
      errors: allErrors.length,
      updated: allUpdated,
      errors_detail: allErrors
    });

  } catch (error: any) {
    console.error("[Analytics Error]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
