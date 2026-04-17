import { useState, useEffect, useCallback } from "react";
import { ContentDraft, PostPerformance } from "@/api/entities";

// ── Config ────────────────────────────────────────────────────────────────────
const BRAND = "#0099FF";

const PILLAR_CFG = {
  Convenience:    { color: "#2563EB", bg: "#EFF6FF", emoji: "⚡" },
  Trust:          { color: "#059669", bg: "#ECFDF5", emoji: "🔒" },
  Transformation: { color: "#7C3AED", bg: "#F5F3FF", emoji: "✨" },
  Recruitment:    { color: "#EA580C", bg: "#FFF7ED", emoji: "💰" },
  Local:          { color: "#0D9488", bg: "#F0FDFA", emoji: "📍" },
  Proof:          { color: "#DB2777", bg: "#FDF2F8", emoji: "⭐" },
  Seniors:        { color: "#B45309", bg: "#FFFBEB", emoji: "🌿" },
  Spring:         { color: "#65A30D", bg: "#F7FEE7", emoji: "🌸" },
};

const PLATFORMS = [
  { key: "facebook",  label: "Facebook",  icon: "👥", field: "platform_facebook"  },
  { key: "instagram", label: "Instagram", icon: "📸", field: "platform_instagram" },
  { key: "linkedin",  label: "LinkedIn",  icon: "💼", field: "platform_linkedin"  },
  { key: "tiktok",    label: "TikTok",    icon: "🎵", field: "platform_tiktok"    },
  { key: "x",         label: "X",         icon: "🐦", field: "platform_x"         },
  { key: "pinterest", label: "Pinterest", icon: "📌", field: "platform_pinterest" },
  { key: "threads",   label: "Threads",   icon: "🧵", field: "platform_threads"   },
  { key: "youtube",   label: "YouTube",   icon: "▶️", field: "platform_youtube"   },
];

const SCORE_COLOR = (a) =>
  a >= 8.5 ? { text: "#059669", bg: "#ECFDF5", label: "Elite"     }
  : a >= 7.5 ? { text: "#2563EB", bg: "#EFF6FF", label: "Approved" }
  : a >= 6   ? { text: "#B45309", bg: "#FFFBEB", label: "Draft"    }
  :            { text: "#DC2626", bg: "#FEF2F2", label: "Low"      };

function avgScore(d) {
  const vals = [d.clarity_score, d.relatability_score, d.conversion_score]
    .filter(v => typeof v === "number");
  return vals.length === 3 ? vals.reduce((a, b) => a + b, 0) / 3 : null;
}

// ── Small reusable components ─────────────────────────────────────────────────
function Toast({ t }) {
  if (!t) return null;
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold text-white pointer-events-none ${t.type === "error" ? "bg-red-500" : "bg-gray-900"}`}>
      {t.msg}
    </div>
  );
}

function ScoreBadge({ d, size = "sm" }) {
  const a = avgScore(d);
  if (a === null) return <span className="text-xs text-gray-300">—</span>;
  const c = SCORE_COLOR(a);
  return (
    <span className={`font-black px-2 py-0.5 rounded-full ${size === "lg" ? "text-base px-3 py-1" : "text-xs"}`}
      style={{ color: c.text, background: c.bg }}>
      {a.toFixed(1)} {c.label}
    </span>
  );
}

function PillarPill({ p }) {
  const c = PILLAR_CFG[p];
  if (!c) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color }}>
      {c.emoji} {p}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PublishingHub() {
  const [drafts,  setDrafts]  = useState([]);
  const [perfs,   setPerfs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState(null);
  const [synced,  setSynced]  = useState(null);

  // Filters
  const [statusF,   setStatusF]   = useState("Approved");
  const [pillarF,   setPillarF]   = useState("All");
  const [audienceF, setAudienceF] = useState("All");
  const [campaignF, setCampaignF] = useState("All");
  const [cityF,     setCityF]     = useState("All");
  const [hasImgF,   setHasImgF]   = useState("All");
  const [hasVidF,   setHasVidF]   = useState("All");
  const [q,         setQ]         = useState("");
  const [sortBy,    setSortBy]    = useState("score");

  // Modal
  const [sel,    setSel]    = useState(null);
  const [platTab,setPlatTab]= useState("facebook");
  const [copied, setCopied] = useState(null);
  const [toast,  setToast]  = useState(null);

  const fire = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Load data via SDK (no raw fetch / no proxy needed) ─────────────────────
  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const [draftList, perfList] = await Promise.all([
        ContentDraft.list(),
        PostPerformance.list(),
      ]);
      setDrafts(Array.isArray(draftList) ? draftList : []);
      setPerfs(Array.isArray(perfList)   ? perfList  : []);
      setSynced(new Date());
    } catch (e) {
      setErr(e.message || "Failed to load data");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const readyDrafts = drafts.filter(d => d.status === "Approved" || d.status === "Posted");
  const withImage   = readyDrafts.filter(d => d.image_url).length;
  const withVideo   = readyDrafts.filter(d => d.video_cdn_url).length;
  const withScript  = readyDrafts.filter(d => d.script_30sec || d.script_15sec).length;
  const eliteCount  = readyDrafts.filter(d => { const a = avgScore(d); return a !== null && a >= 8.5; }).length;
  const postedCount = drafts.filter(d => d.status === "Posted").length;

  const allPillars   = [...new Set(drafts.map(d => d.pillar).filter(Boolean))].sort();
  const allAudiences = [...new Set(drafts.map(d => d.audience).filter(Boolean))].sort();
  const allCampaigns = [...new Set(drafts.map(d => d.campaign_tag).filter(Boolean))].sort();
  const allCities    = [...new Set(drafts.map(d => d.city).filter(Boolean))].sort();

  const filtered = drafts
    .filter(d => {
      if (statusF !== "All"   && d.status      !== statusF)   return false;
      if (pillarF !== "All"   && d.pillar       !== pillarF)   return false;
      if (audienceF !== "All" && d.audience     !== audienceF) return false;
      if (campaignF !== "All" && d.campaign_tag !== campaignF) return false;
      if (cityF !== "All"     && d.city         !== cityF)     return false;
      if (hasImgF === "Yes"   && !d.image_url)                 return false;
      if (hasImgF === "No"    && d.image_url)                  return false;
      if (hasVidF === "Yes"   && !d.video_cdn_url)             return false;
      if (hasVidF === "No"    && d.video_cdn_url)              return false;
      if (q) {
        const ql = q.toLowerCase();
        if (
          !d.title?.toLowerCase().includes(ql) &&
          !d.hook?.toLowerCase().includes(ql) &&
          !d.audience?.toLowerCase().includes(ql) &&
          !d.city?.toLowerCase().includes(ql)
        ) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "score") return (avgScore(b) ?? 0) - (avgScore(a) ?? 0);
      if (sortBy === "date")  return new Date(b.created_date || 0) - new Date(a.created_date || 0);
      return (a.title || "").localeCompare(b.title || "");
    });

  function copyText(text, label) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      fire(`✅ Copied ${label}!`);
      setTimeout(() => setCopied(null), 2500);
    }).catch(() => fire("Copy failed", "error"));
  }

  function openDraft(d) {
    setSel(d);
    const firstPlat = PLATFORMS.find(p => d[p.field]);
    setPlatTab(firstPlat?.key || "facebook");
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">🚀</div>
        <div className="text-base font-bold text-gray-700">Loading Publishing Hub…</div>
        <div className="text-xs text-gray-400 mt-1">Fetching all approved content</div>
      </div>
    </div>
  );

  if (err) return (
    <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-3">⚠️</div>
        <div className="font-bold text-red-600 mb-2">Load Error</div>
        <div className="text-sm text-red-400 font-mono bg-red-50 rounded-xl px-3 py-2 mb-4">{err}</div>
        <button onClick={load} className="px-5 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold">↻ Retry</button>
      </div>
    </div>
  );

  const selPerfs = sel ? perfs.filter(p => p.content_draft_id === sel.id) : [];

  return (
    <div className="min-h-screen bg-[#F0F4FF]" style={{ fontFamily: "'Inter',sans-serif" }}>
      <Toast t={toast} />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #0066CC 100%)` }}>
        <div className="max-w-7xl mx-auto px-6 py-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="font-black text-2xl" style={{ color: BRAND }}>P</span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">PureTask Publishing Hub</h1>
                <p className="text-blue-200 text-sm mt-0.5">Graded · Image-Ready · Post-Ready — all in one place</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {synced && (
                <span className="text-blue-200 text-xs">
                  Synced {synced.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <button onClick={load}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition">
                ↻ Refresh
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { icon: "✅", v: readyDrafts.length, l: "Ready to Post" },
              { icon: "🖼️", v: withImage,           l: "Has Image"    },
              { icon: "🎬", v: withVideo,           l: "Has Video"    },
              { icon: "📜", v: withScript,          l: "Has Script"   },
              { icon: "⭐", v: eliteCount,          l: "Elite 8.5+"   },
              { icon: "📤", v: postedCount,         l: "Posted"       },
            ].map(({ icon, v, l }) => (
              <div key={l} className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center">
                <p className="text-lg">{icon}</p>
                <p className="text-xl font-black">{v}</p>
                <p className="text-blue-200 text-[10px] font-semibold mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTERS ────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="🔍 Search title, hook, city…"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select value={statusF} onChange={e => setStatusF(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option value="All">All Statuses</option>
              <option value="Approved">✅ Approved</option>
              <option value="Posted">📤 Posted</option>
              <option value="Draft">📝 Draft</option>
            </select>
            <select value={pillarF} onChange={e => setPillarF(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option value="All">All Pillars</option>
              {allPillars.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={audienceF} onChange={e => setAudienceF(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option value="All">All Audiences</option>
              {allAudiences.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={campaignF} onChange={e => setCampaignF(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option value="All">All Campaigns</option>
              {allCampaigns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={cityF} onChange={e => setCityF(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option value="All">All Cities</option>
              {allCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={hasImgF} onChange={e => setHasImgF(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option value="All">All Images</option>
              <option value="Yes">🖼️ Has Image</option>
              <option value="No">⚠️ No Image</option>
            </select>
            <select value={hasVidF} onChange={e => setHasVidF(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option value="All">All Videos</option>
              <option value="Yes">🎬 Has Video</option>
              <option value="No">No Video</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none ml-auto">
              <option value="score">Score ↓</option>
              <option value="date">Newest</option>
              <option value="title">A–Z</option>
            </select>
            <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2 py-1 rounded-lg">
              {filtered.length} posts
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTENT GRID ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🔍</div>
            <div className="font-bold text-gray-600">No posts match these filters</div>
            <div className="text-sm mt-1">Try adjusting the filters above</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(d => {
              const a      = avgScore(d);
              const sc     = a !== null ? SCORE_COLOR(a) : null;
              const plr    = PILLAR_CFG[d.pillar];
              const hasImg = !!d.image_url;
              const hasVid = !!d.video_cdn_url;
              const hasScp = !!(d.script_30sec || d.script_15sec || d.script_45sec);
              const platCount = PLATFORMS.filter(p => d[p.field]).length;

              return (
                <div key={d.id} onClick={() => openDraft(d)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group">

                  {/* Image */}
                  <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
                    {hasImg ? (
                      <img src={d.image_url} alt={d.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <span className="text-4xl">🖼️</span>
                        <span className="text-xs mt-1 font-semibold">No Image Yet</span>
                      </div>
                    )}
                    {sc && (
                      <div className="absolute top-2 left-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-full shadow"
                          style={{ color: sc.text, background: sc.bg }}>{a.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full shadow ${
                        d.status === "Posted"   ? "bg-purple-100 text-purple-700" :
                        d.status === "Approved" ? "bg-green-100 text-green-700"  :
                        "bg-gray-100 text-gray-600"
                      }`}>{d.status}</span>
                    </div>
                    {hasVid && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        🎬 Video
                      </div>
                    )}
                    {d.city && (
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        📍 {d.city}
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-800 leading-tight line-clamp-2 mb-1">{d.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{d.hook}</p>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {plr && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: plr.bg, color: plr.color }}>
                          {plr.emoji} {d.pillar}
                        </span>
                      )}
                      {d.audience && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {d.audience}
                        </span>
                      )}
                    </div>

                    {/* Score mini bars */}
                    {typeof d.clarity_score === "number" && (
                      <div className="flex gap-1 mb-2">
                        {[
                          { l: "C", v: d.clarity_score,      t: "Clarity"      },
                          { l: "R", v: d.relatability_score, t: "Relatability" },
                          { l: "V", v: d.conversion_score,   t: "Conversion"   },
                        ].map(({ l, v, t }) => (
                          <div key={l} className="flex-1 text-center" title={t}>
                            <div className="text-[9px] text-gray-400 font-semibold">{l}</div>
                            <div className="text-xs font-black"
                              style={{ color: v >= 8 ? "#059669" : v >= 7 ? "#B45309" : "#DC2626" }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Platform icons */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {PLATFORMS.filter(p => d[p.field]).slice(0, 6).map(p => (
                          <span key={p.key} title={p.label} className="text-sm">{p.icon}</span>
                        ))}
                        {platCount > 6 && <span className="text-[10px] text-gray-400">+{platCount-6}</span>}
                      </div>
                      {hasScp && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">📜 Script</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ───────────────────────────────────────────────────── */}
      {sel && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-8"
          onClick={e => { if (e.target === e.currentTarget) setSel(null); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden relative mb-10">

            <button onClick={() => setSel(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-lg transition">×</button>

            {/* Hero image */}
            <div className="relative w-full h-72 bg-gray-100 overflow-hidden">
              {sel.image_url ? (
                <img src={sel.image_url} alt={sel.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <span className="text-6xl">🖼️</span>
                  <span className="text-sm mt-2 font-semibold">No Image Yet</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-6 right-14">
                <h2 className="text-white font-black text-xl leading-tight drop-shadow">{sel.title}</h2>
                <p className="text-white/80 text-sm mt-1 line-clamp-2">{sel.hook}</p>
              </div>
            </div>

            <div className="p-6">
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <PillarPill p={sel.pillar} />
                {sel.audience && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{sel.audience}</span>
                )}
                {sel.city && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">📍 {sel.city}</span>
                )}
                {sel.campaign_tag && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">📅 {sel.campaign_tag}</span>
                )}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-auto ${
                  sel.status === "Posted"   ? "bg-purple-100 text-purple-700" :
                  sel.status === "Approved" ? "bg-green-100 text-green-700"  :
                  "bg-gray-100 text-gray-600"
                }`}>{sel.status}</span>
              </div>

              {/* Scores */}
              {typeof sel.clarity_score === "number" && (
                <div className="grid grid-cols-4 gap-3 mb-5 p-4 bg-gray-50 rounded-2xl">
                  {[
                    { l: "Clarity",      v: sel.clarity_score      },
                    { l: "Relatability", v: sel.relatability_score  },
                    { l: "Conversion",   v: sel.conversion_score    },
                  ].map(({ l, v }) => (
                    <div key={l} className="text-center">
                      <div className="text-xs text-gray-400 font-semibold mb-1">{l}</div>
                      <div className="text-2xl font-black"
                        style={{ color: v >= 8 ? "#059669" : v >= 7 ? "#B45309" : "#DC2626" }}>{v}</div>
                    </div>
                  ))}
                  <div className="text-center border-l border-gray-200">
                    <div className="text-xs text-gray-400 font-semibold mb-1">Avg</div>
                    <ScoreBadge d={sel} size="lg" />
                  </div>
                </div>
              )}

              {/* Editor notes */}
              {sel.editor_notes && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-sm text-blue-800">
                  <span className="font-bold">💡 </span>{sel.editor_notes}
                </div>
              )}

              {/* CTAs */}
              {(sel.cta_1 || sel.cta_2 || sel.cta_3) && (
                <div className="mb-5">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">CTAs</div>
                  <div className="flex flex-col gap-1">
                    {[sel.cta_1, sel.cta_2, sel.cta_3].filter(Boolean).map((cta, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 bg-gray-50 rounded-xl px-3 py-2">
                        <span className="text-sm text-gray-700 flex-1">{cta}</span>
                        <button onClick={() => copyText(cta, `CTA${i+1}`)}
                          className="text-xs font-bold text-blue-500 hover:text-blue-700 flex-shrink-0">
                          {copied === `CTA${i+1}` ? "✅" : "Copy"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform captions */}
              <div className="mb-5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Platform Captions</div>
                <div className="flex gap-1 flex-wrap mb-3">
                  {PLATFORMS.filter(p => sel[p.field]).map(p => (
                    <button key={p.key} onClick={() => setPlatTab(p.key)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        platTab === p.key ? "text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      style={platTab === p.key ? { background: BRAND } : {}}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
                {PLATFORMS.map(p => {
                  if (platTab !== p.key || !sel[p.field]) return null;
                  return (
                    <div key={p.key} className="bg-gray-50 rounded-2xl p-4 relative">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed pr-20">{sel[p.field]}</p>
                      <button onClick={() => copyText(sel[p.field], p.label)}
                        className="absolute top-3 right-3 px-3 py-1.5 text-xs font-bold rounded-xl text-white transition"
                        style={{ background: copied === p.label ? "#059669" : BRAND }}>
                        {copied === p.label ? "✅ Copied!" : "Copy"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Scripts */}
              {(sel.script_15sec || sel.script_30sec || sel.script_45sec) && (
                <div className="mb-5">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Video Scripts</div>
                  <div className="space-y-2">
                    {[
                      { label: "15s Script", val: sel.script_15sec },
                      { label: "30s Script", val: sel.script_30sec },
                      { label: "45s Script", val: sel.script_45sec },
                    ].filter(s => s.val).map(s => (
                      <div key={s.label} className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 relative">
                        <div className="text-xs font-bold text-yellow-700 mb-1">🎙️ {s.label}</div>
                        <p className="text-sm text-gray-700 pr-16">{s.val}</p>
                        <button onClick={() => copyText(s.val, s.label)}
                          className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                          {copied === s.label ? "✅" : "Copy"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video player */}
              {sel.video_cdn_url && (
                <div className="mb-5">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Video</div>
                  <video controls className="w-full rounded-2xl bg-black" style={{ maxHeight: 300 }}>
                    <source src={sel.video_cdn_url} />
                  </video>
                </div>
              )}

              {/* Performance */}
              {selPerfs.length > 0 && (
                <div className="mb-5">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Performance</div>
                  <div className="grid grid-cols-2 gap-2">
                    {selPerfs.map(p => (
                      <div key={p.id} className="bg-purple-50 rounded-xl p-3">
                        <div className="text-xs font-bold text-purple-700 mb-2">
                          {PLATFORMS.find(pl => pl.key === p.platform)?.icon} {p.platform}
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-center">
                          {[
                            { l: "Reach",  v: p.reach },
                            { l: "Likes",  v: p.likes },
                            { l: "Eng%",   v: p.engagement_rate ? `${p.engagement_rate}%` : "—" },
                          ].map(({ l, v }) => (
                            <div key={l}>
                              <div className="text-xs text-purple-400">{l}</div>
                              <div className="text-sm font-black text-purple-900">{v ?? "—"}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image actions */}
              {sel.image_url && (
                <div className="flex gap-2">
                  <a href={sel.image_url} target="_blank" rel="noreferrer"
                    className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
                    🖼️ Open Image
                  </a>
                  <a href={sel.image_url} download
                    className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold text-white transition"
                    style={{ background: BRAND }}>
                    ⬇️ Download Image
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
