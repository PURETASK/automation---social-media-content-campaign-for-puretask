import { useState, useEffect, useCallback, useMemo } from "react";
import { ContentDraft } from "@/api/entities";

// ── Brand & config ─────────────────────────────────────────────────────────
const BRAND = "#0099FF";

const PILLAR = {
  Convenience:    { color:"#2563EB", bg:"#EFF6FF", emoji:"⚡" },
  Trust:          { color:"#059669", bg:"#ECFDF5", emoji:"🔒" },
  Transformation: { color:"#7C3AED", bg:"#F5F3FF", emoji:"✨" },
  Recruitment:    { color:"#EA580C", bg:"#FFF7ED", emoji:"💰" },
  Local:          { color:"#0D9488", bg:"#F0FDFA", emoji:"📍" },
  Proof:          { color:"#DB2777", bg:"#FDF2F8", emoji:"⭐" },
};

const PLATFORMS = [
  { key:"facebook",  label:"Facebook",  icon:"👥", field:"platform_facebook"  },
  { key:"instagram", label:"Instagram", icon:"📸", field:"platform_instagram" },
  { key:"x",         label:"X",         icon:"🐦", field:"platform_x"         },
  { key:"linkedin",  label:"LinkedIn",  icon:"💼", field:"platform_linkedin"  },
  { key:"tiktok",    label:"TikTok",    icon:"🎵", field:"platform_tiktok"    },
  { key:"pinterest", label:"Pinterest", icon:"📌", field:"platform_pinterest" },
  { key:"threads",   label:"Threads",   icon:"🧵", field:"platform_threads"   },
];

function avgScore(d) {
  const vals = [d.clarity_score, d.relatability_score, d.conversion_score].filter(v => typeof v === "number");
  return vals.length === 3 ? vals.reduce((a,b) => a+b, 0) / 3 : null;
}

function scoreColor(a) {
  if (a === null) return { text:"#9CA3AF", bg:"#F3F4F6", label:"—" };
  if (a >= 9.0)   return { text:"#059669", bg:"#ECFDF5", label:"Elite" };
  if (a >= 8.0)   return { text:"#2563EB", bg:"#EFF6FF", label:"Strong" };
  if (a >= 7.5)   return { text:"#0D9488", bg:"#F0FDFA", label:"Approved" };
  return             { text:"#B45309", bg:"#FFFBEB", label:"Draft" };
}

// ── Tiny helpers ───────────────────────────────────────────────────────────
function Toast({ t }) {
  if (!t) return null;
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold text-white pointer-events-none ${t.err ? "bg-red-500" : "bg-gray-900"}`}>
      {t.msg}
    </div>
  );
}

function CopyBtn({ text, label }) {
  const [done, setDone] = useState(false);
  function go(e) {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    });
  }
  return (
    <button onClick={go}
      className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
      style={{ background: done ? "#ECFDF5" : "#F3F4F6", color: done ? "#059669" : "#6B7280" }}>
      {done ? "✅ Copied" : `📋 Copy ${label}`}
    </button>
  );
}

function PillarBadge({ p }) {
  const c = PILLAR[p];
  if (!c) return null;
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background:c.bg, color:c.color }}>
      {c.emoji} {p}
    </span>
  );
}

function ScoreBadge({ d }) {
  const a = avgScore(d);
  const c = scoreColor(a);
  return (
    <span className="text-xs font-black px-2.5 py-0.5 rounded-full" style={{ background:c.bg, color:c.text }}>
      {a !== null ? a.toFixed(1) : "—"} {c.label}
    </span>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
function Card({ d, onClick }) {
  const a     = avgScore(d);
  const sc    = scoreColor(a);
  const pc    = PILLAR[d.pillar];
  const plats = PLATFORMS.filter(p => d[p.field]);

  return (
    <div onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">

      {/* Image */}
      <div className="relative bg-gray-100 overflow-hidden" style={{ paddingTop:"56.25%" }}>
        {d.image_url
          ? <img src={d.image_url} alt={d.title} className="absolute inset-0 w-full h-full object-cover" />
          : <div className="absolute inset-0 flex items-center justify-center text-4xl text-gray-300">🖼</div>
        }
        {/* Score overlay */}
        <div className="absolute top-2 right-2">
          <span className="text-xs font-black px-2.5 py-1 rounded-xl shadow-md"
            style={{ background:sc.bg, color:sc.text }}>
            {a !== null ? a.toFixed(1) : "—"}
          </span>
        </div>
        {/* Status */}
        {d.status === "Posted" && (
          <div className="absolute top-2 left-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl shadow-md bg-purple-100 text-purple-700">✅ Posted</span>
          </div>
        )}
        {d.is_winner && (
          <div className="absolute bottom-2 left-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl shadow-md bg-yellow-100 text-yellow-700">🏆 Winner</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-start gap-2 flex-wrap">
          {pc && <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background:pc.bg, color:pc.color }}>{pc.emoji} {d.pillar}</span>}
          {d.audience && <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full truncate">{d.audience}</span>}
        </div>

        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{d.title || "Untitled"}</h3>

        {d.hook && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 italic">"{d.hook}"</p>
        )}

        {/* Platform icons */}
        <div className="flex gap-1.5 mt-auto pt-2 flex-wrap">
          {plats.map(p => (
            <span key={p.key} className="text-base" title={p.label}>{p.icon}</span>
          ))}
          {!plats.length && <span className="text-xs text-gray-300">No platforms yet</span>}
        </div>

        {/* Scores row */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
          <div className="flex gap-2 text-xs text-gray-400">
            {d.clarity_score && <span>C:{d.clarity_score}</span>}
            {d.relatability_score && <span>R:{d.relatability_score}</span>}
            {d.conversion_score && <span>V:{d.conversion_score}</span>}
          </div>
          {d.campaign_tag && (
            <span className="text-[10px] text-gray-400 font-mono truncate max-w-[90px]">{d.campaign_tag}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Detail drawer ──────────────────────────────────────────────────────────
function Drawer({ d, onClose, onStatusChange }) {
  const [platTab, setPlatTab] = useState(() => {
    const first = PLATFORMS.find(p => d[p.field]);
    return first?.key || "facebook";
  });
  const [saving, setSaving] = useState(false);
  const [localStatus, setLocalStatus] = useState(d.status);
  const a  = avgScore(d);
  const sc = scoreColor(a);
  const pc = PILLAR[d.pillar];
  const activePlats = PLATFORMS.filter(p => d[p.field]);

  async function changeStatus(s) {
    setSaving(true);
    try {
      await ContentDraft.update(d.id, { status: s });
      setLocalStatus(s);
      onStatusChange(d.id, s);
    } catch {}
    setSaving(false);
  }

  const curText = d[PLATFORMS.find(p=>p.key===platTab)?.field] || "";

  return (
    <div className="fixed inset-0 z-[400] flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div className="w-full max-w-2xl bg-white shadow-2xl overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {pc && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:pc.bg,color:pc.color}}>{pc.emoji} {d.pillar}</span>}
              {d.audience && <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">{d.audience}</span>}
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full" style={{background:sc.bg,color:sc.text}}>
                {a !== null ? a.toFixed(1) : "—"} {sc.label}
              </span>
              {localStatus === "Posted" && <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">✅ Posted</span>}
            </div>
            <h2 className="font-black text-gray-900 text-base leading-snug">{d.title}</h2>
            {d.hook && <p className="text-sm text-gray-500 mt-1 italic">"{d.hook}"</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none flex-shrink-0">×</button>
        </div>

        {/* Image */}
        {d.image_url && (
          <div className="px-6 pt-4">
            <img src={d.image_url} alt={d.title}
              className="w-full rounded-2xl object-cover shadow-sm border border-gray-100"
              style={{ maxHeight:"280px" }} />
          </div>
        )}

        {/* Score breakdown */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 gap-3">
            {[["Clarity", d.clarity_score],["Relatability", d.relatability_score],["Conversion", d.conversion_score]].map(([label,val])=>(
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xl font-black" style={{color:BRAND}}>{val ?? "—"}</div>
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hook + primary caption */}
        <div className="px-6 pt-5 space-y-4">
          {d.hook && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Hook</div>
              <div className="flex items-start gap-2">
                <div className="flex-1 text-sm font-semibold text-gray-800 bg-blue-50 border border-blue-100 rounded-xl p-3 leading-relaxed">
                  {d.hook}
                </div>
                <CopyBtn text={d.hook} label="Hook" />
              </div>
            </div>
          )}

          {d.short_caption && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Short Caption</div>
              <div className="flex items-start gap-2">
                <div className="flex-1 text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-3 leading-relaxed">{d.short_caption}</div>
                <CopyBtn text={d.short_caption} label="Short" />
              </div>
            </div>
          )}
        </div>

        {/* Platform tabs */}
        <div className="px-6 pt-5">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Platform Copy</div>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {activePlats.map(p => (
              <button key={p.key} onClick={() => setPlatTab(p.key)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all"
                style={platTab===p.key
                  ? {background:BRAND,color:"#fff",borderColor:BRAND}
                  : {background:"#F9FAFB",color:"#6B7280",borderColor:"#E5E7EB"}
                }>
                {p.icon} {p.label}
              </button>
            ))}
          </div>
          {curText ? (
            <div className="relative">
              <div className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-4 pr-5 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                {curText}
              </div>
              <div className="mt-2 flex justify-end">
                <CopyBtn text={curText} label={PLATFORMS.find(p=>p.key===platTab)?.label||"Copy"} />
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-300 italic py-4 text-center">No copy for this platform</div>
          )}
        </div>

        {/* CTAs */}
        {(d.cta_1 || d.cta_2 || d.cta_3) && (
          <div className="px-6 pt-5">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">CTAs</div>
            <div className="space-y-2">
              {[d.cta_1, d.cta_2, d.cta_3].filter(Boolean).map((c,i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1 text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">{c}</div>
                  <CopyBtn text={c} label="CTA" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scripts */}
        {(d.script_15sec || d.script_30sec || d.script_45sec) && (
          <div className="px-6 pt-5">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Video Scripts</div>
            <div className="space-y-3">
              {[["15sec", d.script_15sec],["30sec", d.script_30sec],["45sec", d.script_45sec]].filter(([,v])=>v).map(([label,val])=>(
                <div key={label}>
                  <div className="text-[10px] font-bold text-gray-400 mb-1">{label.toUpperCase()}</div>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-3 leading-relaxed whitespace-pre-wrap">{val}</div>
                    <CopyBtn text={val} label={label} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor notes */}
        {d.editor_notes && (
          <div className="px-6 pt-5">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Notes</div>
            <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-100 rounded-xl p-3 leading-relaxed">{d.editor_notes}</div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 pt-5 pb-8">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Mark As</div>
          <div className="flex gap-2 flex-wrap">
            {["Draft","Approved","Posted","Rejected"].map(s => (
              <button key={s} onClick={() => changeStatus(s)} disabled={saving || localStatus===s}
                className="text-xs font-bold px-4 py-2 rounded-xl border transition-all disabled:opacity-40"
                style={localStatus===s
                  ? {background:BRAND,color:"#fff",borderColor:BRAND}
                  : {background:"#F9FAFB",color:"#374151",borderColor:"#E5E7EB"}
                }>
                {s}
              </button>
            ))}
          </div>
          {d.week_tag && <div className="text-xs text-gray-400 mt-3">Week: {d.week_tag}</div>}
          {d.campaign_tag && <div className="text-xs text-gray-400">Campaign: {d.campaign_tag}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function ContentLibrary() {
  const [drafts,  setDrafts]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState(null);
  const [synced,  setSynced]  = useState(null);
  const [toast,   setToast]   = useState(null);
  const [sel,     setSel]     = useState(null);

  // Filters
  const [statusF,   setStatusF]   = useState("Approved");
  const [pillarF,   setPillarF]   = useState("All");
  const [audienceF, setAudienceF] = useState("All");
  const [campaignF, setCampaignF] = useState("All");
  const [hasImgF,   setHasImgF]   = useState("All");
  const [winnerF,   setWinnerF]   = useState("All");
  const [q,         setQ]         = useState("");
  const [sortBy,    setSortBy]    = useState("score");
  const [view,      setView]      = useState("grid"); // grid | list

  const fire = (msg, err=false) => { setToast({msg,err}); setTimeout(()=>setToast(null),3000); };

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const data = await ContentDraft.list();
      setDrafts(Array.isArray(data) ? data : []);
      setSynced(new Date());
    } catch(e) { setErr(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const allPillars   = useMemo(() => ["All",...new Set(drafts.map(d=>d.pillar).filter(Boolean))].sort((a,b)=>a==="All"?-1:b==="All"?1:a.localeCompare(b)), [drafts]);
  const allAudiences = useMemo(() => ["All",...new Set(drafts.map(d=>d.audience).filter(Boolean))].sort((a,b)=>a==="All"?-1:b==="All"?1:a.localeCompare(b)), [drafts]);
  const allCampaigns = useMemo(() => ["All",...new Set(drafts.map(d=>d.campaign_tag).filter(Boolean))].sort((a,b)=>a==="All"?-1:b==="All"?1:a.localeCompare(b)), [drafts]);

  const filtered = useMemo(() => {
    return drafts
      .filter(d => {
        if (statusF !== "All"   && d.status      !== statusF)   return false;
        if (pillarF !== "All"   && d.pillar       !== pillarF)   return false;
        if (audienceF !== "All" && d.audience     !== audienceF) return false;
        if (campaignF !== "All" && d.campaign_tag !== campaignF) return false;
        if (hasImgF === "Yes"   && !d.image_url)                 return false;
        if (hasImgF === "No"    && d.image_url)                  return false;
        if (winnerF === "Yes"   && !d.is_winner)                 return false;
        if (q) {
          const ql = q.toLowerCase();
          if (!d.title?.toLowerCase().includes(ql) &&
              !d.hook?.toLowerCase().includes(ql) &&
              !d.audience?.toLowerCase().includes(ql) &&
              !d.pillar?.toLowerCase().includes(ql)) return false;
        }
        return true;
      })
      .sort((a,b) => {
        if (sortBy==="score") return (avgScore(b)??0)-(avgScore(a)??0);
        if (sortBy==="date")  return new Date(b.created_date||0)-new Date(a.created_date||0);
        return (a.title||"").localeCompare(b.title||"");
      });
  }, [drafts, statusF, pillarF, audienceF, campaignF, hasImgF, winnerF, q, sortBy]);

  // Stats
  const total    = drafts.length;
  const approved = drafts.filter(d=>d.status==="Approved").length;
  const posted   = drafts.filter(d=>d.status==="Posted").length;
  const elite    = drafts.filter(d=>{ const a=avgScore(d); return a!==null && a>=9.0; }).length;
  const withImg  = drafts.filter(d=>d.image_url).length;

  function handleStatusChange(id, status) {
    setDrafts(prev => prev.map(d => d.id===id ? {...d,status} : d));
    fire(`✅ Marked as ${status}`);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">📚</div>
        <div className="font-bold text-gray-700">Loading Content Library…</div>
        <div className="text-xs text-gray-400 mt-1">Fetching all {total || ""} pieces</div>
      </div>
    </div>
  );

  if (err) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
      <div className="text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <div className="font-bold text-red-600 mb-2">Load Error</div>
        <div className="text-sm text-red-400 font-mono bg-red-50 rounded-xl px-3 py-2 mb-4">{err}</div>
        <button onClick={load} className="px-5 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold">↻ Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F4FF]" style={{fontFamily:"'Inter',sans-serif"}}>
      <Toast t={toast} />
      {sel && <Drawer d={sel} onClose={()=>setSel(null)} onStatusChange={handleStatusChange} />}

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="text-white" style={{background:`linear-gradient(135deg, ${BRAND} 0%, #0066CC 100%)`}}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="font-black text-2xl" style={{color:BRAND}}>📚</span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">PureTask Content Library</h1>
                <p className="text-blue-200 text-sm mt-0.5">Every finished, graded piece of content — one place, ready to post</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {synced && <span className="text-blue-200 text-xs">Synced {synced.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>}
              <button onClick={load} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all">↻ Refresh</button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-5 gap-3">
            {[
              ["Total Pieces",  total,    "📦"],
              ["Approved",      approved, "✅"],
              ["Posted",        posted,   "🚀"],
              ["Elite (9.0+)",  elite,    "🏆"],
              ["With Image",    withImg,  "🖼"],
            ].map(([label,val,emoji]) => (
              <div key={label} className="bg-white/15 backdrop-blur rounded-2xl px-4 py-3 text-center">
                <div className="text-2xl font-black">{val}</div>
                <div className="text-xs text-blue-200 mt-0.5">{emoji} {label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTERS ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input value={q} onChange={e=>setQ(e.target.value)}
              placeholder="Search titles, hooks, audience…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>

          {/* Status */}
          <select value={statusF} onChange={e=>setStatusF(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
            {["All","Approved","Posted","Draft","Rejected"].map(s=><option key={s}>{s}</option>)}
          </select>

          {/* Pillar */}
          <select value={pillarF} onChange={e=>setPillarF(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
            {allPillars.map(p=><option key={p}>{p}</option>)}
          </select>

          {/* Audience */}
          <select value={audienceF} onChange={e=>setAudienceF(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none max-w-[180px]">
            {allAudiences.map(a=><option key={a}>{a}</option>)}
          </select>

          {/* Campaign */}
          <select value={campaignF} onChange={e=>setCampaignF(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none max-w-[160px]">
            {allCampaigns.map(c=><option key={c}>{c}</option>)}
          </select>

          {/* Has Image */}
          <select value={hasImgF} onChange={e=>setHasImgF(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
            <option value="All">All Images</option>
            <option value="Yes">Has Image</option>
            <option value="No">No Image</option>
          </select>

          {/* Winners */}
          <select value={winnerF} onChange={e=>setWinnerF(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
            <option value="All">All</option>
            <option value="Yes">🏆 Winners Only</option>
          </select>

          {/* Sort */}
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
            <option value="score">Sort: Score ↓</option>
            <option value="date">Sort: Newest</option>
            <option value="title">Sort: A→Z</option>
          </select>

          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            <button onClick={()=>setView("grid")}
              className="px-3 py-2 text-sm transition-all"
              style={view==="grid"?{background:BRAND,color:"#fff"}:{background:"#F9FAFB",color:"#6B7280"}}>
              ⊞
            </button>
            <button onClick={()=>setView("list")}
              className="px-3 py-2 text-sm border-l border-gray-200 transition-all"
              style={view==="list"?{background:BRAND,color:"#fff"}:{background:"#F9FAFB",color:"#6B7280"}}>
              ≡
            </button>
          </div>

          <span className="text-xs text-gray-400 font-semibold ml-auto">{filtered.length} results</span>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🔎</div>
            <div className="font-bold text-lg">No content matches these filters</div>
            <button onClick={()=>{setQ("");setStatusF("All");setPillarF("All");setAudienceF("All");setCampaignF("All");setHasImgF("All");setWinnerF("All");}}
              className="mt-4 text-sm font-bold px-4 py-2 rounded-xl bg-blue-50 text-blue-600">
              Clear all filters
            </button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(d => (
              <Card key={d.id} d={d} onClick={() => setSel(d)} />
            ))}
          </div>
        ) : (
          /* List view */
          <div className="space-y-2">
            {filtered.map(d => {
              const a=avgScore(d); const sc=scoreColor(a); const pc=PILLAR[d.pillar];
              const plats=PLATFORMS.filter(p=>d[p.field]);
              return (
                <div key={d.id} onClick={()=>setSel(d)}
                  className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-5 cursor-pointer hover:shadow-md transition-all">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {d.image_url
                      ? <img src={d.image_url} alt="" className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">🖼</div>
                    }
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {pc && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:pc.bg,color:pc.color}}>{pc.emoji} {d.pillar}</span>}
                      {d.audience && <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">{d.audience}</span>}
                      {d.is_winner && <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">🏆</span>}
                    </div>
                    <div className="font-bold text-gray-900 text-sm truncate">{d.title}</div>
                    {d.hook && <div className="text-xs text-gray-500 italic truncate mt-0.5">"{d.hook}"</div>}
                  </div>
                  {/* Platforms */}
                  <div className="hidden sm:flex gap-1 flex-shrink-0">
                    {plats.map(p=><span key={p.key} className="text-base" title={p.label}>{p.icon}</span>)}
                  </div>
                  {/* Score */}
                  <div className="flex-shrink-0 text-center">
                    <div className="text-lg font-black" style={{color:sc.text}}>{a!==null?a.toFixed(1):"—"}</div>
                    <div className="text-[10px] font-semibold" style={{color:sc.text}}>{sc.label}</div>
                  </div>
                  {/* Status */}
                  <div className="flex-shrink-0">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl"
                      style={d.status==="Approved"?{background:"#ECFDF5",color:"#059669"}
                            :d.status==="Posted"?{background:"#EDE9FE",color:"#6D28D9"}
                            :{background:"#F3F4F6",color:"#9CA3AF"}}>
                      {d.status}
                    </span>
                  </div>
                  <div className="text-gray-300 text-lg flex-shrink-0">›</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-6 pb-8 text-center">
        <p className="text-xs text-gray-400">PureTask Content Library · {total} pieces total · {approved} approved · {posted} posted</p>
      </div>
    </div>
  );
}
