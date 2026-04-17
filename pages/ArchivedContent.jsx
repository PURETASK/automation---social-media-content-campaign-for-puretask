import { useState, useEffect, useCallback } from "react";
import { ContentDraft } from "@/api/entities";

// ─────────────────────────────────────────────────────────────────────────────
// ARCHIVED CONTENT — LEGACY FAKE-STATS DRAFTS
// Preserved April 16, 2026 — DO NOT DELETE
// These drafts used unverified stats (10,000+ clients, 4.9★, 98% satisfaction,
// 2,400+ cleaners, 50+ cities). Kept for future reference / potential reuse
// once PureTask reaches those milestones.
// ─────────────────────────────────────────────────────────────────────────────

const BRAND = "#0099FF";

const FALSE_STAT_PATTERNS = [
  "10,000", "10000", "2,400", "2400", "4.9★", "4.9 star", "98%",
  "50+ cities", "50 cities", "6 hours saved",
];

function containsFakeStat(draft) {
  const text = [
    draft.primary_caption, draft.platform_facebook, draft.platform_instagram,
    draft.platform_x, draft.platform_linkedin, draft.hook, draft.long_caption,
    draft.short_caption, draft.script_30sec, draft.script_15sec,
  ].filter(Boolean).join(" ").toLowerCase();
  return FALSE_STAT_PATTERNS.some(p => text.includes(p.toLowerCase()));
}

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
];

function highlight(text) {
  if (!text) return text;
  let out = text;
  const patterns = [
    "10,000+","10,000","2,400+","2,400","4.9★","4.9 stars","4.9 star",
    "98%","50+ cities","6 hours saved","6 hours",
  ];
  patterns.forEach(p => {
    const re = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    out = out.replace(re, `⚠️${p}⚠️`);
  });
  return out;
}

function CopyBtn({ text }) {
  const [c, setC] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text||""); setC(true); setTimeout(()=>setC(false),2000); }}
      className="text-[10px] px-2 py-0.5 rounded-lg font-bold flex-shrink-0 transition-all"
      style={{background: c?"#059669":BRAND, color:"#fff"}}>
      {c?"✅":"Copy"}
    </button>
  );
}

export default function ArchivedContent() {
  const [all,     setAll]     = useState([]);
  const [drafts,  setDrafts]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState(null);

  const [q,        setQ]        = useState("");
  const [pillarF,  setPillarF]  = useState("All");
  const [campaignF,setCampaignF]= useState("All");
  const [showAll,  setShowAll]  = useState(false);

  const [sel,     setSel]     = useState(null);
  const [platTab, setPlatTab] = useState("facebook");

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const dl = await ContentDraft.list();
      const arr = Array.isArray(dl) ? dl : [];
      setAll(arr);
      // Show drafts that contain fake stats
      setDrafts(arr.filter(d => showAll || containsFakeStat(d)));
    } catch(e) { setErr(e.message); }
    setLoading(false);
  }, [showAll]);

  useEffect(() => { load(); }, [load]);

  const allPillars   = ["All", ...new Set(all.map(d=>d.pillar).filter(Boolean))];
  const allCampaigns = ["All", ...new Set(all.map(d=>d.campaign_tag).filter(Boolean))];

  const fakeStatDrafts = all.filter(d => containsFakeStat(d));

  const filtered = drafts.filter(d => {
    if (pillarF !== "All"   && d.pillar       !== pillarF)   return false;
    if (campaignF !== "All" && d.campaign_tag !== campaignF) return false;
    if (q) {
      const ql = q.toLowerCase();
      if (!d.title?.toLowerCase().includes(ql) && !d.hook?.toLowerCase().includes(ql)) return false;
    }
    return true;
  }).sort((a,b) => new Date(b.created_date||0) - new Date(a.created_date||0));

  const fakeStat = (text) => {
    if (!text) return false;
    return FALSE_STAT_PATTERNS.some(p => text.toLowerCase().includes(p.toLowerCase()));
  };

  const flaggedFields = (d) => {
    const fields = {
      "Hook": d.hook,
      "Primary Caption": d.primary_caption,
      "Facebook": d.platform_facebook,
      "Instagram": d.platform_instagram,
      "X": d.platform_x,
      "LinkedIn": d.platform_linkedin,
      "30s Script": d.script_30sec,
    };
    return Object.entries(fields).filter(([,v]) => fakeStat(v)).map(([k]) => k);
  };

  if (loading) return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="text-center"><div className="text-5xl mb-4">📦</div>
        <div className="text-base font-bold text-amber-700">Loading archived content…</div></div>
    </div>
  );

  if (err) return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{err}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-amber-50" style={{fontFamily:"'Inter',sans-serif"}}>

      {/* HEADER */}
      <div className="bg-amber-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-7">
          <div className="flex items-center gap-4 mb-5">
            <a href="/Overview" className="w-11 h-11 bg-white rounded-xl flex items-center justify-center hover:opacity-90 transition">
              <span className="font-black text-xl" style={{color:BRAND}}>P</span>
            </a>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <a href="/Overview" className="text-amber-300 text-sm hover:text-white transition">Overview</a>
                <span className="text-amber-600 text-sm">›</span>
                <h1 className="text-xl font-black">📦 Archived Content — Legacy Fake Stats</h1>
              </div>
              <p className="text-amber-300 text-sm">Preserved April 16, 2026 · Do not delete · For future use when stats are real</p>
            </div>
          </div>

          {/* Warning banner */}
          <div className="bg-amber-800/60 border border-amber-600 rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="font-black text-amber-100 mb-1">Why these drafts are archived</div>
                <div className="text-amber-300 text-sm leading-relaxed">
                  These drafts contain unverified stats that were baked into early content generation templates.
                  They are <strong className="text-white">NOT deleted</strong> — they are preserved here for future use
                  once PureTask reaches these milestones. Active content has been rewritten with truth-first,
                  process-proof messaging.
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["10,000+ clients","4.9★ rating","98% satisfaction","2,400+ cleaners","50+ cities","6 hrs saved"].map(s => (
                    <span key={s} className="text-xs bg-red-900/60 text-red-300 border border-red-700 px-2 py-0.5 rounded-full font-bold">❌ {s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: fakeStatDrafts.length, l: "Drafts w/ Fake Stats", c: "#FCD34D" },
              { v: all.length,            l: "Total Drafts",          c: "#FDBA74" },
              { v: all.filter(d=>d.status==="Posted").length, l: "Already Posted", c: "#F87171" },
            ].map(({v,l,c}) => (
              <div key={l} className="bg-amber-800/40 border border-amber-700 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black" style={{color:c}}>{v}</div>
                <div className="text-amber-400 text-[10px] font-semibold mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="max-w-6xl mx-auto px-6 py-5">
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search archived drafts…"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-amber-400"/>
            <select value={pillarF} onChange={e=>setPillarF(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
              {allPillars.map(p=><option key={p}>{p}</option>)}
            </select>
            <select value={campaignF} onChange={e=>setCampaignF(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
              {allCampaigns.map(c=><option key={c}>{c}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm font-semibold text-amber-700 cursor-pointer ml-auto">
              <input type="checkbox" checked={showAll} onChange={e=>setShowAll(e.target.checked)} className="rounded"/>
              Show all drafts (not just fake-stat ones)
            </label>
            <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2 py-1 rounded-lg">{filtered.length} shown</span>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="max-w-6xl mx-auto px-6 pb-10 space-y-4">
        {filtered.length === 0 && <div className="text-center py-16 text-amber-400 font-semibold">No archived drafts match filters</div>}

        {filtered.map(d => {
          const plr = PILLAR_CFG[d.pillar];
          const flagged = flaggedFields(d);
          const isSel = sel?.id === d.id;

          return (
            <div key={d.id} className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all ${isSel?"border-amber-400":"border-amber-100 hover:border-amber-300"}`}>
              {/* Card header */}
              <div className="p-4 cursor-pointer flex items-start gap-4" onClick={()=>setSel(isSel?null:d)}>
                {d.image_url
                  ? <img src={d.image_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0"/>
                  : <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0">{plr?.emoji||"📦"}</div>}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {plr && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:plr.bg,color:plr.color}}>{plr.emoji} {d.pillar}</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.status==="Posted"?"bg-purple-100 text-purple-700":d.status==="Approved"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-600"}`}>{d.status}</span>
                    {d.campaign_tag && <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-semibold">{d.campaign_tag}</span>}
                    {d.city && <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-semibold">📍 {d.city}</span>}
                  </div>
                  <h3 className="font-black text-gray-900 text-sm mb-1">{d.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 italic">"{d.hook}"</p>
                  {/* Flagged fields */}
                  {flagged.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="text-[9px] text-amber-600 font-bold">Fake stats in:</span>
                      {flagged.map(f => <span key={f} className="text-[9px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full font-semibold">{f}</span>)}
                    </div>
                  )}
                </div>
                <span className="text-gray-400 text-lg flex-shrink-0">{isSel?"▲":"▼"}</span>
              </div>

              {/* Expanded view */}
              {isSel && (
                <div className="border-t border-amber-100 p-4 bg-amber-50/50">
                  <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3">
                    ⚠️ Original content preserved below — fake stats highlighted
                  </div>

                  {/* Platform tabs */}
                  <div className="flex gap-1 flex-wrap mb-3">
                    {PLATFORMS.filter(p => d[p.field]).map(p => (
                      <button key={p.key} onClick={()=>setPlatTab(p.key)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all ${platTab===p.key?"text-white":"bg-gray-100 text-gray-500"}`}
                        style={platTab===p.key?{background:BRAND}:{}}>
                        {p.icon} {p.label}
                        {fakeStat(d[p.field]) && <span className="ml-1 text-red-500">⚠️</span>}
                      </button>
                    ))}
                  </div>

                  {PLATFORMS.map(p => {
                    if (platTab !== p.key || !d[p.field]) return null;
                    const txt = highlight(d[p.field]);
                    return (
                      <div key={p.key} className="bg-white rounded-xl p-3 border border-amber-200 mb-3 relative">
                        <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed pr-14 max-h-48 overflow-y-auto">{txt}</div>
                        <div className="absolute top-2 right-2"><CopyBtn text={d[p.field]}/></div>
                      </div>
                    );
                  })}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {d.hook && (
                      <div className="bg-white rounded-xl p-3 border border-amber-200">
                        <div className="text-[9px] text-amber-600 font-black uppercase mb-1">Hook {fakeStat(d.hook)&&"⚠️"}</div>
                        <p className="text-xs text-gray-700 italic">"{highlight(d.hook)}"</p>
                      </div>
                    )}
                    {d.primary_caption && (
                      <div className="bg-white rounded-xl p-3 border border-amber-200">
                        <div className="text-[9px] text-amber-600 font-black uppercase mb-1">Primary Caption {fakeStat(d.primary_caption)&&"⚠️"}</div>
                        <p className="text-xs text-gray-700 leading-relaxed">{highlight(d.primary_caption)}</p>
                      </div>
                    )}
                    {d.script_30sec && (
                      <div className="bg-white rounded-xl p-3 border border-amber-200 md:col-span-2">
                        <div className="text-[9px] text-amber-600 font-black uppercase mb-1">30s Script {fakeStat(d.script_30sec)&&"⚠️"}</div>
                        <p className="text-xs text-gray-700 leading-relaxed">{highlight(d.script_30sec)}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="text-[9px] font-black text-green-700 uppercase mb-1">📋 To restore this content</div>
                    <div className="text-xs text-green-700">Replace all ⚠️-flagged stats with process-proof messaging. See active Content Dashboard for rewritten versions of these posts.</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
