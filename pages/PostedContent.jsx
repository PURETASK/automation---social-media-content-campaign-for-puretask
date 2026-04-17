import { useState, useEffect, useCallback } from "react";
import { ContentDraft, PostPerformance } from "@/api/entities";

const BRAND = "#0099FF";

const PILLAR_CFG = {
  Convenience:    { color:"#2563EB", bg:"#EFF6FF", emoji:"⚡" },
  Trust:          { color:"#059669", bg:"#ECFDF5", emoji:"🔒" },
  Transformation: { color:"#7C3AED", bg:"#F5F3FF", emoji:"✨" },
  Recruitment:    { color:"#EA580C", bg:"#FFF7ED", emoji:"💰" },
  Local:          { color:"#0D9488", bg:"#F0FDFA", emoji:"📍" },
  Proof:          { color:"#DB2777", bg:"#FDF2F8", emoji:"⭐" },
  Seniors:        { color:"#B45309", bg:"#FFFBEB", emoji:"🌿" },
  Spring:         { color:"#65A30D", bg:"#F7FEE7", emoji:"🌸" },
};

const PLATFORMS = [
  { key:"facebook",  label:"Facebook",  icon:"👥", field:"platform_facebook"  },
  { key:"instagram", label:"Instagram", icon:"📸", field:"platform_instagram" },
  { key:"linkedin",  label:"LinkedIn",  icon:"💼", field:"platform_linkedin"  },
  { key:"tiktok",    label:"TikTok",    icon:"🎵", field:"platform_tiktok"    },
  { key:"x",         label:"X",         icon:"🐦", field:"platform_x"         },
  { key:"pinterest", label:"Pinterest", icon:"📌", field:"platform_pinterest" },
  { key:"threads",   label:"Threads",   icon:"🧵", field:"platform_threads"   },
  { key:"youtube",   label:"YouTube",   icon:"▶️", field:"platform_youtube"   },
];

function avgScore(d) {
  const v = [d.clarity_score, d.relatability_score, d.conversion_score].filter(x => typeof x === "number");
  return v.length === 3 ? v.reduce((a,b) => a+b, 0) / 3 : null;
}

function CopyBtn({ text, label }) {
  const [copied, setCopied] = useState(false);
  function go() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  return (
    <button onClick={go} className="text-xs font-bold px-3 py-1 rounded-lg transition-all flex-shrink-0"
      style={{ background: copied ? "#059669" : BRAND, color: "#fff" }}>
      {copied ? "✅" : `Copy ${label||""}`}
    </button>
  );
}

function Toast({ t }) {
  if (!t) return null;
  return <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold text-white bg-gray-900 pointer-events-none">{t}</div>;
}

export default function PostedContent() {
  const [drafts,  setDrafts]  = useState([]);
  const [perfs,   setPerfs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState(null);
  const [synced,  setSynced]  = useState(null);

  // Filters
  const [pillarF,   setPillarF]   = useState("All");
  const [platformF, setPlatformF] = useState("All");
  const [campaignF, setCampaignF] = useState("All");
  const [q,         setQ]         = useState("");
  const [sortBy,    setSortBy]    = useState("date");

  // Modal
  const [sel,     setSel]     = useState(null);
  const [platTab, setPlatTab] = useState("facebook");
  const [toast,   setToast]   = useState(null);

  const fire = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const [dl, pl] = await Promise.all([ContentDraft.list(), PostPerformance.list()]);
      setDrafts(Array.isArray(dl) ? dl.filter(d => d.status === "Posted") : []);
      setPerfs(Array.isArray(pl) ? pl : []);
      setSynced(new Date());
    } catch(e) { setErr(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Derived
  const allPillars   = ["All", ...new Set(drafts.map(d => d.pillar).filter(Boolean))];
  const allCampaigns = ["All", ...new Set(drafts.map(d => d.campaign_tag).filter(Boolean))];
  const allPlatforms = ["All", ...PLATFORMS.filter(p => drafts.some(d => d[p.field])).map(p => p.key)];

  const totalReach = perfs.filter(p => drafts.find(d => d.id === p.content_draft_id)).reduce((s,p) => s + (Number(p.reach)||0), 0);
  const totalLikes = perfs.filter(p => drafts.find(d => d.id === p.content_draft_id)).reduce((s,p) => s + (Number(p.likes)||0), 0);
  const relatedPerfs = perfs.filter(p => drafts.find(d => d.id === p.content_draft_id) && (Number(p.reach)||0) > 0);
  const avgEng = relatedPerfs.length ? (relatedPerfs.reduce((s,p) => s + (Number(p.engagement_rate)||0), 0) / relatedPerfs.length).toFixed(1) : "—";

  const filtered = drafts
    .filter(d => {
      if (pillarF !== "All"   && d.pillar       !== pillarF)   return false;
      if (campaignF !== "All" && d.campaign_tag !== campaignF) return false;
      if (platformF !== "All") {
        const pl = PLATFORMS.find(p => p.key === platformF);
        if (pl && !d[pl.field]) return false;
      }
      if (q) {
        const ql = q.toLowerCase();
        if (!d.title?.toLowerCase().includes(ql) && !d.hook?.toLowerCase().includes(ql) && !d.audience?.toLowerCase().includes(ql) && !d.city?.toLowerCase().includes(ql)) return false;
      }
      return true;
    })
    .sort((a,b) => {
      if (sortBy === "score") return (avgScore(b)||0) - (avgScore(a)||0);
      if (sortBy === "reach") {
        const ar = perfs.filter(p => p.content_draft_id === a.id).reduce((s,p) => s+(Number(p.reach)||0),0);
        const br = perfs.filter(p => p.content_draft_id === b.id).reduce((s,p) => s+(Number(p.reach)||0),0);
        return br - ar;
      }
      return new Date(b.updated_date||0) - new Date(a.updated_date||0);
    });

  function openDraft(d) {
    setSel(d);
    const first = PLATFORMS.find(p => d[p.field]);
    setPlatTab(first?.key || "facebook");
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
      <div className="text-center"><div className="text-5xl mb-4 animate-pulse">📤</div>
        <div className="text-base font-bold text-gray-700">Loading posted content…</div></div>
    </div>
  );

  if (err) return (
    <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-3">⚠️</div>
        <div className="font-bold text-red-600 mb-2">Load Error</div>
        <div className="text-sm text-red-400 bg-red-50 rounded-xl px-3 py-2 mb-4">{err}</div>
        <button onClick={load} className="px-5 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold">↻ Retry</button>
      </div>
    </div>
  );

  const selPerfs = sel ? perfs.filter(p => p.content_draft_id === sel.id) : [];
  const selReach = selPerfs.reduce((s,p) => s+(Number(p.reach)||0), 0);
  const selEng   = selPerfs.filter(p => (Number(p.reach)||0)>0);
  const selAvgEng = selEng.length ? (selEng.reduce((s,p) => s+(Number(p.engagement_rate)||0),0)/selEng.length).toFixed(1) : "—";

  return (
    <div className="min-h-screen bg-[#F0F4FF]" style={{ fontFamily:"'Inter',sans-serif" }}>
      <Toast t={toast} />

      {/* HEADER */}
      <div className="text-white shadow-lg" style={{ background:`linear-gradient(135deg,${BRAND} 0%,#0066CC 100%)` }}>
        <div className="max-w-7xl mx-auto px-6 py-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <a href="/Overview" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:opacity-90 transition">
                <span className="font-black text-2xl" style={{ color:BRAND }}>P</span>
              </a>
              <div>
                <div className="flex items-center gap-2">
                  <a href="/Overview" className="text-white/60 text-sm hover:text-white transition">Overview</a>
                  <span className="text-white/40 text-sm">›</span>
                  <h1 className="text-xl font-black">Posted Content</h1>
                </div>
                <p className="text-blue-200 text-sm mt-0.5">{drafts.length} posts published · all platforms</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {synced && <span className="text-blue-200 text-xs">Synced {synced.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>}
              <button onClick={load} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition">↻ Refresh</button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { icon:"📤", v:drafts.length,          l:"Total Posted"  },
              { icon:"📊", v:totalReach.toLocaleString(), l:"Total Reach" },
              { icon:"❤️", v:totalLikes.toLocaleString(), l:"Total Likes" },
              { icon:"💬", v:avgEng+(avgEng!=="—"?"%":""), l:"Avg Engagement" },
              { icon:"📅", v:allCampaigns.length-1,   l:"Campaigns"    },
            ].map(({ icon,v,l }) => (
              <div key={l} className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center">
                <p className="text-lg">{icon}</p>
                <p className="text-xl font-black">{v}</p>
                <p className="text-blue-200 text-[10px] font-semibold mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search title, hook, city…"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
            <select value={pillarF} onChange={e=>setPillarF(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
              {allPillars.map(p => <option key={p}>{p}</option>)}
            </select>
            <select value={platformF} onChange={e=>setPlatformF(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
              {allPlatforms.map(p => <option key={p}>{p === "All" ? "All Platforms" : PLATFORMS.find(x=>x.key===p)?.label||p}</option>)}
            </select>
            <select value={campaignF} onChange={e=>setCampaignF(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
              {allCampaigns.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none ml-auto">
              <option value="date">Newest First</option>
              <option value="score">Highest Score</option>
              <option value="reach">Most Reach</option>
            </select>
            <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2 py-1 rounded-lg">{filtered.length} posts</span>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {filtered.length === 0
          ? <div className="text-center py-20 text-gray-400"><div className="text-5xl mb-3">📭</div><div className="font-bold">No posted content found</div></div>
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(d => {
                const a     = avgScore(d);
                const sc    = a !== null ? (a>=8.5?{t:"#059669",bg:"#ECFDF5"}:a>=7.5?{t:"#2563EB",bg:"#EFF6FF"}:{t:"#B45309",bg:"#FFFBEB"}) : null;
                const plr   = PILLAR_CFG[d.pillar];
                const dPerfs = perfs.filter(p => p.content_draft_id === d.id && (Number(p.reach)||0)>0);
                const dReach = dPerfs.reduce((s,p)=>s+(Number(p.reach)||0),0);
                const dEng   = dPerfs.length ? (dPerfs.reduce((s,p)=>s+(Number(p.engagement_rate)||0),0)/dPerfs.length).toFixed(1) : null;
                const platCount = PLATFORMS.filter(p => d[p.field]).length;

                return (
                  <div key={d.id} onClick={() => openDraft(d)}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                    {/* Image */}
                    <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
                      {d.image_url
                        ? <img src={d.image_url} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                        : <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🖼️</div>}
                      {/* Purple "Posted" badge */}
                      <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">📤 Posted</div>
                      {sc && <div className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full shadow" style={{color:sc.t,background:sc.bg}}>{a.toFixed(1)}</div>}
                      {d.city && <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">📍 {d.city}</div>}
                      {/* Performance overlay */}
                      {dReach > 0 && <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{dReach.toLocaleString()} reach</div>}
                    </div>

                    {/* Body */}
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-gray-800 leading-tight line-clamp-2 mb-1">{d.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-1 mb-2">{d.hook}</p>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {plr && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{background:plr.bg,color:plr.color}}>{plr.emoji} {d.pillar}</span>}
                        {d.audience && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{d.audience}</span>}
                        {d.campaign_tag && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600">{d.campaign_tag}</span>}
                      </div>

                      {/* Engagement row */}
                      {dEng && (
                        <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-1.5 mb-2">
                          <span className="text-xs font-black text-green-700">{dEng}% eng</span>
                          <span className="text-[10px] text-green-500">{dReach.toLocaleString()} reach</span>
                        </div>
                      )}

                      {/* Platform icons */}
                      <div className="flex gap-1 flex-wrap">
                        {PLATFORMS.filter(p => d[p.field]).slice(0,7).map(p => (
                          <span key={p.key} title={p.label} className="text-sm">{p.icon}</span>
                        ))}
                        {platCount > 7 && <span className="text-[10px] text-gray-400">+{platCount-7}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {/* MODAL */}
      {sel && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-8"
          onClick={e => { if (e.target === e.currentTarget) setSel(null); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative mb-10">
            <button onClick={() => setSel(null)} className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-lg">×</button>

            {/* Hero */}
            <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
              {sel.image_url
                ? <img src={sel.image_url} alt={sel.title} className="w-full h-full object-cover"/>
                : <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🖼️</div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"/>
              <div className="absolute bottom-5 left-5 right-14">
                <h2 className="text-white font-black text-lg leading-tight drop-shadow">{sel.title}</h2>
                <p className="text-white/80 text-sm mt-1 line-clamp-2">{sel.hook}</p>
              </div>
            </div>

            <div className="p-5">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {sel.pillar && (() => { const c=PILLAR_CFG[sel.pillar]; return c ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:c.bg,color:c.color}}>{c.emoji} {sel.pillar}</span> : null; })()}
                {sel.audience && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{sel.audience}</span>}
                {sel.city && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">📍 {sel.city}</span>}
                {sel.campaign_tag && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">📅 {sel.campaign_tag}</span>}
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 ml-auto">📤 Posted</span>
              </div>

              {/* Scores */}
              {typeof sel.clarity_score === "number" && (
                <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 rounded-2xl">
                  {[["Clarity",sel.clarity_score],["Relatability",sel.relatability_score],["Conversion",sel.conversion_score]].map(([l,v])=>(
                    <div key={l} className="text-center">
                      <div className="text-[10px] text-gray-400 font-semibold mb-1">{l}</div>
                      <div className="text-xl font-black" style={{color:v>=8?"#059669":v>=7?"#B45309":"#DC2626"}}>{v}</div>
                    </div>
                  ))}
                  <div className="text-center border-l border-gray-200">
                    <div className="text-[10px] text-gray-400 font-semibold mb-1">Avg</div>
                    <div className="text-xl font-black text-blue-600">{avgScore(sel)?.toFixed(1)||"—"}</div>
                  </div>
                </div>
              )}

              {/* Performance */}
              {selPerfs.length > 0 && (
                <div className="mb-4">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Live Performance</div>
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      ["Total Reach", selReach.toLocaleString()],
                      ["Avg Eng",     selAvgEng+(selAvgEng!=="—"?"%":"")],
                      ["Platforms",   selPerfs.length],
                    ].map(([l,v])=>(
                      <div key={l} className="bg-purple-50 rounded-xl p-3 text-center">
                        <div className="text-[10px] text-purple-400 font-semibold">{l}</div>
                        <div className="text-lg font-black text-purple-800">{v}</div>
                      </div>
                    ))}
                  </div>
                  {/* Per platform */}
                  <div className="space-y-2">
                    {selPerfs.map(p => (
                      <div key={p.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-700">{PLATFORMS.find(pl=>pl.key===p.platform)?.icon||"📊"} {p.platform}</span>
                          {p.performance_label && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{p.performance_label}</span>}
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {[["Reach",p.reach],["Likes",p.likes],["Comments",p.comments],["Eng%",p.engagement_rate!=null?`${Number(p.engagement_rate).toFixed(1)}%`:null]].map(([l,v])=>(
                            <div key={l} className="text-center"><div className="text-[9px] text-gray-400">{l}</div><div className="text-xs font-black text-gray-700">{v!=null?v:"—"}</div></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform copy */}
              <div className="mb-4">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Platform Copy</div>
                <div className="flex gap-1 flex-wrap mb-2">
                  {PLATFORMS.filter(p => sel[p.field]).map(p => (
                    <button key={p.key} onClick={() => setPlatTab(p.key)}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all ${platTab===p.key?"text-white shadow":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                      style={platTab===p.key?{background:BRAND}:{}}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
                {PLATFORMS.map(p => {
                  if (platTab !== p.key || !sel[p.field]) return null;
                  return (
                    <div key={p.key} className="bg-gray-50 rounded-xl p-3 relative">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed pr-20 max-h-40 overflow-y-auto">{sel[p.field]}</p>
                      <div className="absolute top-2 right-2"><CopyBtn text={sel[p.field]} label={p.label}/></div>
                    </div>
                  );
                })}
              </div>

              {/* Video */}
              {sel.video_cdn_url && (
                <div className="mb-4">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Video</div>
                  <video controls className="w-full rounded-2xl bg-black" style={{maxHeight:240}}><source src={sel.video_cdn_url}/></video>
                </div>
              )}

              {/* Image download */}
              {sel.image_url && (
                <div className="flex gap-2">
                  <a href={sel.image_url} target="_blank" rel="noreferrer" className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition">🖼️ Open Image</a>
                  <a href={sel.image_url} download className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold text-white transition" style={{background:BRAND}}>⬇️ Download</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
