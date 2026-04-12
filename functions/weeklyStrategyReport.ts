// weeklyStrategyReport v2.0 — fixed deployment (uses Deno.serve)
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
    const REPO = "PURETASK/automation---social-media-content-campaign-for-puretask";
    const BASE_URL = `https://api.github.com/repos/${REPO}/contents`;

    if (!GITHUB_TOKEN) return Response.json({ error: "GITHUB_TOKEN not set" }, { status: 500 });

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const allDrafts = await db.ContentDraft.list();
    const allPerfs = await db.PostPerformance.list();

    const weekDrafts = allDrafts.filter((d: any) => new Date(d.created_date) >= weekStart);
    const weekPerfs = allPerfs.filter((p: any) => p.posted_at && new Date(p.posted_at) >= weekStart);

    const pillarCounts: Record<string, number> = {};
    const audienceCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};
    let totalScore = 0, scoredCount = 0;

    allDrafts.forEach((d: any) => {
      statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
    });

    weekDrafts.forEach((d: any) => {
      if (d.pillar) pillarCounts[d.pillar] = (pillarCounts[d.pillar] || 0) + 1;
      if (d.audience) audienceCounts[d.audience] = (audienceCounts[d.audience] || 0) + 1;
      if (d.clarity_score && d.relatability_score && d.conversion_score) {
        totalScore += (d.clarity_score + d.relatability_score + d.conversion_score) / 3;
        scoredCount++;
      }
    });

    const avgScore = scoredCount > 0 ? (totalScore / scoredCount).toFixed(1) : "N/A";
    const topPerformers = weekPerfs
      .sort((a: any, b: any) => (b.performance_score || 0) - (a.performance_score || 0))
      .slice(0, 3);

    let report = `# PureTask Weekly Strategy Report\n**Week of ${weekStartStr}**\n\n`;
    report += `## 📊 System Status\n`;
    report += `- **Total Drafts:** ${allDrafts.length}\n`;
    Object.entries(statusCounts).forEach(([s, c]) => { report += `  - ${s}: ${c}\n`; });
    report += `- **This Week Generated:** ${weekDrafts.length}\n`;
    report += `- **Avg Quality Score:** ${avgScore}\n\n`;
    report += `## 🎯 This Week by Pillar\n`;
    Object.entries(pillarCounts).forEach(([p, c]) => { report += `- ${p}: ${c}\n`; });
    report += `\n## 👥 This Week by Audience\n`;
    Object.entries(audienceCounts).forEach(([a, c]) => { report += `- ${a}: ${c}\n`; });
    report += `\n## 🏆 Top Performers\n`;
    if (topPerformers.length > 0) {
      topPerformers.forEach((p: any, i: number) => {
        report += `${i + 1}. **${p.content_title}** (${p.platform}) — Score: ${p.performance_score}\n`;
      });
    } else {
      report += `- No performance data yet this week\n`;
    }
    report += `\n---\n*Auto-generated ${new Date().toISOString()}*\n`;

    const filename = `weekly-reports/week-${weekStartStr.replace(/-/g, "")}-report.md`;
    const encodedContent = btoa(unescape(encodeURIComponent(report)));
    let sha: string | null = null;
    try {
      const check = await fetch(`${BASE_URL}/${filename}`, {
        headers: { "Authorization": `Bearer ${GITHUB_TOKEN}` }
      });
      if (check.ok) sha = (await check.json()).sha;
    } catch (_) {}

    const payload: any = { message: `Weekly strategy report: ${weekStartStr}`, content: encodedContent };
    if (sha) payload.sha = sha;

    const res = await fetch(`${BASE_URL}/${filename}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return Response.json({
      ok: res.ok,
      report_file: filename,
      github_url: data?.content?.html_url || null,
      stats: { total_drafts: allDrafts.length, week_drafts: weekDrafts.length, avg_score: avgScore }
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});
