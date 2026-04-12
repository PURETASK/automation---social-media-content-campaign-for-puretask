// pullAnalytics v2.0 — fixed deployment
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const AYRSHARE_API_KEY = Deno.env.get("AYRSHARE_API_KEY");
const AYRSHARE_BASE = "https://app.ayrshare.com/api";

function calcPerformanceScore(reach: number, likes: number, comments: number, shares: number, clicks: number, saves: number): number {
  if (reach === 0) return 0;
  const eng = (likes + comments * 2 + shares * 3 + saves * 2 + clicks * 2) / Math.max(reach, 1) * 100;
  if (eng >= 8) return 10; if (eng >= 5) return 9; if (eng >= 3) return 8;
  if (eng >= 2) return 7; if (eng >= 1.5) return 6; if (eng >= 1) return 5;
  if (eng >= 0.5) return 4; if (eng >= 0.2) return 3; return 2;
}
function getLabel(score: number): string {
  if (score >= 8) return "Winner"; if (score >= 6) return "Good";
  if (score >= 4) return "Average"; return "Underperformer";
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const body = await req.json().catch(() => ({}));

    // Check plan
    const userRes = await fetch(`${AYRSHARE_BASE}/user`, {
      headers: { "Authorization": `Bearer ${AYRSHARE_API_KEY}` }
    });
    const userData = await userRes.json();
    const hasBusiness = userData.plan === "business" || userData.analyticsEnabled === true;

    const allDrafts = await db.ContentDraft.list();
    const postedDrafts = allDrafts.filter((d: any) =>
      d.status === "Posted" && d.posted_platforms && d.posted_platforms !== ""
    );
    const existingPerfs = await db.PostPerformance.list();
    const existingKeys = new Set(existingPerfs.map((p: any) => `${p.content_draft_id}-${p.platform}`));

    let created = 0;

    for (const draft of postedDrafts) {
      const platforms = draft.posted_platforms.split(",").map((s: string) => s.trim()).filter(Boolean);
      for (const platform of platforms) {
        const key = `${draft.id}-${platform}`;
        if (existingKeys.has(key)) continue;
        await db.PostPerformance.create({
          content_draft_id: draft.id,
          content_title: draft.title || "",
          platform,
          pillar: draft.pillar || "",
          audience: draft.audience || "",
          hook: draft.hook || "",
          week_tag: draft.week_tag || "",
          reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0,
          engagement_rate: 0, performance_score: 0,
          performance_label: "Pending",
          analyzed: false,
          notes: hasBusiness ? "Auto-pull enabled" : "Manual entry needed — upgrade Ayrshare Business plan for auto-pull"
        });
        created++;
      }
    }

    return Response.json({
      ok: true,
      plan: hasBusiness ? "business" : "standard",
      posted_drafts: postedDrafts.length,
      placeholder_records_created: created,
      message: `Created ${created} PostPerformance records`
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});
