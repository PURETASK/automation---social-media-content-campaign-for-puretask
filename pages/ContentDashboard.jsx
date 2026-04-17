import { useState, useEffect, useCallback } from "react";
import { ContentDraft, PostPerformance, ContentIdea, WinnerDNA } from "@/api/entities";

const APP_ID = "69d5e4bdf3e0e9aab2818c8a";

async function loadAll() {
  const [drafts, perfs, ideas, dna] = await Promise.all([
    ContentDraft.list(),
    PostPerformance.list(),
    ContentIdea.list(),
    WinnerDNA.list(),
  ]);
  return {
    ContentDraft:    Array.isArray(drafts) ? drafts : [],
    PostPerformance: Array.isArray(perfs)  ? perfs  : [],
    ContentIdea:     Array.isArray(ideas)  ? ideas  : [],
    WinnerDNA:       Array.isArray(dna)    ? dna    : [],
  };
}

async function patchEntity(entity, id, data) {
  const entityMap = { ContentDraft, PostPerformance, ContentIdea, WinnerDNA };
  const E = entityMap[entity];
  if (!E) throw new Error("Unknown entity: " + entity);
  return E.update(id, data);
}

const PILLAR = {
  Convenience:    { color:"#2563EB", bg:"#EFF6FF", border:"#BFDBFE", emoji:"⚡" },
  Trust:          { color:"#059669", bg:"#ECFDF5", border:"#A7F3D0", emoji:"🔒" },
  Transformation: { color:"#7C3AED", bg:"#F5F3FF", border:"#DDD6FE", emoji:"✨" },
  Recruitment:    { color:"#EA580C", bg:"#FFF7ED", border:"#FED7AA", emoji:"💰" },
  Local:          { color:"#0D9488", bg:"#F0FDFA", border:"#99F6E4", emoji:"📍" },
  Proof:          { color:"#DB2777", bg:"#FDF2F8", border:"#FBCFE8", emoji:"⭐" },
  Seniors:        { color:"#B45309", bg:"#FFFBEB", border:"#FDE68A", emoji:"🌿" },
  Spring:         { color:"#65A30D", bg:"#F7FEE7", border:"#D9F99D", emoji:"🌸" },
};

const STATUS = {
  Draft:              { bg:"#F3F4F6", color:"#6B7280", dot:"#9CA3AF" },
  "Pending Approval": { bg:"#FFFBEB", color:"#B45309", dot:"#F59E0B" },
  Approved:           { bg:"#ECFDF5", color:"#059669", dot:"#10B981" },
  Rejected:           { bg:"#FEF2F2", color:"#DC2626", dot:"#EF4444" },
  Posted:             { bg:"#EDE9FE", color:"#6D28D9", dot:"#8B5CF6" },
  Scheduled:          { bg:"#EFF6FF", color:"#2563EB", dot:"#3B82F6" },
};

const PLAT = {
  facebook:  { icon:"👥", label:"Facebook",  field:"platform_facebook"  },
  instagram: { icon:"📸", label:"Instagram", field:"platform_instagram" },
  linkedin:  { icon:"💼", label:"LinkedIn",  field:"platform_linkedin"  },
  tiktok:    { icon:"🎵", label:"TikTok",    field:"platform_tiktok"    },
  x:         { icon:"🐦", label:"X / Twitter", field:"platform_x"       },
  pinterest: { icon:"📌", label:"Pinterest", field:"platform_pinterest" },
  threads:   { icon:"🧵", label:"Threads",   field:"platform_threads"   },
  youtube:   { icon:"▶️", label:"YouTube",   field:"platform_youtube"   },
};

const TABS = ["📋 Queue", "📊 Analytics", "💡 Ideas", "🧬 Winner DNA"];

function avg(d) {
  const v = [d.clarity_score, d.relatability_score, d.conversion_score].filter(x => typeof x === "number");
  return v.length === 3 ? v.reduce((a,b)=>a+b,0)/3 : null;
}

function ScoreBadge({ d }) {
  const a = avg(d);
  if (a===null) return <span className="text-xs text-gray-300">—</span>;
  const c = a>=7.5?{color:"#059669",bg:"#ECFDF5"}:a>=6?{color:"#B45309",bg:"#FFFBEB"}:{color:"#DC2626",bg:"#FEF2F2"};
  return <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{color:c.color,background:c.bg}}>{a.toFixed(1)}</span>;
}

function StatusPill({ s }) {
  const c = STATUS[s] || STATUS.Draft;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{background:c.bg,color:c.color}}>
      <span className="w-1.5 h-1.5 rounded-full" style={{background:c.dot}}/>
      {s}
    </span>
  );
}

function PillarPill({ p }) {
  const c = PILLAR[p]; if (!c) return null;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border" style={{background:c.bg,color:c.color,borderColor:c.border}}>{c.emoji} {p}</span>;
}

function Toast({ t }) {
  if (!t) return null;
  return <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold text-white pointer-events-none ${t.type==="error"?"bg-red-500":"bg-gray-900"}`}>{t.msg}</div>;
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  function doCopy() {
    if (!text) return;
    navigator.clipboard.writeText(text).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  }
  return (
    <button onClick={doCopy} className="text-[10px] px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 font-semibold ml-2 flex-shrink-0 transition-all">
      {copied?"✅ Copied":"📋 Copy"}
    </button>
  );
}

function Section({ label, children, accent }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{color: accent||"#9CA3AF"}}>{label}</div>
      {children}
    </div>
  );
}

function TextBlock({ text, rows = 4 }) {
  if (!text) return <div className="text-xs text-gray-300 italic">—</div>;
  return (
    <div className="relative">
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-xl p-3 pr-14 max-h-40 overflow-y-auto">
        {text}
      </div>
      <div className="absolute top-2 right-2"><CopyBtn text={text}/></div>
    </div>
  );
}

export default function ContentDashboard() {
  const [tab, setTab]         = useState("📋 Queue");
  const [drafts, setDrafts]   = useState([]);
  const [perfs,  setPerfs]    = useState([]);
  const [ideas,  setIdeas]    = useState([]);
  const [dna,    setDna]      = useState([]);
  const [loading,setLoading]  = useState(true);
  const [err,    setErr]      = useState(null);
  const [synced, setSynced]   = useState(null);

  // Read ?status= from URL to pre-filter
  const [sf, setSf] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      return p.get("status") || "All";
    } catch { return "All"; }
  });
  const [pf, setPf] = useState("All");
  const [cf, setCf] = useState("All");
  const [q,  setQ]  = useState("");

  const [sel,      setSel]      = useState(null);
  const [platTab,  setPlatTab]  = useState("facebook");
  const [detailSection, setDetailSection] = useState("copy");
  const [editing,  setEditing]  = useState(false);
  const [editBuf,  setEditBuf]  = useState({});
  const [saving,   setSaving]   = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [pubPlats, setPubPlats] = useState([]);
  const [toast,    setToast]    = useState(null);

  const fire = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3200); };

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const data = await loadAll();
      setDrafts(data.ContentDraft    || []);
      setPerfs (data.PostPerformance || []);
      setIdeas (data.ContentIdea     || []);
      setDna   (data.WinnerDNA       || []);
      setSynced(new Date());
    } catch(e) { setErr(e.message); }
    setLoading(false);
  }, []);

  useEffect(()=>{ load(); },[load]);

  // Stats
  const approved   = drafts.filter(d=>d.status==="Approved").length;
  const posted     = drafts.filter(d=>d.status==="Posted").length;
  const withImg    = drafts.filter(d=>d.image_url).length;
  const needImg    = drafts.filter(d=>!d.image_url&&!["Rejected","Posted"].includes(d.status)).length;
  const winners    = drafts.filter(d=>d.is_winner).length;
  const realPerfs  = perfs.filter(p=>(Number(p.reach)||0)>0);
  const totalReach = realPerfs.reduce((s,p)=>s+(Number(p.reach)||0),0);
  const avgEng     = realPerfs.length ? (realPerfs.reduce((s,p)=>s+(Number(p.engagement_rate)||0),0)/realPerfs.length).toFixed(1) : "—";

  const campaigns = ["All", ...Array.from(new Set(drafts.map(d=>d.campaign_tag).filter(Boolean)))];
  const pillars   = ["All", ...Array.from(new Set(drafts.map(d=>d.pillar).filter(Boolean)))];
  const statuses  = ["All","Draft","Pending Approval","Approved","Posted","Scheduled","Rejected"];

  const filtered = drafts
    .filter(d=>{
      if (sf!=="All"&&d.status!==sf) return false;
      if (pf!=="All"&&d.pillar!==pf) return false;
      if (cf!=="All"&&d.campaign_tag!==cf) return false;
      if (q) {
        const ql=q.toLowerCase();
        if (!d.title?.toLowerCase().includes(ql)&&!d.hook?.toLowerCase().includes(ql)&&!d.audience?.toLowerCase().includes(ql)&&!d.city?.toLowerCase().includes(ql)&&!d.week_tag?.toLowerCase().includes(ql)) return false;
      }
      return true;
    })
    .sort((a,b)=>new Date(b.created_date||0)-new Date(a.created_date||0));

  const selPerfs = sel ? realPerfs.filter(p=>p.content_draft_id===sel.id) : [];

  async function setStatus(id, status) {
    setSaving(true);
    try {
      await patchEntity("ContentDraft", id, {status});
      setDrafts(prev=>prev.map(d=>d.id===id?{...d,status}:d));
      if(sel?.id===id) setSel(p=>({...p,status}));
      fire(`→ ${status}`);
    } catch(e){ fire("Error: "+e.message,"error"); }
    setSaving(false);
  }

  async function toggleWinner(id, cur) {
    const val = !cur;
    setSaving(true);
    try {
      await patchEntity("ContentDraft", id, {is_winner: val});
      setDrafts(prev=>prev.map(d=>d.id===id?{...d,is_winner:val}:d));
      if(sel?.id===id) setSel(p=>({...p,is_winner:val}));
      fire(val?"🏆 Marked as Winner!":"Winner removed");
    } catch(e){ fire("Error: "+e.message,"error"); }
    setSaving(false);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      await patchEntity("ContentDraft", sel.id, editBuf);
      const u={...sel,...editBuf};
      setDrafts(prev=>prev.map(d=>d.id===sel.id?u:d));
      setSel(u); setEditing(false); fire("💾 Saved!");
    } catch(e){ fire("Error: "+e.message,"error"); }
    setSaving(false);
  }

  async function postNow() {
    if(!pubPlats.length){fire("Pick at least one platform","error");return;}
    setSaving(true);
    try {
      const r = await fetch(`https://app.base44.com/api/apps/${APP_ID}/functions/postToSocials`,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({draft_id:sel.id, platforms:pubPlats})
      });
      const j = await r.json();
      if(j.ok){ fire("🚀 Posted to "+(j.posted_to||pubPlats).join(", ")); setShowPost(false); load(); }
      else fire(j.error||"Post failed","error");
    } catch(e){ fire("Error: "+e.message,"error"); }
    setSaving(false);
  }

  function open(d) {
    setSel(d); setPlatTab("facebook"); setDetailSection("copy"); setEditing(false); setShowPost(false); setPubPlats([]);
    setEditBuf({
      title: d.title||"", hook: d.hook||"",
      primary_caption: d.primary_caption||"",
      short_caption: d.short_caption||"",
      long_caption: d.long_caption||"",
      platform_facebook: d.platform_facebook||"",
      platform_instagram: d.platform_instagram||"",
      platform_linkedin: d.platform_linkedin||"",
      platform_tiktok: d.platform_tiktok||"",
      platform_x: d.platform_x||"",
      platform_pinterest: d.platform_pinterest||"",
      platform_threads: d.platform_threads||"",
      platform_youtube: d.platform_youtube||"",
      cta_1: d.cta_1||"", cta_2: d.cta_2||"", cta_3: d.cta_3||"",
      script_15sec: d.script_15sec||"",
      script_30sec: d.script_30sec||"",
      script_45sec: d.script_45sec||"",
      video_prompt: d.video_prompt||"",
      image_prompt: d.image_prompt||"",
      comment_replies: d.comment_replies||"",
      blog_post: d.blog_post||"",
      editor_notes: d.editor_notes||"",
      week_tag: d.week_tag||"",
      campaign_tag: d.campaign_tag||"",
      city: d.city||"",
    });
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">⚡</div>
        <div className="text-base font-bold text-gray-700">Syncing all data…</div>
        <div className="text-xs text-gray-400 mt-1">Drafts · Analytics · Ideas · DNA</div>
      </div>
    </div>
  );

  if (err) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-3">⚠️</div>
        <div className="font-bold text-red-600 mb-2">Load Error</div>
        <div className="text-sm text-red-400 font-mono bg-red-50 rounded-xl px-3 py-2 mb-4">{err}</div>
        <button onClick={load} className="px-5 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F4FF]" style={{fontFamily:"'Inter',system-ui,sans-serif"}}>
      <Toast t={toast} />

      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-black" style={{background:"linear-gradient(135deg,#003FA3,#0099FF)"}}>P</div>
          <div>
            <div className="font-black text-gray-900 text-sm leading-none">PureTask Content Engine</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{drafts.length} drafts · {synced ? `Synced ${synced.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}` : "…"}</div>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={load} className="text-xs px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold">↻ Refresh</button>
          </div>
        </div>

        {/* Stat bar */}
        <div className="grid grid-cols-5 gap-0 border-t border-gray-50">
          {[
            ["Total",    drafts.length, "#374151"],
            ["Approved", approved,      "#059669"],
            ["Posted",   posted,        "#6D28D9"],
            ["🖼 Images",withImg,       "#0099FF"],
            ["🏆 Winners",winners,      "#EA580C"],
          ].map(([l,v,c])=>(
            <div key={l} className="text-center py-2 border-r border-gray-50 last:border-0">
              <div className="text-base font-black" style={{color:c}}>{v}</div>
              <div className="text-[9px] text-gray-400 font-semibold uppercase">{l}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex border-t border-gray-50">
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all ${tab===t?"border-blue-500 text-blue-600 bg-blue-50":"border-transparent text-gray-400 hover:text-gray-600"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── QUEUE TAB ─────────────────────────────────────────────────────── */}
      {tab==="📋 Queue" && (
        <div className={`flex h-[calc(100vh-200px)] overflow-hidden`}>

          {/* Left panel — list */}
          <div className={`${sel?"hidden md:flex":"flex"} flex-col w-full md:w-[340px] flex-shrink-0 bg-white border-r border-gray-100 overflow-hidden`}>

            {/* Filters */}
            <div className="p-3 border-b border-gray-50 space-y-2">
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search title, hook, city, week…"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400"/>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                <select value={sf} onChange={e=>setSf(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none bg-white flex-shrink-0">
                  {statuses.map(s=><option key={s}>{s}</option>)}
                </select>
                <select value={pf} onChange={e=>setPf(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none bg-white flex-shrink-0">
                  {pillars.map(p=><option key={p}>{p}</option>)}
                </select>
                <select value={cf} onChange={e=>setCf(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none bg-white flex-shrink-0">
                  {campaigns.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="text-[10px] text-gray-400">{filtered.length} of {drafts.length} shown</div>
            </div>

            {/* Draft list */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length===0&&<div className="p-6 text-center text-gray-300 text-sm">No drafts match filters</div>}
              {filtered.map(d=>(
                <div key={d.id} onClick={()=>open(d)}
                  className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-blue-50 transition-all ${sel?.id===d.id?"bg-blue-50 border-l-4 border-l-blue-500":""}`}>
                  <div className="flex items-start gap-2">
                    {d.image_url
                      ? <img src={d.image_url} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt=""/>
                      : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">{PILLAR[d.pillar]?.emoji||"📄"}</div>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <StatusPill s={d.status}/>
                        {d.is_winner&&<span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-black">🏆 Winner</span>}
                        <ScoreBadge d={d}/>
                      </div>
                      <div className="font-bold text-gray-900 text-xs leading-snug line-clamp-2">{d.title||"Untitled"}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 flex flex-wrap gap-x-2">
                        {d.audience&&<span>👤 {d.audience}</span>}
                        {d.pillar&&<span>{PILLAR[d.pillar]?.emoji} {d.pillar}</span>}
                        {d.city&&<span>📍 {d.city}</span>}
                        {d.campaign_tag&&<span>🏷 {d.campaign_tag}</span>}
                        {d.week_tag&&<span>📅 {d.week_tag}</span>}
                      </div>
                      {/* Platform dots */}
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {Object.entries(PLAT).map(([k,c])=>d[c.field]
                          ? <span key={k} className="text-[10px] px-1 py-0.5 rounded bg-gray-100 text-gray-500">{c.icon}</span>
                          : null)}
                        {d.script_30sec&&<span className="text-[10px] px-1 py-0.5 rounded bg-purple-100 text-purple-600">🎬 Script</span>}
                        {d.blog_post&&<span className="text-[10px] px-1 py-0.5 rounded bg-green-100 text-green-600">📝 Blog</span>}
                        {d.video_cdn_url&&<span className="text-[10px] px-1 py-0.5 rounded bg-red-100 text-red-600">🎥 Video</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — detail */}
          {sel && (
            <div className="flex-1 overflow-y-auto bg-white">
              {/* Detail header */}
              <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <StatusPill s={sel.status}/>
                      <PillarPill p={sel.pillar}/>
                      {sel.is_winner&&<span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-black">🏆 Winner</span>}
                    </div>
                    {editing
                      ? <input value={editBuf.title} onChange={e=>setEditBuf(p=>({...p,title:e.target.value}))}
                          className="font-black text-gray-900 text-base w-full border-b-2 border-blue-400 focus:outline-none bg-transparent"/>
                      : <div className="font-black text-gray-900 text-base leading-snug">{sel.title||"Untitled"}</div>}
                    <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-x-3">
                      {sel.audience&&<span>👤 {sel.audience}</span>}
                      {sel.city&&<span>📍 {sel.city}</span>}
                      {sel.campaign_tag&&<span>🏷 {sel.campaign_tag}</span>}
                      {sel.week_tag&&<span>📅 {sel.week_tag}</span>}
                    </div>
                  </div>
                  <button onClick={()=>{setSel(null);setEditing(false);}} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">✕</button>
                </div>

                {/* Score strip */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[["Clarity",sel.clarity_score],["Relatability",sel.relatability_score],["Conversion",sel.conversion_score]].map(([l,v])=>(
                    <div key={l} className="bg-gray-50 rounded-xl p-2 text-center">
                      <div className="text-[9px] text-gray-400 font-bold uppercase leading-none mb-1">{l}</div>
                      <div className={`text-lg font-black ${typeof v==="number"?v>=7.5?"text-green-600":v>=6?"text-yellow-500":"text-red-500":"text-gray-300"}`}>
                        {typeof v==="number"?v.toFixed(1):"—"}
                      </div>
                    </div>
                  ))}
                  <div className="bg-blue-50 rounded-xl p-2 text-center">
                    <div className="text-[9px] text-blue-400 font-bold uppercase leading-none mb-1">Avg</div>
                    <div className="text-lg font-black text-blue-600">{(()=>{const a=avg(sel);return a!==null?a.toFixed(1):"—";})()}</div>
                  </div>
                </div>

                {/* Detail section tabs */}
                <div className="flex gap-1 mt-3 overflow-x-auto">
                  {["copy","captions","scripts","video","image","blog","performance","meta"].map(s=>(
                    <button key={s} onClick={()=>setDetailSection(s)}
                      className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-lg capitalize transition-all ${detailSection===s?"bg-blue-500 text-white":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {s==="copy"?"📝 Copy":s==="captions"?"💬 Captions":s==="scripts"?"🎬 Scripts":s==="video"?"🎥 Video":s==="image"?"🖼 Image":s==="blog"?"📰 Blog":s==="performance"?"📊 Perf":"🔖 Meta"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 space-y-4">

                {/* ── COPY SECTION ─────────────────────────────────── */}
                {detailSection==="copy" && (
                  <div>
                    {/* Image preview */}
                    {sel.image_url
                      ? <img src={sel.image_url} alt="" className="w-full h-52 object-cover rounded-2xl mb-4"/>
                      : <div className="w-full h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-sm mb-4">🖼 No image yet</div>}

                    {/* Hook */}
                    <Section label="Hook" accent="#0099FF">
                      {editing
                        ? <textarea value={editBuf.hook} rows={2} onChange={e=>setEditBuf(p=>({...p,hook:e.target.value}))} className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400"/>
                        : <div className="relative">
                            <div className="text-sm text-gray-700 italic bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 pr-14 leading-relaxed">"{sel.hook||<span className="text-gray-300 not-italic">No hook</span>}"</div>
                            <div className="absolute top-2 right-2"><CopyBtn text={sel.hook}/></div>
                          </div>}
                    </Section>

                    {/* Platform copy tabs */}
                    <Section label="Platform Copy" accent="#6D28D9">
                      <div className="flex overflow-x-auto gap-0 mb-2 border-b border-gray-100">
                        {Object.entries(PLAT).map(([k,c])=>(
                          <button key={k} onClick={()=>setPlatTab(k)}
                            className={`flex-shrink-0 px-2.5 py-1.5 text-[10px] font-bold border-b-2 transition-all whitespace-nowrap ${platTab===k?"border-blue-500 text-blue-600":"border-transparent text-gray-400 hover:text-gray-600"}`}>
                            {c.icon} {c.label}
                            {sel[c.field]&&platTab!==k&&<span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-green-400"/>}
                          </button>
                        ))}
                      </div>
                      {editing
                        ? <textarea value={editBuf[PLAT[platTab]?.field]??""} rows={8}
                            onChange={e=>setEditBuf(p=>({...p,[PLAT[platTab].field]:e.target.value}))}
                            className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400"/>
                        : <TextBlock text={sel[PLAT[platTab]?.field]}/>}
                    </Section>

                    {/* CTAs */}
                    <Section label="CTAs" accent="#059669">
                      {editing ? (
                        <div className="space-y-2">
                          {[["cta_1","CTA 1"],["cta_2","CTA 2"],["cta_3","CTA 3"]].map(([k,l])=>(
                            <input key={k} value={editBuf[k]} onChange={e=>setEditBuf(p=>({...p,[k]:e.target.value}))}
                              placeholder={l} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400"/>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {[sel.cta_1, sel.cta_2, sel.cta_3].filter(Boolean).map((c,i)=>(
                            <div key={i} className="flex items-center gap-2 text-xs bg-green-50 text-green-700 px-3 py-2 rounded-xl border border-green-100">
                              <span className="font-black text-green-400">→</span>
                              <span className="flex-1">{c}</span>
                              <CopyBtn text={c}/>
                            </div>
                          ))}
                          {!sel.cta_1&&!sel.cta_2&&!sel.cta_3&&<div className="text-xs text-gray-300 italic">No CTAs</div>}
                        </div>
                      )}
                    </Section>

                    {/* Editor notes */}
                    {sel.editor_notes&&!editing&&(
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Editor Notes</div>
                        <div className="text-xs text-amber-700 leading-relaxed">{sel.editor_notes}</div>
                      </div>
                    )}
                    {editing&&(
                      <Section label="Editor Notes">
                        <textarea value={editBuf.editor_notes} rows={3} onChange={e=>setEditBuf(p=>({...p,editor_notes:e.target.value}))}
                          className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400"/>
                      </Section>
                    )}
                  </div>
                )}

                {/* ── CAPTIONS SECTION ─────────────────────────────── */}
                {detailSection==="captions" && (
                  <div className="space-y-4">
                    <Section label="Primary Caption" accent="#0099FF">
                      {editing
                        ? <textarea value={editBuf.primary_caption} rows={6} onChange={e=>setEditBuf(p=>({...p,primary_caption:e.target.value}))} className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400"/>
                        : <TextBlock text={sel.primary_caption}/>}
                    </Section>
                    <Section label="Short Caption (Story/Reel)" accent="#7C3AED">
                      {editing
                        ? <textarea value={editBuf.short_caption} rows={3} onChange={e=>setEditBuf(p=>({...p,short_caption:e.target.value}))} className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400"/>
                        : <TextBlock text={sel.short_caption}/>}
                    </Section>
                    <Section label="Long Caption (Blog-style / LinkedIn)" accent="#059669">
                      {editing
                        ? <textarea value={editBuf.long_caption} rows={10} onChange={e=>setEditBuf(p=>({...p,long_caption:e.target.value}))} className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400"/>
                        : <TextBlock text={sel.long_caption}/>}
                    </Section>
                    <Section label="Comment Replies" accent="#DB2777">
                      {editing
                        ? <textarea value={editBuf.comment_replies} rows={4} onChange={e=>setEditBuf(p=>({...p,comment_replies:e.target.value}))} className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400"/>
                        : <TextBlock text={sel.comment_replies}/>}
                    </Section>
                  </div>
                )}

                {/* ── SCRIPTS SECTION ───────────────────────────────── */}
                {detailSection==="scripts" && (
                  <div className="space-y-4">
                    <Section label="15-Second Script" accent="#7C3AED">
                      {editing
                        ? <textarea value={editBuf.script_15sec} rows={4} onChange={e=>setEditBuf(p=>({...p,script_15sec:e.target.value}))} className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400"/>
                        : <TextBlock text={sel.script_15sec}/>}
                    </Section>
                    <Section label="30-Second Script" accent="#6D28D9">
                      {editing
                        ? <textarea value={editBuf.script_30sec} rows={6} onChange={e=>setEditBuf(p=>({...p,script_30sec:e.target.value}))} className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400"/>
                        : <TextBlock text={sel.script_30sec}/>}
                    </Section>
                    <Section label="45-Second Script" accent="#4C1D95">
                      {editing
                        ? <textarea value={editBuf.script_45sec} rows={8} onChange={e=>setEditBuf(p=>({...p,script_45sec:e.target.value}))} className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400"/>
                        : <TextBlock text={sel.script_45sec}/>}
                    </Section>
                  </div>
                )}

                {/* ── VIDEO SECTION ─────────────────────────────────── */}
                {detailSection==="video" && (
                  <div className="space-y-4">
                    {sel.video_cdn_url && (
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Generated Video</div>
                        <video src={sel.video_cdn_url} controls className="w-full rounded-2xl border border-gray-100"/>
                      </div>
                    )}
                    {sel.heygen_video_id && (
                      <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                        <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">HeyGen Video</div>
                        <div className="text-xs text-purple-700 font-mono">{sel.heygen_video_id}</div>
                        {sel.heygen_status&&<div className="mt-1 text-xs text-purple-500">Status: {sel.heygen_status}</div>}
                      </div>
                    )}
                    <Section label="Video Prompt" accent="#7C3AED">
                      {editing
                        ? <textarea value={editBuf.video_prompt} rows={5} onChange={e=>setEditBuf(p=>({...p,video_prompt:e.target.value}))} className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400"/>
                        : <TextBlock text={sel.video_prompt}/>}
                    </Section>
                    {!sel.video_cdn_url&&!sel.heygen_video_id&&<div className="text-xs text-gray-300 italic text-center py-4">No video generated yet</div>}
                  </div>
                )}

                {/* ── IMAGE SECTION ─────────────────────────────────── */}
                {detailSection==="image" && (
                  <div className="space-y-4">
                    {sel.image_url
                      ? <div>
                          <img src={sel.image_url} alt="" className="w-full rounded-2xl border border-gray-100 mb-2"/>
                          <div className="flex gap-2">
                            <a href={sel.image_url} target="_blank" rel="noreferrer" className="flex-1 text-center text-xs py-2 rounded-xl bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100">↗ Open Full Size</a>
                            <CopyBtn text={sel.image_url}/>
                          </div>
                        </div>
                      : <div className="w-full h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">🖼 No image yet</div>}
                    <Section label="Image Prompt" accent="#0099FF">
                      {editing
                        ? <textarea value={editBuf.image_prompt} rows={6} onChange={e=>setEditBuf(p=>({...p,image_prompt:e.target.value}))} className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400"/>
                        : <TextBlock text={sel.image_prompt}/>}
                    </Section>
                  </div>
                )}

                {/* ── BLOG SECTION ──────────────────────────────────── */}
                {detailSection==="blog" && (
                  <div>
                    <Section label="Full Blog Post" accent="#059669">
                      {editing
                        ? <textarea value={editBuf.blog_post} rows={20} onChange={e=>setEditBuf(p=>({...p,blog_post:e.target.value}))} className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400 font-mono"/>
                        : sel.blog_post
                          ? <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-xl p-4 max-h-[600px] overflow-y-auto">
                              {sel.blog_post}
                              <div className="sticky bottom-0 pt-2"><CopyBtn text={sel.blog_post}/></div>
                            </div>
                          : <div className="text-xs text-gray-300 italic text-center py-6">No blog post written yet</div>}
                    </Section>
                  </div>
                )}

                {/* ── PERFORMANCE SECTION ───────────────────────────── */}
                {detailSection==="performance" && (
                  <div className="space-y-4">
                    {selPerfs.length===0
                      ? <div className="text-xs text-gray-300 italic text-center py-6">No performance data yet — post first!</div>
                      : selPerfs.map(p=>(
                          <div key={p.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-bold text-sm text-gray-800 capitalize">{PLAT[p.platform]?.icon||"📊"} {p.platform}</div>
                              {p.performance_label&&<span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{p.performance_label}</span>}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                ["Reach",p.reach],["Impressions",p.impressions],["Likes",p.likes],
                                ["Comments",p.comments],["Shares",p.shares],["Saves",p.saves],
                                ["Clicks",p.clicks],["Eng Rate",p.engagement_rate!=null?`${Number(p.engagement_rate).toFixed(1)}%`:null],
                                ["Followers",p.follower_growth]
                              ].map(([l,v])=>(
                                <div key={l} className="bg-white rounded-xl p-2 text-center border border-gray-100">
                                  <div className="text-[9px] text-gray-400 font-bold uppercase">{l}</div>
                                  <div className="text-sm font-black text-gray-800">{v!=null?Number.isInteger(Number(v))?Number(v).toLocaleString():v:"—"}</div>
                                </div>
                              ))}
                            </div>
                            {p.video_completion_rate!=null&&(
                              <div className="mt-2 bg-white rounded-xl p-2 border border-gray-100 text-center">
                                <div className="text-[9px] text-gray-400 font-bold uppercase">Video Completion</div>
                                <div className="text-sm font-black text-blue-600">{Number(p.video_completion_rate).toFixed(0)}%</div>
                              </div>
                            )}
                            {p.notes&&<div className="text-xs text-gray-500 mt-2 italic">{p.notes}</div>}
                          </div>
                        ))}

                    {/* Performance score for this draft */}
                    {sel.avg_performance_score&&(
                      <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                        <div className="text-[10px] text-blue-400 font-bold uppercase mb-1">Avg Performance Score</div>
                        <div className="text-3xl font-black text-blue-600">{Number(sel.avg_performance_score).toFixed(1)}</div>
                        {sel.top_performing_platform&&<div className="text-xs text-blue-500 mt-1">Best on: {sel.top_performing_platform}</div>}
                      </div>
                    )}
                  </div>
                )}

                {/* ── META SECTION ──────────────────────────────────── */}
                {detailSection==="meta" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ["ID", sel.id],
                        ["Status", sel.status],
                        ["Pillar", sel.pillar],
                        ["Audience", sel.audience],
                        ["City", sel.city||"—"],
                        ["Campaign", sel.campaign_tag||"—"],
                        ["Week Tag", sel.week_tag||"—"],
                        ["Is Winner", sel.is_winner?"✅ Yes":"No"],
                        ["Has Image", sel.image_url?"✅ Yes":"❌ No"],
                        ["Has Video", sel.video_cdn_url?"✅ Yes":"❌ No"],
                        ["Has Blog", sel.blog_post?"✅ Yes":"❌ No"],
                        ["Scheduled", sel.scheduled_date||"—"],
                      ].map(([l,v])=>(
                        <div key={l} className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                          <div className="text-[9px] text-gray-400 font-bold uppercase">{l}</div>
                          <div className="text-xs text-gray-800 font-semibold mt-0.5 break-all">{String(v)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="text-[9px] text-gray-400 font-bold uppercase mb-1">Posted Platforms</div>
                      <div className="text-xs text-gray-700">{sel.posted_platforms||"None yet"}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="text-[9px] text-gray-400 font-bold uppercase mb-1">Scheduled Platforms</div>
                      <div className="text-xs text-gray-700">{sel.scheduled_platforms||"None"}</div>
                    </div>
                    <div className="text-[10px] text-gray-400 text-center pt-2">
                      Created: {new Date(sel.created_date).toLocaleString()} · Updated: {new Date(sel.updated_date).toLocaleString()}
                    </div>

                    {/* Edit meta fields */}
                    {editing && (
                      <div className="space-y-2 pt-2">
                        <Section label="Week Tag">
                          <input value={editBuf.week_tag} onChange={e=>setEditBuf(p=>({...p,week_tag:e.target.value}))} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400"/>
                        </Section>
                        <Section label="Campaign Tag">
                          <input value={editBuf.campaign_tag} onChange={e=>setEditBuf(p=>({...p,campaign_tag:e.target.value}))} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400"/>
                        </Section>
                        <Section label="City">
                          <input value={editBuf.city} onChange={e=>setEditBuf(p=>({...p,city:e.target.value}))} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400"/>
                        </Section>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Sticky action bar */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 space-y-2">
                {editing ? (
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{background:"linear-gradient(135deg,#003FA3,#0099FF)"}}>
                      {saving?"Saving…":"💾 Save All"}
                    </button>
                    <button onClick={()=>setEditing(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600">Cancel</button>
                  </div>
                ) : showPost ? (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select platforms to post:</div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {Object.entries(PLAT).map(([k,c])=>(
                        <label key={k} className="flex flex-col items-center gap-1 p-2 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 text-[10px] font-semibold text-center">
                          <input type="checkbox" className="rounded" checked={pubPlats.includes(k)} onChange={e=>setPubPlats(p=>e.target.checked?[...p,k]:p.filter(x=>x!==k))}/>
                          {c.icon} {c.label}
                        </label>
                      ))}
                    </div>
                    <button onClick={postNow} disabled={saving||!pubPlats.length}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                      style={{background:"linear-gradient(135deg,#7C3AED,#6D28D9)"}}>
                      {saving?`Posting…`:`🚀 Post to ${pubPlats.length} platform${pubPlats.length!==1?"s":""}`}
                    </button>
                    <button onClick={()=>setShowPost(false)} className="w-full py-1.5 text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      {!["Approved","Posted"].includes(sel.status)&&(
                        <button onClick={()=>setStatus(sel.id,"Approved")} disabled={saving}
                          className="flex-1 py-2 rounded-xl text-sm font-bold text-white min-w-[80px]" style={{background:"linear-gradient(135deg,#059669,#10B981)"}}>✅ Approve</button>
                      )}
                      {sel.status==="Approved"&&(
                        <button onClick={()=>setShowPost(true)}
                          className="flex-1 py-2 rounded-xl text-sm font-bold text-white min-w-[80px]" style={{background:"linear-gradient(135deg,#7C3AED,#6D28D9)"}}>🚀 Post</button>
                      )}
                      {!["Rejected"].includes(sel.status)&&(
                        <button onClick={()=>setStatus(sel.id,"Rejected")} disabled={saving}
                          className="py-2 px-3 rounded-xl text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100">✕ Reject</button>
                      )}
                      {sel.status==="Rejected"&&(
                        <button onClick={()=>setStatus(sel.id,"Draft")} disabled={saving}
                          className="flex-1 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700">↩ Restore</button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>setEditing(true)} className="flex-1 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200">✏️ Edit</button>
                      <button onClick={()=>toggleWinner(sel.id, sel.is_winner)} disabled={saving}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${sel.is_winner?"bg-yellow-100 text-yellow-700 hover:bg-yellow-200":"bg-gray-100 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600"}`}>
                        {sel.is_winner?"🏆 Winner":"☆ Mark Winner"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!sel && (
            <div className="hidden md:flex flex-1 items-center justify-center bg-[#F0F4FF]">
              <div className="text-center text-gray-300">
                <div className="text-5xl mb-3">👆</div>
                <div className="text-sm font-semibold">Select a draft to view everything</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS TAB ────────────────────────────────────────────────── */}
      {tab==="📊 Analytics" && (
        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Total Reach",totalReach.toLocaleString(),"#0099FF"],
              ["Avg Engagement",avgEng+"%","#059669"],
              ["Posts Tracked",realPerfs.length,"#7C3AED"],
              ["Top Platform", (()=>{ const m={}; realPerfs.forEach(p=>{m[p.platform]=(m[p.platform]||0)+1;}); return Object.entries(m).sort((a,b)=>b[1]-a[1])[0]?.[0]||"—"; })(), "#EA580C"],
            ].map(([l,v,c])=>(
              <div key={l} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
                <div className="text-2xl font-black" style={{color:c}}>{v}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{l}</div>
              </div>
            ))}
          </div>

          {/* Pillar performance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <div className="font-black text-gray-800 text-sm">Performance by Pillar</div>
            </div>
            {Object.entries(PILLAR).map(([p,c])=>{
              const ds = drafts.filter(d=>d.pillar===p);
              const ps2 = realPerfs.filter(pf=>ds.find(d=>d.id===pf.content_draft_id));
              const eng = ps2.length ? (ps2.reduce((s,x)=>s+(Number(x.engagement_rate)||0),0)/ps2.length).toFixed(1) : "—";
              const reach = ps2.reduce((s,x)=>s+(Number(x.reach)||0),0);
              return (
                <div key={p} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-lg">{c.emoji}</span>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-700">{p}</div>
                    <div className="text-[10px] text-gray-400">{ds.length} drafts · {ps2.length} tracked</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black" style={{color:c.color}}>{eng}%</div>
                    <div className="text-[10px] text-gray-400">{reach>0?reach.toLocaleString()+" reach":"no data"}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top performers */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <div className="font-black text-gray-800 text-sm">Top Performing Posts</div>
            </div>
            {realPerfs.sort((a,b)=>(Number(b.engagement_rate)||0)-(Number(a.engagement_rate)||0)).slice(0,8).map(p=>{
              const d = drafts.find(dd=>dd.id===p.content_draft_id);
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-base">{PLAT[p.platform]?.icon||"📊"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-700 truncate">{d?.title||p.content_title||"Post"}</div>
                    <div className="text-[10px] text-gray-400 capitalize">{p.platform} · {Number(p.reach||0).toLocaleString()} reach</div>
                  </div>
                  <div className="text-sm font-black text-green-600">{Number(p.engagement_rate||0).toFixed(1)}%</div>
                </div>
              );
            })}
            {realPerfs.length===0&&<div className="p-6 text-center text-gray-300 text-sm">No performance data yet</div>}
          </div>
        </div>
      )}

      {/* ── IDEAS TAB ─────────────────────────────────────────────────────── */}
      {tab==="💡 Ideas" && (
        <div className="p-4 space-y-3 max-w-2xl mx-auto">
          <div className="text-xs text-gray-400 font-semibold">{ideas.length} content ideas in pipeline</div>
          {ideas.length===0&&<div className="text-center text-gray-300 py-8 text-sm">No ideas yet</div>}
          {ideas.sort((a,b)=>(Number(b.predicted_score)||0)-(Number(a.predicted_score)||0)).map(idea=>(
            <div key={idea.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <PillarPill p={idea.pillar}/>
                    {idea.status&&<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${idea.status==="Selected"?"bg-green-100 text-green-700":idea.status==="Converted"?"bg-blue-100 text-blue-700":"bg-gray-100 text-gray-500"}`}>{idea.status}</span>}
                    {idea.seasonal_relevance&&<span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold">🌸 {idea.seasonal_relevance}</span>}
                  </div>
                  <div className="font-bold text-gray-900 text-sm">{idea.idea_title}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">👤 {idea.audience||"—"} · 📐 {idea.format_suggestion||"—"}</div>
                </div>
                {idea.predicted_score!=null&&(
                  <div className="text-center flex-shrink-0">
                    <div className={`text-lg font-black ${Number(idea.predicted_score)>=7.5?"text-green-600":Number(idea.predicted_score)>=6?"text-yellow-500":"text-red-500"}`}>{Number(idea.predicted_score).toFixed(1)}</div>
                    <div className="text-[9px] text-gray-400">Predicted</div>
                  </div>
                )}
              </div>
              {idea.concept&&<div className="text-xs text-gray-600 leading-relaxed mb-2">{idea.concept}</div>}
              {idea.hook_options&&<div className="text-xs text-blue-600 italic bg-blue-50 rounded-lg px-3 py-2 mb-2">"{idea.hook_options}"</div>}
              {/* Platform scores */}
              {(idea.platform_facebook_score||idea.platform_instagram_score||idea.platform_linkedin_score)&&(
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[["fb",idea.platform_facebook_score,"👥"],["ig",idea.platform_instagram_score,"📸"],["li",idea.platform_linkedin_score,"💼"],["tt",idea.platform_tiktok_score,"🎵"],["x",idea.platform_x_score,"🐦"],["pi",idea.platform_pinterest_score,"📌"]].filter(([,v])=>v!=null).map(([k,v,ic])=>(
                    <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">{ic} {Number(v).toFixed(1)}</span>
                  ))}
                  {idea.best_platform&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">Best: {idea.best_platform}</span>}
                </div>
              )}
              {idea.selection_reasoning&&<div className="text-[10px] text-gray-400 mt-2 italic">{idea.selection_reasoning}</div>}
            </div>
          ))}
        </div>
      )}

      {/* ── WINNER DNA TAB ───────────────────────────────────────────────── */}
      {tab==="🧬 Winner DNA" && (
        <div className="p-4 space-y-3 max-w-2xl mx-auto">
          <div className="text-xs text-gray-400 font-semibold">{dna.length} winner patterns documented</div>
          {dna.length===0&&<div className="text-center text-gray-300 py-8 text-sm">No winner DNA yet — post content and track performance!</div>}
          {dna.sort((a,b)=>(Number(b.avg_score)||0)-(Number(a.avg_score)||0)).map(w=>(
            <div key={w.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-black text-gray-900 text-sm">{w.title}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{PLAT[w.winning_platform]?.icon||"📊"} {w.winning_platform} · {PILLAR[w.winning_pillar]?.emoji||""} {w.winning_pillar} · 👤 {w.winning_audience}</div>
                </div>
                <div className="text-center flex-shrink-0">
                  <div className="text-2xl font-black text-green-600">{Number(w.avg_score||0).toFixed(1)}</div>
                  <div className="text-[9px] text-gray-400">Score</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  ["Hook Style", w.winning_hook_style],
                  ["Format", w.winning_format],
                  ["CTA Style", w.winning_cta_style],
                  ["Emotion", w.emotional_trigger],
                  ["Reused", w.reuse_count!=null?w.reuse_count+"x":"—"],
                  ["Total Reach", w.total_reach?Number(w.total_reach).toLocaleString():"—"],
                ].map(([l,v])=>v&&(
                  <div key={l} className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                    <div className="text-[9px] text-gray-400 font-bold uppercase">{l}</div>
                    <div className="text-xs text-gray-700 font-semibold mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
              {w.key_phrases&&<div className="text-[10px] text-blue-600 italic bg-blue-50 rounded-lg px-3 py-2 mb-2">🗝 {w.key_phrases}</div>}
              {w.pattern_notes&&<div className="text-xs text-gray-500 leading-relaxed">{w.pattern_notes}</div>}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
