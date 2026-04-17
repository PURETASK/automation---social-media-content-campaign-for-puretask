import { useState, useEffect } from "react";
import { ContentDraft, PostPerformance, WinnerDNA, ContentIdea } from "@/api/entities";

async function fetchAllData() {
  const [drafts, perfs, dna, ideas] = await Promise.all([
    ContentDraft.list(),
    PostPerformance.list(),
    WinnerDNA.list(),
    ContentIdea.list(),
  ]);
  return {
    ContentDraft:    Array.isArray(drafts) ? drafts : [],
    PostPerformance: Array.isArray(perfs)  ? perfs  : [],
    WinnerDNA:       Array.isArray(dna)    ? dna    : [],
    ContentIdea:     Array.isArray(ideas)  ? ideas  : [],
  };
}

const BRAND_BLUE = "#0099FF";
const BRAND_DARK = "#0066CC";

const PILLAR_CFG = {
  Convenience:    { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", emoji: "⚡" },
  Trust:          { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", emoji: "🔒" },
  Transformation: { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", emoji: "✨" },
  Recruitment:    { color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA", emoji: "💰" },
  Local:          { color: "#0D9488", bg: "#F0FDFA", border: "#99F6E4", emoji: "📍" },
  Proof:          { color: "#DB2777", bg: "#FDF2F8", border: "#FBCFE8", emoji: "⭐" },
  Seniors:        { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", emoji: "🌿" },
  Spring:         { color: "#65A30D", bg: "#F7FEE7", border: "#D9F99D", emoji: "🌸" },
};

const STATUS_CFG = {
  Draft:             { bg: "#F3F4F6", color: "#6B7280" },
  "Pending Approval":{ bg: "#FFFBEB", color: "#B45309" },
  Approved:          { bg: "#ECFDF5", color: "#059669" },
  Rejected:          { bg: "#FEF2F2", color: "#DC2626" },
  Posted:            { bg: "#EDE9FE", color: "#6D28D9" },
};

const AUTOMATION_SCHEDULE = [
  { icon: "📅", day: "Monday",      title: "Full Week Generated",     desc: "Research → ideas → drafts scored ≥7.5 → auto-approved. Zero manual work.",  color: BRAND_BLUE   },
  { icon: "📲", day: "Every 3 hrs", title: "Posts Go Live",           desc: "Approved posts with images auto-posted across all platforms.",               color: "#059669"    },
  { icon: "🖼️", day: "Hourly",      title: "Image Generation",        desc: "DALL-E 3 fills any draft missing a visual. No generic fallbacks.",            color: "#EA580C"    },
  { icon: "📊", day: "Daily",       title: "Analytics Pulled",        desc: "Engagement, reach, shares scored per platform. Winners identified.",         color: "#DB2777"    },
  { icon: "🧬", day: "Every 2 days",title: "Winner DNA Extracted",    desc: "Top hooks, triggers, formats saved and fed back into brainstorm.",           color: "#D97706"    },
  { icon: "🏙️", day: "Tuesday",     title: "City Content",            desc: "Hyper-local posts for LA, NYC, Chicago, Houston, Austin.",                   color: "#0D9488"    },
];

export default function Overview() {
  const [drafts, setDrafts]   = useState([]);
  const [perfs, setPerfs]     = useState([]);
  const [dna, setDna]         = useState([]);
  const [ideas, setIdeas]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true); setError(null);
    try {
      const data = await fetchAllData();
      setDrafts(data.ContentDraft || []);
      setPerfs(data.PostPerformance || []);
      setDna(data.WinnerDNA || []);
      setIdeas(data.ContentIdea || []);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  // ── Stats ────────────────────────────────────────────────────────────────────
  const approved    = drafts.filter(d => d.status === "Approved").length;
  const posted      = drafts.filter(d => d.status === "Posted").length;
  const withImage   = drafts.filter(d => d.image_url).length;
  const needImage   = drafts.filter(d => !d.image_url && !["Rejected","Posted"].includes(d.status)).length;
  const videosReady = drafts.filter(d => d.video_cdn_url).length;
  const realPerfs   = perfs.filter(p => (Number(p.reach) || 0) > 0);
  const totalReach  = realPerfs.reduce((s, p) => s + (Number(p.reach) || 0), 0);
  const winners     = perfs.filter(p => p.performance_label === "Winner").length;
  const avgEng      = realPerfs.length
    ? (realPerfs.reduce((s, p) => s + (Number(p.engagement_rate) || 0), 0) / realPerfs.length).toFixed(1)
    : "—";

  const pillarMap = drafts.reduce((a, d) => {
    if (!d.pillar) return a;
    if (!a[d.pillar]) a[d.pillar] = { total: 0, approved: 0, posted: 0 };
    a[d.pillar].total++;
    if (d.status === "Approved") a[d.pillar].approved++;
    if (d.status === "Posted")   a[d.pillar].posted++;
    return a;
  }, {});

  // Score distribution
  const scored = drafts.filter(d =>
    typeof d.clarity_score === "number" &&
    typeof d.relatability_score === "number" &&
    typeof d.conversion_score === "number"
  );
  const scoreDist = scored.reduce((a, d) => {
    const avg = (d.clarity_score + d.relatability_score + d.conversion_score) / 3;
    const key = avg >= 8.5 ? "Elite (8.5+)" : avg >= 7.5 ? "Approved (7.5–8.4)" : avg >= 6 ? "Draft (6–7.4)" : "Rejected (<6)";
    a[key] = (a[key] || 0) + 1;
    return a;
  }, {});

  const recentPosted = drafts
    .filter(d => d.status === "Posted")
    .sort((a, b) => new Date(b.updated_date || 0) - new Date(a.updated_date || 0))
    .slice(0, 6);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
          style={{ borderColor: BRAND_BLUE, borderTopColor: "transparent" }} />
        <p className="text-sm font-semibold text-gray-500">Loading PureTask Command Center…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow text-center max-w-sm">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="font-bold text-gray-800 mb-2">Failed to load</p>
        <p className="text-sm text-red-500 font-mono bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
        <button onClick={load} className="px-5 py-2 rounded-xl text-white text-sm font-bold"
          style={{ background: BRAND_BLUE }}>↻ Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="text-white shadow-md"
        style={{ background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_DARK} 100%)` }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="font-black text-2xl" style={{ color: BRAND_BLUE }}>P</span>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">PureTask Content Engine</h1>
              <p className="text-blue-200 text-sm mt-0.5">
                Fully Automated ·{" "}
                <a href="https://www.puretask.co" target="_blank" rel="noreferrer"
                  className="text-white underline font-semibold">www.puretask.co</a>
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 bg-white/20 rounded-2xl px-4 py-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-bold">Autopilot Active</span>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {[
              { icon: "📝", v: drafts.length,  l: "Total",     href: null },
              { icon: "✅", v: approved,        l: "Approved",  href: "/ContentDashboard?status=Approved" },
              { icon: "📤", v: posted,          l: "Posted",    href: "/PostedContent" },
              { icon: "🖼️", v: withImage,       l: "Has Image", href: "/ImageGallery" },
              { icon: "⚠️", v: needImage,       l: "Need Img",  href: "/ContentDashboard?status=Draft" },
              { icon: "🎬", v: videosReady,     l: "Videos",    href: null },
              { icon: "🏆", v: winners,         l: "Winners",   href: null },
              { icon: "💬", v: avgEng + (avgEng !== "—" ? "%" : ""), l: "Avg Eng", href: null },
            ].map(({ icon, v, l, href }) => (
              href
                ? <a key={l} href={href} className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center hover:bg-white/25 transition-all cursor-pointer ring-2 ring-transparent hover:ring-white/40 block">
                    <p className="text-xl">{icon}</p>
                    <p className="text-xl font-black mt-0.5">{v}</p>
                    <p className="text-blue-200 text-[10px] font-semibold mt-0.5">{l}</p>
                    <p className="text-white/60 text-[9px] mt-0.5">↗ view</p>
                  </a>
                : <div key={l} className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center">
                    <p className="text-xl">{icon}</p>
                    <p className="text-xl font-black mt-0.5">{v}</p>
                    <p className="text-blue-200 text-[10px] font-semibold mt-0.5">{l}</p>
                  </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── ROW 1: Pillars + Score Distribution ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Pillar breakdown */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-5">🎯 Content Pillars</h2>
            <div className="space-y-0">
              {Object.entries(PILLAR_CFG).map(([pillar, cfg]) => {
                const counts = pillarMap[pillar] || { total: 0, approved: 0, posted: 0 };
                const pct = counts.total > 0 ? Math.round((counts.posted / counts.total) * 100) : 0;
                return (
                  <div key={pillar} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                    <span className="text-lg w-6 flex-shrink-0">{cfg.emoji}</span>
                    <span className="text-sm font-bold text-gray-700 w-28 flex-shrink-0">{pillar}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                    <div className="text-xs text-gray-500 w-36 text-right flex-shrink-0">
                      <span className="font-black text-gray-800">{counts.total}</span> total ·{" "}
                      <span style={{ color: cfg.color, fontWeight: 700 }}>{counts.approved}</span> ready ·{" "}
                      <span className="text-purple-600 font-bold">{counts.posted}</span> posted
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Score dist + idea pipeline */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">📈 Score Distribution</h2>
              {scored.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No scored drafts yet</p>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "Elite (8.5+)",     color: "#059669" },
                    { label: "Approved (7.5–8.4)",color: BRAND_BLUE },
                    { label: "Draft (6–7.4)",     color: "#F59E0B" },
                    { label: "Rejected (<6)",     color: "#EF4444" },
                  ].map(({ label, color }) => {
                    const count = scoreDist[label] || 0;
                    const pct   = Math.round((count / scored.length) * 100);
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-gray-700">{label}</span>
                          <span className="font-black" style={{ color }}>{count} ({pct}%)</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-gray-400 text-center mt-1">{scored.length} scored drafts</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">💡 Idea Pipeline</h2>
              <div className="space-y-2">
                {[
                  { label: "Brainstormed", color: "#B45309", bg: "#FFFBEB" },
                  { label: "Selected",     color: "#059669", bg: "#ECFDF5" },
                  { label: "Converted",    color: "#6D28D9", bg: "#EDE9FE" },
                ].map(({ label, color, bg }) => {
                  const count = ideas.filter(i => (i.status || "").includes(label.replace("Converted","Convert"))).length;
                  return (
                    <div key={label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: bg }}>
                      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
                      <span className="text-lg font-black" style={{ color }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Performance Snapshot ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-800">📊 Performance Snapshot</h2>
            <div className="flex gap-4 text-center">
              {[
                { label: "Total Reach",   value: totalReach.toLocaleString(), color: BRAND_BLUE },
                { label: "Avg Eng Rate",  value: avgEng + (avgEng !== "—" ? "%" : ""), color: "#059669" },
                { label: "Winners",       value: winners, color: "#D97706" },
                { label: "Posts Tracked", value: perfs.length, color: "#7C3AED" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-black" style={{ color }}>{value}</p>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {realPerfs.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📊</p>
              <p className="font-semibold">No live performance data yet</p>
              <p className="text-sm mt-1">Data populates once posts go live</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                    {["Title","Platform","Reach","Engagement","Likes","Shares","Score","Label"].map(h => (
                      <th key={h} className="text-left pb-2 pr-4 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...realPerfs]
                    .sort((a,b) => (b.performance_score||0) - (a.performance_score||0))
                    .slice(0,8)
                    .map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="py-2.5 pr-4 font-medium text-gray-800 max-w-[200px] truncate">{p.content_title||"—"}</td>
                        <td className="py-2.5 pr-4 text-gray-500 capitalize">{p.platform||"—"}</td>
                        <td className="py-2.5 pr-4 text-gray-700 font-semibold">{(p.reach||0).toLocaleString()}</td>
                        <td className="py-2.5 pr-4 font-bold" style={{color:BRAND_BLUE}}>{p.engagement_rate?(+p.engagement_rate).toFixed(1)+"%":"—"}</td>
                        <td className="py-2.5 pr-4 text-gray-600">{p.likes||0}</td>
                        <td className="py-2.5 pr-4 text-gray-600">{p.shares||0}</td>
                        <td className="py-2.5 pr-4 font-black text-gray-800">{p.performance_score?.toFixed(1)||"—"}</td>
                        <td className="py-2.5">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                            ${p.performance_label==="Winner"?"bg-amber-100 text-amber-700"
                            :p.performance_label==="Good"?"bg-green-100 text-green-700"
                            :"bg-gray-100 text-gray-500"}`}>
                            {p.performance_label||"—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── ROW 3: Recent Posts ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-800">📤 Recently Posted</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{posted} total posts</span>
          </div>
          {recentPosted.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📭</p>
              <p className="font-semibold text-gray-600">No posts yet</p>
              <p className="text-sm mt-1">Approved content will post automatically every 3 hours</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentPosted.map(d => {
                const cfg = PILLAR_CFG[d.pillar] || {};
                const avg = (typeof d.clarity_score === "number" && typeof d.relatability_score === "number" && typeof d.conversion_score === "number")
                  ? ((d.clarity_score + d.relatability_score + d.conversion_score) / 3).toFixed(1) : null;
                return (
                  <div key={d.id} className="rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    {d.image_url
                      ? <img src={d.image_url} alt={d.title} className="w-full h-28 object-cover" />
                      : <div className="w-full h-28 flex items-center justify-center text-3xl" style={{ background: cfg.bg || "#F9FAFB" }}>🖼️</div>
                    }
                    <div className="p-3">
                      <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug">{d.title}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {d.pillar && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                            style={{ background: cfg.bg, color: cfg.color }}>{cfg.emoji} {d.pillar}</span>
                        )}
                        {avg && (
                          <span className="text-[10px] font-black"
                            style={{ color: parseFloat(avg) >= 7.5 ? "#059669" : "#F59E0B" }}>{avg}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── ROW 4: Automation Schedule ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 mb-5">🤖 Automation Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AUTOMATION_SCHEDULE.map(({ icon, day, title, desc, color }) => (
              <div key={title} className="rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: color + "18", color }}>{day}</span>
                </div>
                <p className="font-bold text-gray-800 text-sm mb-1">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── ROW 5: Winner DNA ────────────────────────────────────────────── */}
        {dna.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-5">🧬 Top Winner DNA Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...dna].sort((a,b) => (b.avg_score||0)-(a.avg_score||0)).slice(0,3).map(w => {
                const pCfg = PILLAR_CFG[w.winning_pillar] || {};
                return (
                  <div key={w.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-bold text-gray-800 text-sm">{w.title}</p>
                      {w.avg_score && <span className="text-base font-black text-amber-600 flex-shrink-0">★{w.avg_score}</span>}
                    </div>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {w.winning_pillar && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: pCfg.bg, color: pCfg.color }}>{pCfg.emoji} {w.winning_pillar}</span>
                      )}
                      {w.winning_platform && (
                        <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{w.winning_platform}</span>
                      )}
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      {w.winning_hook_style  && <p><span className="font-bold text-gray-700">Hook:</span> {w.winning_hook_style}</p>}
                      {w.emotional_trigger   && <p><span className="font-bold text-gray-700">Trigger:</span> {w.emotional_trigger}</p>}
                      {w.winning_cta_style   && <p><span className="font-bold text-gray-700">CTA:</span> {w.winning_cta_style}</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-amber-200 text-center text-xs">
                      {[["Reach", w.total_reach?.toLocaleString()], ["Eng", w.total_engagement], ["Reuses", w.reuse_count]].map(([l,v])=>(
                        <div key={l}><p className="text-amber-600 font-semibold">{l}</p><p className="font-black text-amber-800">{v??"—"}</p></div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center pb-4">
          PureTask Content Engine · <a href="https://www.puretask.co" target="_blank" rel="noreferrer" className="text-blue-500 font-semibold">https://www.puretask.co</a>
        </p>
      </div>
    </div>
  );
}
