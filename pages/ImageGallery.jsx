import { useState, useEffect, useCallback } from "react";
import { ContentDraft } from "@/api/entities";

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

const STATUS_COLOR = {
  Approved: { bg:"#ECFDF5", color:"#059669" },
  Posted:   { bg:"#EDE9FE", color:"#6D28D9" },
  Draft:    { bg:"#F3F4F6", color:"#6B7280"  },
  Rejected: { bg:"#FEF2F2", color:"#DC2626"  },
};

function avgScore(d) {
  const v = [d.clarity_score, d.relatability_score, d.conversion_score].filter(x => typeof x === "number");
  return v.length === 3 ? v.reduce((a,b) => a+b, 0) / 3 : null;
}

export default function ImageGallery() {
  const [drafts,  setDrafts]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState(null);
  const [synced,  setSynced]  = useState(null);

  // Filters
  const [statusF,   setStatusF]   = useState("All");
  const [pillarF,   setPillarF]   = useState("All");
  const [campaignF, setCampaignF] = useState("All");
  const [hasImgF,   setHasImgF]   = useState("With Image");
  const [q,         setQ]         = useState("");
  const [sortBy,    setSortBy]    = useState("date");
  const [gridSize,  setGridSize]  = useState("md"); // sm | md | lg

  // Lightbox
  const [sel,     setSel]     = useState(null);
  const [copied,  setCopied]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const dl = await ContentDraft.list();
      setDrafts(Array.isArray(dl) ? dl : []);
      setSynced(new Date());
    } catch(e) { setErr(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Derived
  const withImg    = drafts.filter(d => d.image_url).length;
  const noImg      = drafts.filter(d => !d.image_url).length;
  const approvedWithImg = drafts.filter(d => d.image_url && d.status === "Approved").length;
  const postedWithImg   = drafts.filter(d => d.image_url && d.status === "Posted").length;

  const allPillars   = ["All", ...new Set(drafts.map(d => d.pillar).filter(Boolean))];
  const allCampaigns = ["All", ...new Set(drafts.map(d => d.campaign_tag).filter(Boolean))];

  const filtered = drafts
    .filter(d => {
      if (hasImgF === "With Image" && !d.image_url) return false;
      if (hasImgF === "No Image"   && d.image_url)  return false;
      if (statusF !== "All"   && d.status      !== statusF)   return false;
      if (pillarF !== "All"   && d.pillar       !== pillarF)   return false;
      if (campaignF !== "All" && d.campaign_tag !== campaignF) return false;
      if (q) {
        const ql = q.toLowerCase();
        if (!d.title?.toLowerCase().includes(ql) && !d.pillar?.toLowerCase().includes(ql) && !d.audience?.toLowerCase().includes(ql) && !d.city?.toLowerCase().includes(ql)) return false;
      }
      return true;
    })
    .sort((a,b) => {
      if (sortBy === "score")   return (avgScore(b)||0) - (avgScore(a)||0);
      if (sortBy === "pillar")  return (a.pillar||"").localeCompare(b.pillar||"");
      if (sortBy === "status")  return (a.status||"").localeCompare(b.status||"");
      return new Date(b.created_date||0) - new Date(a.created_date||0);
    });

  function copyUrl(url) {
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const gridCols = {
    sm: "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8",
    md: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
    lg: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
      <div className="text-center"><div className="text-5xl mb-4 animate-pulse">🖼️</div>
        <div className="text-base font-bold text-gray-700">Loading image gallery…</div>
        <div className="text-xs text-gray-400 mt-1">{0} images indexed</div>
      </div>
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

  return (
    <div className="min-h-screen bg-[#0D0D0F]" style={{ fontFamily:"'Inter',sans-serif" }}>

      {/* HEADER — dark theme for gallery feel */}
      <div className="border-b border-white/10 bg-[#111114]">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <a href="/Overview" className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg hover:opacity-90 transition">
                <span className="font-black text-xl" style={{ color:BRAND }}>P</span>
              </a>
              <div>
                <div className="flex items-center gap-2">
                  <a href="/Overview" className="text-white/40 text-sm hover:text-white/70 transition">Overview</a>
                  <span className="text-white/30 text-sm">›</span>
                  <h1 className="text-xl font-black text-white">Image Gallery</h1>
                </div>
                <p className="text-white/40 text-xs mt-0.5">Every image generated for PureTask content</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {synced && <span className="text-white/30 text-xs">Synced {synced.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>}
              <button onClick={load} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold text-white transition">↻ Refresh</button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5">
            {[
              { icon:"🖼️", v:withImg,           l:"With Image",    c:"#0099FF" },
              { icon:"✅", v:approvedWithImg,    l:"Approved",      c:"#059669" },
              { icon:"📤", v:postedWithImg,      l:"Posted",        c:"#8B5CF6" },
              { icon:"⚠️", v:noImg,             l:"Missing Image",  c:"#EF4444" },
              { icon:"📦", v:drafts.length,      l:"Total Drafts",  c:"#9CA3AF" },
            ].map(({ icon,v,l,c }) => (
              <div key={l} className="bg-white/5 backdrop-blur rounded-2xl p-3 text-center border border-white/10">
                <p className="text-lg">{icon}</p>
                <p className="text-xl font-black mt-0.5" style={{color:c}}>{v}</p>
                <p className="text-white/40 text-[10px] font-semibold mt-0.5">{l}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search by title, pillar, city…"
              className="border border-white/20 bg-white/10 text-white placeholder-white/30 rounded-xl px-3 py-2 text-sm w-52 focus:outline-none focus:border-blue-400"/>
            <select value={hasImgF} onChange={e=>setHasImgF(e.target.value)} className="border border-white/20 bg-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option>With Image</option>
              <option>No Image</option>
              <option>All</option>
            </select>
            <select value={statusF} onChange={e=>setStatusF(e.target.value)} className="border border-white/20 bg-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Posted">Posted</option>
              <option value="Draft">Draft</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select value={pillarF} onChange={e=>setPillarF(e.target.value)} className="border border-white/20 bg-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
              {allPillars.map(p => <option key={p}>{p}</option>)}
            </select>
            <select value={campaignF} onChange={e=>setCampaignF(e.target.value)} className="border border-white/20 bg-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
              {allCampaigns.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="border border-white/20 bg-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option value="date">Newest First</option>
              <option value="score">Highest Score</option>
              <option value="pillar">By Pillar</option>
              <option value="status">By Status</option>
            </select>

            {/* Grid size toggle */}
            <div className="flex gap-1 ml-auto">
              {[["sm","▪▪▪"],["md","▪▪"],["lg","▪"]].map(([s,icon])=>(
                <button key={s} onClick={()=>setGridSize(s)}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${gridSize===s?"bg-white text-gray-900":"bg-white/10 text-white/60 hover:bg-white/20"}`}>{icon}</button>
              ))}
            </div>
            <span className="text-white/40 text-xs font-semibold bg-white/5 px-2 py-1 rounded-lg">{filtered.length} images</span>
          </div>
        </div>
      </div>

      {/* GALLERY GRID */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {filtered.length === 0
          ? <div className="text-center py-20 text-white/30"><div className="text-5xl mb-3">🖼️</div><div className="font-bold">No images match filters</div></div>
          : (
            <div className={`grid gap-3 ${gridCols[gridSize]}`}>
              {filtered.map(d => {
                const plr = PILLAR_CFG[d.pillar];
                const sc  = STATUS_COLOR[d.status] || STATUS_COLOR.Draft;
                const a   = avgScore(d);

                return (
                  <div key={d.id} onClick={() => setSel(d)}
                    className="group relative cursor-pointer rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 hover:scale-[1.02] transition-all duration-200"
                    style={{ aspectRatio: gridSize === "sm" ? "1" : gridSize === "md" ? "4/5" : "16/9" }}>

                    {d.image_url
                      ? <img src={d.image_url} alt={d.title} className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                          <span className="text-3xl mb-1">🖼️</span>
                          <span className="text-[10px] font-semibold">No image</span>
                        </div>}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"/>

                    {/* Always visible — top badges */}
                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                      {plr && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{background:plr.bg,color:plr.color}}>{plr.emoji}</span>}
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{background:sc.bg,color:sc.color}}>{d.status}</span>
                    </div>
                    {a !== null && (
                      <div className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white/90 text-gray-800">{a.toFixed(1)}</div>
                    )}

                    {/* Hover content */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <p className="text-white text-[11px] font-bold leading-tight line-clamp-2 mb-1">{d.title}</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {d.audience && <span className="text-[9px] text-white/70">{d.audience}</span>}
                        {d.city && <span className="text-[9px] text-white/70">· 📍{d.city}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {/* LIGHTBOX */}
      {sel && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setSel(null); }}>

          {/* Prev / Next */}
          {(() => {
            const idx = filtered.findIndex(d => d.id === sel.id);
            return (
              <>
                {idx > 0 && (
                  <button onClick={() => setSel(filtered[idx-1])}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full text-white text-xl font-bold flex items-center justify-center z-10">‹</button>
                )}
                {idx < filtered.length-1 && (
                  <button onClick={() => setSel(filtered[idx+1])}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full text-white text-xl font-bold flex items-center justify-center z-10">›</button>
                )}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs">{idx+1} / {filtered.length}</div>
              </>
            );
          })()}

          <button onClick={() => setSel(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white font-bold text-xl flex items-center justify-center z-10">×</button>

          <div className="flex flex-col lg:flex-row gap-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Image */}
            <div className="flex-shrink-0 flex items-center justify-center lg:w-[55%]">
              {sel.image_url
                ? <img src={sel.image_url} alt={sel.title} className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl"/>
                : <div className="w-64 h-64 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-5xl">🖼️</div>}
            </div>

            {/* Info panel */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 text-white overflow-y-auto">
              {/* Title + tags */}
              <h2 className="text-lg font-black leading-tight mb-2">{sel.title}</h2>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(() => { const c=PILLAR_CFG[sel.pillar]; return c?<span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:c.bg,color:c.color}}>{c.emoji} {sel.pillar}</span>:null; })()}
                {sel.audience && <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full font-semibold">{sel.audience}</span>}
                {sel.city && <span className="text-xs bg-teal-900/60 text-teal-300 px-2 py-0.5 rounded-full font-semibold">📍 {sel.city}</span>}
                {sel.campaign_tag && <span className="text-xs bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-full font-semibold">📅 {sel.campaign_tag}</span>}
                {(() => { const sc=STATUS_COLOR[sel.status]; return sc?<span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{background:sc.bg,color:sc.color}}>{sel.status}</span>:null; })()}
              </div>

              {/* Hook */}
              {sel.hook && (
                <div className="bg-white/5 rounded-xl px-3 py-2.5 mb-4 border border-white/10">
                  <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Hook</div>
                  <p className="text-sm text-white/80 italic leading-relaxed">"{sel.hook}"</p>
                </div>
              )}

              {/* Scores */}
              {typeof sel.clarity_score === "number" && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[["C",sel.clarity_score,"Clarity"],["R",sel.relatability_score,"Relatability"],["V",sel.conversion_score,"Conversion"]].map(([l,v,t])=>(
                    <div key={l} className="bg-white/5 rounded-xl p-2 text-center border border-white/10">
                      <div className="text-[9px] text-white/30 font-bold">{t}</div>
                      <div className="text-lg font-black" style={{color:v>=8?"#34D399":v>=7?"#FBBF24":"#F87171"}}>{v}</div>
                    </div>
                  ))}
                  <div className="bg-blue-900/40 rounded-xl p-2 text-center border border-blue-500/20">
                    <div className="text-[9px] text-blue-300 font-bold">Avg</div>
                    <div className="text-lg font-black text-blue-300">{avgScore(sel)?.toFixed(1)||"—"}</div>
                  </div>
                </div>
              )}

              {/* Image prompt */}
              {sel.image_prompt && (
                <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/10">
                  <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Image Prompt Used</div>
                  <p className="text-xs text-white/60 leading-relaxed">{sel.image_prompt}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {sel.image_url && (
                  <>
                    <button onClick={() => copyUrl(sel.image_url)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                      style={{background: copied ? "#059669" : BRAND}}>
                      {copied ? "✅ URL Copied!" : "📋 Copy Image URL"}
                    </button>
                    <div className="flex gap-2">
                      <a href={sel.image_url} target="_blank" rel="noreferrer"
                        className="flex-1 text-center py-2 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition">↗ Full Size</a>
                      <a href={sel.image_url} download
                        className="flex-1 text-center py-2 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition">⬇️ Download</a>
                    </div>
                  </>
                )}
                <a href="/ContentDashboard" className="w-full text-center py-2 rounded-xl text-sm font-bold bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition">
                  ✏️ Edit in Content Dashboard →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
