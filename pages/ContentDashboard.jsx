import { useState, useEffect, useCallback } from "react";
import { ContentDraft, PostPerformance, ContentIdea, WinnerDNA } from "@/api/entities";

// ── Constants ──────────────────────────────────────────────────────────────
const PILLARS = ["Convenience","Trust","Transformation","Recruitment","Local","Proof","Seniors","Spring"];
const STATUSES = ["All","Approved","Posted","Draft","Rejected"];
const PLATFORMS = ["facebook","instagram","linkedin","tiktok","pinterest","x"];
const PLAT_FIELD = { facebook:"platform_facebook", instagram:"platform_instagram", linkedin:"platform_linkedin", tiktok:"platform_tiktok", pinterest:"platform_pinterest", x:"platform_x" };
const PLAT_ICON = { facebook:"👥", instagram:"📸", linkedin:"💼", tiktok:"🎵", pinterest:"📌", x:"𝕏" };
const PLAT_LABEL = { facebook:"Facebook", instagram:"Instagram", linkedin:"LinkedIn", tiktok:"TikTok", pinterest:"Pinterest", x:"X/Twitter" };

const PILLAR_COLOR = {
  Convenience:"bg-blue-50 text-blue-700 border-blue-100",
  Trust:"bg-emerald-50 text-emerald-700 border-emerald-100",
  Transformation:"bg-violet-50 text-violet-700 border-violet-100",
  Recruitment:"bg-orange-50 text-orange-700 border-orange-100",
  Local:"bg-teal-50 text-teal-700 border-teal-100",
  Proof:"bg-pink-50 text-pink-700 border-pink-100",
  Seniors:"bg-amber-50 text-amber-700 border-amber-100",
  Spring:"bg-lime-50 text-lime-700 border-lime-100",
};
const STATUS_COLOR = {
  Draft:"bg-gray-100 text-gray-600",
  "Pending Approval":"bg-yellow-100 text-yellow-700",
  Approved:"bg-emerald-100 text-emerald-700",
  Rejected:"bg-red-100 text-red-600",
  Posted:"bg-purple-100 text-purple-700",
  Scheduled:"bg-blue-100 text-blue-700",
};
const PERF_COLOR = { Winner:"bg-yellow-100 text-yellow-700 border-yellow-200", Good:"bg-green-100 text-green-700 border-green-200", Average:"bg-blue-100 text-blue-600 border-blue-200", Underperformer:"bg-red-100 text-red-600 border-red-200", Pending:"bg-gray-100 text-gray-500 border-gray-200" };

const TABS = ["📋 Queue","📊 Analytics","🎬 Videos","💡 Ideas","🧬 Winner DNA"];

function avg(...vals) {
  const n = vals.filter(v => typeof v === "number" && !isNaN(v));
  return n.length ? n.reduce((a,b)=>a+b,0)/n.length : null;
}
function fmt(n, d=1) { return (typeof n==="number"&&!isNaN(n)) ? n.toFixed(d) : "—"; }

function ScoreDot({ score }) {
  if (score == null || isNaN(Number(score))) return <span className="text-gray-300 font-bold">—</span>;
  const s = Number(score);
  const cls = s >= 7.5 ? "text-emerald-600" : s >= 6 ? "text-yellow-600" : "text-red-500";
  return <span className={`font-black text-sm ${cls}`}>{s.toFixed(1)}</span>;
}

function Pill({ label, style, className="" }) {
  if (!label) return null;
  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap border ${style} ${className}`}>{label}</span>;
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold transition-all ${toast.type==="error"?"bg-red-500":"bg-gray-900"}`}>
      {toast.msg}
    </div>
  );
}

function StatCard({ icon, value, label, sub, color="bg-white" }) {
  return (
    <div className={`${color} rounded-2xl border border-gray-100 p-4 flex flex-col gap-1 shadow-sm`}>
      <span className="text-xl">{icon}</span>
      <span className="text-3xl font-black text-gray-900">{value}</span>
      <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ContentDashboard() {
  const [tab, setTab] = useState("📋 Queue");
  const [drafts, setDrafts] = useState([]);
  const [perfs, setPerfs] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [dna, setDna] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [pillarFilter, setPillarFilter] = useState("All");
  const [campaignFilter, setCampaignFilter] = useState("All");
  const [search, setSearch] = useState("");

  // selected draft
  const [selected, setSelected] = useState(null);
  const [activeTab2, setActiveTab2] = useState("facebook");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [pubPlats, setPubPlats] = useState([]);
  const [showPublisher, setShowPublisher] = useState(false);
  const [showPerfModal, setShowPerfModal] = useState(false);
  const [perfEntry, setPerfEntry] = useState({});

  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const [d, p, i, w] = await Promise.all([
        ContentDraft.list("-created_date"),
        PostPerformance.list("-posted_at"),
        ContentIdea.list("-predicted_score"),
        WinnerDNA.list("-avg_score"),
      ]);
      setDrafts(Array.isArray(d)?d:[]);
      setPerfs(Array.isArray(p)?p:[]);
      setIdeas(Array.isArray(i)?i:[]);
      setDna(Array.isArray(w)?w:[]);
    } catch(e) { setErr(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg, type="success") {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3500);
  }

  // ── Derived stats ──
  const total = drafts.length;
  const approved = drafts.filter(d=>d.status==="Approved").length;
  const posted = drafts.filter(d=>d.status==="Posted").length;
  const videosQueued = drafts.filter(d=>d.heygen_status==="Queued").length;
  const videosDone = drafts.filter(d=>d.heygen_status==="Completed").length;
  const hasImage = drafts.filter(d=>d.image_url||d.video_cdn_url).length;
  const winners = perfs.filter(p=>p.performance_label==="Winner").length;
  const spring = drafts.filter(d=>d.campaign_tag?.includes("Spring")||d.week_tag?.includes("Spring")).length;
  const seniors = drafts.filter(d=>d.audience?.includes("Senior")||d.audience?.includes("Adult Children")||d.campaign_tag?.includes("Senior")).length;

  const pillarCounts = drafts.reduce((a,d)=>{ if(d.pillar)a[d.pillar]=(a[d.pillar]||0)+1; return a; },{});
  const statusCounts = drafts.reduce((a,d)=>{ a[d.status]=(a[d.status]||0)+1; return a; },{});
  const campaigns = ["All", ...new Set(drafts.map(d=>d.campaign_tag).filter(Boolean))];
  const totalReach = perfs.reduce((s,p)=>s+(p.reach||0),0);
  const avgEngRate = perfs.length ? fmt(perfs.reduce((s,p)=>s+(p.engagement_rate||0),0)/perfs.length) : "—";

  // ── Filtered queue ──
  const filtered = drafts.filter(d => {
    if (statusFilter!=="All" && d.status!==statusFilter) return false;
    if (pillarFilter!=="All" && d.pillar!==pillarFilter) return false;
    if (campaignFilter!=="All" && d.campaign_tag!==campaignFilter) return false;
    if (search && !d.title?.toLowerCase().includes(search.toLowerCase()) && !d.hook?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selPerfs = selected ? perfs.filter(p=>p.content_draft_id===selected.id) : [];

  // ── Actions ──
  async function setStatus(id, status) {
    setSaving(true);
    try {
      await ContentDraft.update(id, {status});
      setDrafts(prev => prev.map(d=>d.id===id?{...d,status}:d));
      if (selected?.id===id) setSelected(p=>({...p,status}));
      showToast(status==="Approved"?"✅ Approved!":"→ "+status);
    } catch(e) { showToast("Error: "+e.message,"error"); }
    setSaving(false);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      await ContentDraft.update(selected.id, editData);
      setDrafts(prev=>prev.map(d=>d.id===selected.id?{...d,...editData}:d));
      setSelected(p=>({...p,...editData}));
      setEditing(false);
      showToast("💾 Saved!");
    } catch(e) { showToast("Error: "+e.message,"error"); }
    setSaving(false);
  }

  async function postNow() {
    if (!pubPlats.length){showToast("Select at least one platform","error");return;}
    setPosting(true);
    try {
      const res = await fetch("/functions/postToSocials",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({draft_id:selected.id,platforms:pubPlats})});
      const data = await res.json();
      if (data.ok) {
        showToast("🚀 Posted to: "+(data.posted_to||[]).join(", "));
        await load(); setShowPublisher(false);
        setSelected(p=>({...p,status:"Posted"}));
      } else showToast(data.error||"Post failed","error");
    } catch(e) { showToast("Error: "+e.message,"error"); }
    setPosting(false);
  }

  async function savePerf() {
    if (!perfEntry.platform){showToast("Select a platform","error");return;}
    setSaving(true);
    try {
      const r=Number(perfEntry.reach)||0, l=Number(perfEntry.likes)||0, c=Number(perfEntry.comments)||0, s=Number(perfEntry.shares)||0, sv=Number(perfEntry.saves)||0, cl=Number(perfEntry.clicks)||0;
      const eng = r>0?((l+c+s)/r*100).toFixed(2):0;
      const rawScore = r>0?Math.min(10,parseFloat(((l+c*2+s*3+sv*2+cl*2)/Math.max(r,1)*100).toFixed(1))):0;
      const score = rawScore>=8?10:rawScore>=5?9:rawScore>=3?8:rawScore>=2?7:rawScore>=1.5?6:rawScore>=1?5:rawScore>=0.5?4:rawScore>=0.2?3:2;
      const label = score>=8?"Winner":score>=6?"Good":score>=4?"Average":"Underperformer";
      await PostPerformance.create({content_draft_id:selected.id,content_title:selected.title||"",platform:perfEntry.platform,pillar:selected.pillar||"",audience:selected.audience||"",hook:selected.hook||"",week_tag:selected.week_tag||"",reach:r,likes:l,comments:c,shares:s,saves:sv,clicks:cl,engagement_rate:parseFloat(eng),performance_score:score,performance_label:label,analyzed:true,posted_at:new Date().toISOString()});
      if (label==="Winner") await ContentDraft.update(selected.id,{is_winner:true,avg_performance_score:score,top_performing_platform:perfEntry.platform});
      await load(); setShowPerfModal(false); setPerfEntry({});
      showToast("📊 Logged! "+label);
    } catch(e) { showToast("Error: "+e.message,"error"); }
    setSaving(false);
  }

  // ── Loading / Error ──
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500 font-semibold">Loading Content Engine...</p>
      </div>
    </div>
  );
  if (err) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-sm px-6">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="font-bold text-gray-800 mb-1">Load error</p>
        <p className="text-gray-400 text-sm mb-4">{err}</p>
        <button onClick={load} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast toast={toast} />

      {/* ── HEADER ── */}
      <div style={{background:"linear-gradient(135deg,#0099FF 0%,#0055CC 100%)"}} className="text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="font-black text-xl" style={{color:"#0099FF"}}>P</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">PureTask Content Engine</h1>
              <p className="text-blue-200 text-xs mt-0.5">Fully Automated · <a href="https://www.puretask.co" target="_blank" rel="noreferrer" className="text-white underline font-bold">www.puretask.co</a></p>
            </div>
            <div className="ml-auto flex items-center gap-2 bg-white/20 rounded-xl px-3 py-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
              <span className="text-xs font-bold">LIVE</span>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              ["📝",total,"Total"],
              ["✅",approved,"Approved"],
              ["📤",posted,"Posted"],
              ["🖼️",hasImage,"Has Image"],
              ["🎬",videosQueued,"Vid Queued"],
              ["🏆",winners,"Winners"],
              ["🌸",spring,"Spring"],
              ["👴",seniors,"Seniors"],
            ].map(([icon,val,label])=>(
              <div key={label} className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <div className="text-lg">{icon}</div>
                <div className="text-2xl font-black">{val}</div>
                <div className="text-blue-200 text-xs font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-1 overflow-x-auto">
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`py-3 px-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${tab===t?"border-blue-500 text-blue-600":"border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t}
            </button>
          ))}
          <button onClick={load} className="ml-auto py-3 px-3 text-gray-400 hover:text-gray-600 text-sm">↻ Refresh</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* ══════════════════════════════════════════
            TAB: QUEUE
        ══════════════════════════════════════════ */}
        {tab==="📋 Queue" && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT — list */}
            <div className="flex-1 min-w-0">
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search drafts..." className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm bg-white focus:outline-none">
                  {STATUSES.map(s=><option key={s}>{s}</option>)}
                </select>
                <select value={pillarFilter} onChange={e=>setPillarFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm bg-white focus:outline-none">
                  <option>All</option>
                  {PILLARS.map(p=><option key={p}>{p}</option>)}
                </select>
                <select value={campaignFilter} onChange={e=>setCampaignFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm bg-white focus:outline-none">
                  {campaigns.map(c=><option key={c}>{c}</option>)}
                </select>
                <span className="text-xs text-gray-400 self-center ml-1">{filtered.length} drafts</span>
              </div>

              {/* Status breakdown pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(statusCounts).sort(([,a],[,b])=>b-a).map(([s,c])=>(
                  <button key={s} onClick={()=>setStatusFilter(statusFilter===s?"All":s)}
                    className={`text-xs px-3 py-1 rounded-full font-semibold border transition-all ${STATUS_COLOR[s]||"bg-gray-100 text-gray-600"} ${statusFilter===s?"ring-2 ring-offset-1 ring-blue-400":""}`}>
                    {s} ({c})
                  </button>
                ))}
              </div>

              {/* Draft cards */}
              <div className="space-y-2">
                {filtered.length===0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="font-medium">No drafts match your filters</p>
                  </div>
                )}
                {filtered.map(d => {
                  const score = avg(d.clarity_score, d.relatability_score, d.conversion_score);
                  const platforms = d.posted_platforms ? d.posted_platforms.split(",").filter(Boolean) : [];
                  const isSelected = selected?.id===d.id;
                  return (
                    <div key={d.id} onClick={()=>{setSelected(d);setEditing(false);setActiveTab2("facebook");}}
                      className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md ${isSelected?"border-blue-400 shadow-md ring-1 ring-blue-200":"border-gray-100"}`}>
                      <div className="flex items-start gap-3">
                        {/* image thumb */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          {d.image_url || d.video_cdn_url
                            ? <img src={d.image_url||d.video_cdn_url} alt="" className="w-full h-full object-cover"/>
                            : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🖼️</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[d.status]||"bg-gray-100 text-gray-600"}`}>{d.status}</span>
                            {d.pillar && <Pill label={d.pillar} style={PILLAR_COLOR[d.pillar]||"bg-gray-100 text-gray-600 border-gray-200"}/>}
                            {d.city && <Pill label={`📍${d.city}`} style="bg-teal-50 text-teal-700 border-teal-100"/>}
                            {d.is_winner && <span className="text-xs">🏆</span>}
                          </div>
                          <p className="font-semibold text-gray-800 text-sm truncate">{d.title}</p>
                          {d.hook && <p className="text-xs text-gray-400 truncate mt-0.5">"{d.hook}"</p>}
                          <div className="flex items-center gap-3 mt-1.5">
                            <ScoreDot score={score}/>
                            {platforms.length>0 && (
                              <span className="text-xs text-gray-400">{platforms.map(p=>PLAT_ICON[p]||"📱").join("")} posted</span>
                            )}
                            {d.heygen_status && d.heygen_status!=="None" && (
                              <span className="text-xs text-purple-500">🎬 {d.heygen_status}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT — detail panel */}
            {selected && (
              <div className="lg:w-[440px] flex-shrink-0">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm sticky top-20 overflow-hidden">
                  {/* header */}
                  <div style={{background:"linear-gradient(135deg,#0099FF,#0055CC)"}} className="text-white p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h2 className="font-black text-lg leading-tight">{selected.title}</h2>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <Pill label={selected.status} style={STATUS_COLOR[selected.status]||"bg-white/20 text-white border-white/30"}/>
                          {selected.pillar && <Pill label={selected.pillar} style="bg-white/20 text-white border-white/30"/>}
                          {selected.city && <Pill label={"📍"+selected.city} style="bg-white/20 text-white border-white/30"/>}
                        </div>
                      </div>
                      <button onClick={()=>setSelected(null)} className="text-white/70 hover:text-white text-xl leading-none">×</button>
                    </div>
                    {/* score row */}
                    <div className="grid grid-cols-4 gap-2 bg-white/10 rounded-xl p-3">
                      {[["Clarity",selected.clarity_score],["Relatable",selected.relatability_score],["Convert",selected.conversion_score],["Avg",avg(selected.clarity_score,selected.relatability_score,selected.conversion_score)]].map(([l,v])=>(
                        <div key={l} className="text-center">
                          <div className="text-white font-black text-lg">{v!=null?Number(v).toFixed(1):"—"}</div>
                          <div className="text-blue-200 text-xs">{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* image preview */}
                  {(selected.image_url||selected.video_cdn_url) && (
                    <div className="relative">
                      <img src={selected.image_url||selected.video_cdn_url} alt="" className="w-full h-48 object-cover"/>
                      {selected.video_cdn_url && <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">🎬 Video</span>}
                    </div>
                  )}
                  {!selected.image_url && !selected.video_cdn_url && (
                    <div className="bg-gray-50 h-24 flex items-center justify-center border-b border-gray-100">
                      <span className="text-gray-300 text-sm">⏳ Image generating...</span>
                    </div>
                  )}

                  <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
                    {/* platform copy tabs */}
                    <div>
                      <div className="flex gap-1 flex-wrap mb-2">
                        {PLATFORMS.map(p=>(
                          <button key={p} onClick={()=>setActiveTab2(p)}
                            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${activeTab2===p?"bg-blue-500 text-white":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                            {PLAT_ICON[p]} {PLAT_LABEL[p].split("/")[0]}
                          </button>
                        ))}
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 leading-relaxed min-h-[80px] whitespace-pre-wrap">
                        {editing
                          ? <textarea value={editData[PLAT_FIELD[activeTab2]]||selected[PLAT_FIELD[activeTab2]]||""} onChange={e=>setEditData(p=>({...p,[PLAT_FIELD[activeTab2]]:e.target.value}))} className="w-full bg-transparent resize-none focus:outline-none text-sm leading-relaxed" rows={6}/>
                          : (selected[PLAT_FIELD[activeTab2]] || <span className="text-gray-300 italic">No copy for this platform</span>)
                        }
                      </div>
                    </div>

                    {/* hook */}
                    {selected.hook && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Hook</p>
                        <p className="text-sm text-gray-700 italic">"{selected.hook}"</p>
                      </div>
                    )}

                    {/* posted platforms */}
                    {selected.posted_platforms && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Posted To</p>
                        <div className="flex flex-wrap gap-1">
                          {selected.posted_platforms.split(",").filter(Boolean).map(p=>(
                            <span key={p} className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full font-medium">
                              {PLAT_ICON[p]||"📱"} {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* performance */}
                    {selPerfs.length>0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Performance</p>
                        <div className="space-y-1.5">
                          {selPerfs.map(p=>(
                            <div key={p.id} className={`flex items-center justify-between rounded-xl px-3 py-2 border text-xs ${PERF_COLOR[p.performance_label]||"bg-gray-50 border-gray-100"}`}>
                              <span className="font-semibold">{p.platform}</span>
                              <span>{p.performance_label}</span>
                              <span>Score: {p.performance_score||"—"}</span>
                              <span>{p.reach?p.reach.toLocaleString()+" reach":"—"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* scripts */}
                    {(selected.script_30sec||selected.script_15sec) && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Video Scripts</p>
                        {selected.script_15sec && <div className="text-xs text-gray-600 bg-purple-50 rounded-lg p-2 mb-1"><span className="font-bold text-purple-600">15s: </span>{selected.script_15sec.slice(0,120)}...</div>}
                        {selected.script_30sec && <div className="text-xs text-gray-600 bg-purple-50 rounded-lg p-2"><span className="font-bold text-purple-600">30s: </span>{selected.script_30sec.slice(0,120)}...</div>}
                      </div>
                    )}

                    {/* CTAs */}
                    {(selected.cta_1||selected.cta_2||selected.cta_3) && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CTAs</p>
                        <div className="space-y-1 text-xs text-gray-600">
                          {[selected.cta_1,selected.cta_2,selected.cta_3].filter(Boolean).map((c,i)=>(
                            <div key={i} className="bg-blue-50 rounded-lg px-2 py-1">{c}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* editor notes */}
                    {selected.editor_notes && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                        <p className="text-xs text-gray-500 italic">{selected.editor_notes}</p>
                      </div>
                    )}
                  </div>

                  {/* actions */}
                  <div className="border-t border-gray-100 p-4 flex flex-wrap gap-2">
                    {selected.status==="Approved" && (
                      <>
                        <button onClick={()=>setShowPublisher(true)} className="flex-1 bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors">🚀 Post Now</button>
                        <button onClick={()=>setStatus(selected.id,"Rejected")} disabled={saving} className="bg-red-50 text-red-600 text-xs font-bold px-3 py-2 rounded-xl hover:bg-red-100 transition-colors">✕ Reject</button>
                      </>
                    )}
                    {selected.status==="Draft" && (
                      <button onClick={()=>setStatus(selected.id,"Approved")} disabled={saving} className="flex-1 bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-emerald-600 transition-colors">✅ Approve</button>
                    )}
                    {selected.status==="Posted" && (
                      <button onClick={()=>{setShowPerfModal(true);setPerfEntry({});}} className="flex-1 bg-orange-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-orange-600 transition-colors">📊 Log Performance</button>
                    )}
                    <button onClick={()=>{setEditing(!editing);setEditData({});}} className={`text-xs font-bold px-3 py-2 rounded-xl transition-colors ${editing?"bg-yellow-400 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{editing?"✏️ Editing":"✏️ Edit"}</button>
                    {editing && <button onClick={saveEdit} disabled={saving} className="bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-emerald-600">💾 Save</button>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: ANALYTICS
        ══════════════════════════════════════════ */}
        {tab==="📊 Analytics" && (
          <div className="space-y-6">
            {/* top stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon="📡" value={totalReach.toLocaleString()} label="Total Reach" sub="across all platforms"/>
              <StatCard icon="💬" value={`${avgEngRate}%`} label="Avg Engagement" sub="likes + comments + shares"/>
              <StatCard icon="🏆" value={winners} label="Winner Posts" sub="score ≥ 8.0"/>
              <StatCard icon="📊" value={perfs.length} label="Posts Tracked" sub="in PostPerformance"/>
            </div>

            {/* pillar breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">🎯 Content by Pillar</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PILLARS.map(p=>(
                  <div key={p} className={`rounded-xl border p-3 ${PILLAR_COLOR[p]||"bg-gray-50 border-gray-100 text-gray-600"}`}>
                    <div className="text-2xl font-black">{pillarCounts[p]||0}</div>
                    <div className="text-xs font-bold mt-0.5">{p}</div>
                    <div className="text-xs opacity-60 mt-0.5">
                      {drafts.filter(d=>d.pillar===p&&d.status==="Posted").length} posted
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* platform performance */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">📱 Platform Performance</h3>
              {perfs.length===0
                ? <p className="text-gray-400 text-sm text-center py-6">No performance data yet — posts need to go live first, then log or auto-pull analytics.</p>
                : (
                  <div className="space-y-2">
                    {Object.entries(
                      perfs.reduce((a,p)=>{ if(!p.platform)return a; if(!a[p.platform])a[p.platform]={total:0,count:0,winners:0}; a[p.platform].total+=(p.performance_score||0); a[p.platform].count+=1; if(p.performance_label==="Winner")a[p.platform].winners+=1; return a; },{})
                    ).sort(([,a],[,b])=>(b.total/b.count)-(a.total/a.count)).map(([plat,stats])=>(
                      <div key={plat} className="flex items-center gap-3">
                        <span className="w-24 text-sm font-semibold text-gray-700 flex-shrink-0">{plat}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className="h-2 rounded-full bg-blue-500" style={{width:`${Math.min(100,(stats.total/stats.count)*10)}%`}}/>
                        </div>
                        <span className="text-xs text-gray-500 w-20 text-right">{fmt(stats.total/stats.count)} avg · {stats.winners}🏆</span>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>

            {/* individual post performance */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">📋 All Performance Records</h3>
              {perfs.length===0
                ? <p className="text-gray-400 text-sm text-center py-6">No records yet. Posts will appear here once analytics are logged.</p>
                : (
                  <div className="space-y-2">
                    {perfs.slice(0,30).map(p=>(
                      <div key={p.id} className={`flex items-center justify-between rounded-xl px-3 py-2 border text-xs ${PERF_COLOR[p.performance_label]||"bg-gray-50 border-gray-100"}`}>
                        <span className="font-semibold truncate max-w-[160px]">{p.content_title||"—"}</span>
                        <span className="text-gray-500">{p.platform}</span>
                        <span className="font-bold">{p.performance_label}</span>
                        <span>{p.performance_score||"—"}/10</span>
                        <span className="hidden md:block">{p.reach?p.reach.toLocaleString()+" reach":"—"}</span>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: VIDEOS
        ══════════════════════════════════════════ */}
        {tab==="🎬 Videos" && (
          <div className="space-y-6">
            {/* stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon="⏳" value={videosQueued} label="Queued" sub="awaiting generation"/>
              <StatCard icon="✅" value={videosDone} label="Completed" sub="ready to post"/>
              <StatCard icon="📝" value={drafts.filter(d=>d.script_30sec||d.script_15sec).length} label="Scripts Ready" sub="30s or 15s"/>
              <StatCard icon="🎵" value={drafts.filter(d=>d.heygen_status==="Generating").length} label="Generating" sub="in progress"/>
            </div>

            {/* HeyGen brand settings */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">🎬 HeyGen Brand Defaults</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                {[
                  ["🎤 Voice","addison carter · PXNEIUJiwgmsriDe9m6P"],
                  ["🧑 Avatar","Abigail_expressive_2024112501"],
                  ["🎨 Colors","#0099FF · #FFFFFF · #1A1A2E"],
                  ["📋 Subtitles","Always ON"],
                  ["🎬 Intro Card","Always · Logo + Pillar tagline"],
                  ["🎬 Outro Card","Always · Logo + https://www.puretask.co + CTA"],
                ].map(([k,v])=>(
                  <div key={k} className="bg-gray-50 rounded-xl p-3">
                    <div className="font-semibold text-gray-700 text-xs mb-0.5">{k}</div>
                    <div className="text-gray-500 text-xs">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* video queue */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">🗂️ Video Queue</h3>
              <div className="space-y-2">
                {drafts.filter(d=>d.heygen_status&&d.heygen_status!=="None").length===0
                  ? <p className="text-gray-400 text-sm text-center py-6">No videos queued yet.</p>
                  : drafts.filter(d=>d.heygen_status&&d.heygen_status!=="None").map(d=>(
                    <div key={d.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{d.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {d.pillar && <Pill label={d.pillar} style={PILLAR_COLOR[d.pillar]||"bg-gray-100 text-gray-600 border-gray-200"}/>}
                          <span className="text-xs text-gray-400">{d.audience}</span>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full font-bold ${d.heygen_status==="Completed"?"bg-green-100 text-green-700":d.heygen_status==="Generating"?"bg-yellow-100 text-yellow-700":d.heygen_status==="Failed"?"bg-red-100 text-red-600":"bg-blue-100 text-blue-600"}`}>
                        {d.heygen_status}
                      </div>
                      {d.video_cdn_url && (
                        <a href={d.video_cdn_url} target="_blank" rel="noreferrer" className="text-xs bg-purple-500 text-white px-3 py-1 rounded-full font-bold hover:bg-purple-600">▶ Watch</a>
                      )}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: IDEAS
        ══════════════════════════════════════════ */}
        {tab==="💡 Ideas" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
              <StatCard icon="💡" value={ideas.length} label="Total Ideas"/>
              <StatCard icon="✅" value={ideas.filter(i=>i.status==="Selected").length} label="Selected"/>
              <StatCard icon="📝" value={ideas.filter(i=>i.status==="Converted to Draft").length} label="Converted"/>
            </div>
            {ideas.length===0
              ? <p className="text-gray-400 text-sm text-center py-12">No ideas yet — run the brainstorm generator.</p>
              : ideas.map(i=>(
                <div key={i.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${i.status==="Selected"?"bg-green-100 text-green-700":i.status==="Converted to Draft"?"bg-purple-100 text-purple-700":"bg-gray-100 text-gray-600"}`}>{i.status}</span>
                        {i.pillar && <Pill label={i.pillar} style={PILLAR_COLOR[i.pillar]||"bg-gray-100 text-gray-600 border-gray-200"}/>}
                        {i.audience && <span className="text-xs text-gray-400">{i.audience}</span>}
                      </div>
                      <p className="font-bold text-gray-800">{i.idea_title}</p>
                      {i.concept && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{i.concept}</p>}
                      {i.hook_options && <p className="text-xs text-blue-600 mt-1 italic">{i.hook_options.split("|")[0]?.trim()}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-2xl font-black ${i.predicted_score>=8.5?"text-emerald-600":i.predicted_score>=7.5?"text-yellow-600":"text-gray-400"}`}>{i.predicted_score||"—"}</div>
                      <div className="text-xs text-gray-400">predicted</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {["facebook","instagram","linkedin","tiktok","pinterest"].map(p=>{
                      const score = i[`platform_${p}_score`];
                      if (!score) return null;
                      return <span key={p} className="text-xs bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full text-gray-600">{PLAT_ICON[p]} {score}</span>;
                    })}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: WINNER DNA
        ══════════════════════════════════════════ */}
        {tab==="🧬 Winner DNA" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
              <StatCard icon="🧬" value={dna.length} label="DNA Patterns"/>
              <StatCard icon="🏆" value={perfs.filter(p=>p.performance_label==="Winner").length} label="Winner Posts"/>
              <StatCard icon="♻️" value={dna.reduce((s,d)=>s+(d.reuse_count||0),0)} label="Times Reused"/>
            </div>
            {dna.length===0
              ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                  <p className="text-3xl mb-3">🧬</p>
                  <p className="font-bold text-gray-700 mb-1">No Winner DNA yet</p>
                  <p className="text-gray-400 text-sm">Once posts go live and analytics are logged, winning patterns will be extracted here automatically.</p>
                </div>
              )
              : dna.map(w=>(
                <div key={w.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-black text-gray-800 text-lg">{w.title}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {w.winning_pillar && <Pill label={w.winning_pillar} style={PILLAR_COLOR[w.winning_pillar]||"bg-gray-100 text-gray-600 border-gray-200"}/>}
                        {w.winning_platform && <Pill label={w.winning_platform} style="bg-blue-50 text-blue-700 border-blue-100"/>}
                        {w.winning_format && <Pill label={w.winning_format} style="bg-purple-50 text-purple-700 border-purple-100"/>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-600">{w.avg_score||"—"}</div>
                      <div className="text-xs text-gray-400">avg score</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {w.winning_hook_style && <div className="bg-gray-50 rounded-xl p-2"><span className="font-bold text-gray-500">Hook Style: </span>{w.winning_hook_style}</div>}
                    {w.emotional_trigger && <div className="bg-gray-50 rounded-xl p-2"><span className="font-bold text-gray-500">Emotion: </span>{w.emotional_trigger}</div>}
                    {w.key_phrases && <div className="bg-gray-50 rounded-xl p-2 col-span-2"><span className="font-bold text-gray-500">Key Phrases: </span>{w.key_phrases}</div>}
                    {w.pattern_notes && <div className="bg-blue-50 rounded-xl p-2 col-span-2 text-blue-700"><span className="font-bold">Notes: </span>{w.pattern_notes}</div>}
                  </div>
                </div>
              ))
            }
          </div>
        )}

      </div>

      {/* ── PUBLISHER MODAL ── */}
      {showPublisher && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-black text-gray-800 text-xl mb-1">🚀 Post Now</h3>
            <p className="text-sm text-gray-500 mb-4">{selected.title}</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {["facebook","instagram","linkedin","tiktok","pinterest"].map(p=>(
                <label key={p} className={`flex items-center gap-2 border rounded-xl p-3 cursor-pointer transition-colors ${pubPlats.includes(p)?"border-blue-400 bg-blue-50":"border-gray-200 hover:bg-gray-50"}`}>
                  <input type="checkbox" checked={pubPlats.includes(p)} onChange={e=>setPubPlats(prev=>e.target.checked?[...prev,p]:prev.filter(x=>x!==p))} className="accent-blue-500"/>
                  <span className="text-sm font-semibold">{PLAT_ICON[p]} {PLAT_LABEL[p]}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setShowPublisher(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button onClick={postNow} disabled={posting||!pubPlats.length} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {posting?"Posting...":"🚀 Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PERFORMANCE MODAL ── */}
      {showPerfModal && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-black text-gray-800 text-xl mb-1">📊 Log Performance</h3>
            <p className="text-sm text-gray-500 mb-4">{selected.title}</p>
            <div className="space-y-3">
              <select value={perfEntry.platform||""} onChange={e=>setPerfEntry(p=>({...p,platform:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                <option value="">Select platform...</option>
                {["Facebook","Instagram","LinkedIn","TikTok","Pinterest","X"].map(p=><option key={p}>{p}</option>)}
              </select>
              {[["reach","Reach"],["likes","Likes"],["comments","Comments"],["shares","Shares"],["saves","Saves"],["clicks","Clicks"]].map(([k,l])=>(
                <input key={k} type="number" placeholder={l} value={perfEntry[k]||""} onChange={e=>setPerfEntry(p=>({...p,[k]:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"/>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowPerfModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button onClick={savePerf} disabled={saving} className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50">
                {saving?"Saving...":"📊 Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
