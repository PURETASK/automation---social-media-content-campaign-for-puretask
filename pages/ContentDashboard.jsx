import { useState, useEffect } from "react";
import { ContentDraft, PostPerformance, ContentIdea, MarketResearch, WinnerDNA } from "@/api/entities";

const ALL_PLATFORM_KEYS = ["platform_facebook","platform_instagram","platform_linkedin","platform_tiktok","platform_x","platform_pinterest","platform_threads","platform_youtube"];
const PL = { platform_x:"X/Twitter", platform_instagram:"Instagram", platform_facebook:"Facebook", platform_linkedin:"LinkedIn", platform_tiktok:"TikTok", platform_pinterest:"Pinterest", platform_threads:"Threads", platform_youtube:"YouTube" };
const PI = { platform_x:"𝕏", platform_instagram:"📸", platform_facebook:"👥", platform_linkedin:"💼", platform_tiktok:"🎵", platform_pinterest:"📌", platform_threads:"🧵", platform_youtube:"▶️" };
const AYRSHARE_PLATFORMS = ["Facebook","Instagram","LinkedIn","TikTok","Pinterest","Threads"];
const STATUS_STYLE = { Draft:"bg-gray-100 text-gray-600", "Pending Approval":"bg-yellow-100 text-yellow-700", Approved:"bg-green-100 text-green-700", Rejected:"bg-red-100 text-red-600", Scheduled:"bg-blue-100 text-blue-700", Posted:"bg-purple-100 text-purple-700" };
const PILLAR_STYLE = { Convenience:"bg-blue-50 text-blue-600", Trust:"bg-green-50 text-green-600", Transformation:"bg-violet-50 text-violet-600", Recruitment:"bg-orange-50 text-orange-600", Local:"bg-teal-50 text-teal-600", Proof:"bg-pink-50 text-pink-600" };
const PERF_STYLE = { Winner:"bg-yellow-100 text-yellow-700", Good:"bg-green-100 text-green-700", Average:"bg-blue-100 text-blue-600", Underperformer:"bg-red-100 text-red-600", Pending:"bg-gray-100 text-gray-500" };
const HEYGEN_STYLE = { None:"bg-gray-100 text-gray-400", Queued:"bg-blue-100 text-blue-600", Generating:"bg-yellow-100 text-yellow-700", Completed:"bg-green-100 text-green-700", Failed:"bg-red-100 text-red-600" };
const RESEARCH_STYLE = { "Trending Topic":"bg-rose-50 text-rose-600","Competitor Intel":"bg-amber-50 text-amber-600","Audience Pain Point":"bg-red-50 text-red-600","Seasonal Trend":"bg-emerald-50 text-emerald-600","Industry News":"bg-sky-50 text-sky-600","Platform Algorithm Change":"bg-indigo-50 text-indigo-600","Viral Format":"bg-fuchsia-50 text-fuchsia-600" };
const IDEA_STYLE = { Brainstormed:"bg-gray-100 text-gray-600", Selected:"bg-green-100 text-green-700", Rejected:"bg-red-100 text-red-600", "Converted to Draft":"bg-purple-100 text-purple-700" };
const TABS = ["📋 Queue","🎬 HeyGen","🔬 Research","💡 Ideas","📊 Analytics","🧬 Winner DNA"];

function safeAvg(...vals) {
  const nums = vals.filter(v => typeof v === "number" && !isNaN(v));
  return nums.length ? nums.reduce((a,b) => a+b, 0) / nums.length : null;
}
function fmt(n) { return (typeof n === "number" && !isNaN(n)) ? n.toFixed(1) : "—"; }
function ScoreBadge({ score }) {
  if (score === null || score === undefined || isNaN(Number(score))) return <span className="text-gray-300 font-bold text-base">—</span>;
  const s = Number(score);
  const color = s >= 8 ? "text-green-600" : s >= 6 ? "text-yellow-600" : "text-red-500";
  return <span className={`font-bold text-base ${color}`}>{s.toFixed(1)}</span>;
}
function Pill({ label, style }) {
  if (!label) return null;
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${style}`}>{label}</span>;
}
function Toast({ toast }) {
  if (!toast) return null;
  return <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 ${toast.type==="error"?"bg-red-500":"bg-gray-900"} text-white px-5 py-3 rounded-xl shadow-2xl z-50 text-sm font-medium`}>{toast.msg}</div>;
}

export default function ContentDashboard() {
  const [tab, setTab] = useState("📋 Queue");
  const [drafts, setDrafts] = useState([]);
  const [perfs, setPerfs] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [research, setResearch] = useState([]);
  const [dna, setDna] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [pillarFilter, setPillarFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [activePlatform, setActivePlatform] = useState("platform_facebook");
  const [toast, setToast] = useState(null);
  const [showPublisher, setShowPublisher] = useState(false);
  const [pubPlatforms, setPubPlatforms] = useState([]);
  const [showPerfModal, setShowPerfModal] = useState(false);
  const [perfEntry, setPerfEntry] = useState({});

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const [d, p, i, r, w] = await Promise.all([
        ContentDraft.list("-created_date"),
        PostPerformance.list("-posted_at"),
        ContentIdea.list("-predicted_score"),
        MarketResearch.list("-research_date"),
        WinnerDNA.list("-avg_score"),
      ]);
      setDrafts(Array.isArray(d) ? d : []);
      setPerfs(Array.isArray(p) ? p : []);
      setIdeas(Array.isArray(i) ? i : []);
      setResearch(Array.isArray(r) ? r : []);
      setDna(Array.isArray(w) ? w : []);
    } catch(e) {
      setLoadError(String(e?.message || e));
    }
    setLoading(false);
  }

  function toast_(msg, type="success") {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 4000);
  }

  const filtered = drafts.filter(d => {
    if (statusFilter !== "All" && d.status !== statusFilter) return false;
    if (pillarFilter !== "All" && d.pillar !== pillarFilter) return false;
    return true;
  });
  const counts = drafts.reduce((a,d)=>{ a[d.status]=(a[d.status]||0)+1; return a; },{});
  const winners = perfs.filter(p=>p.performance_label==="Winner");
  const selPerfs = selected ? perfs.filter(p=>p.content_draft_id===selected.id) : [];
  const totalReach = perfs.reduce((s,p)=>s+(p.reach||0),0);
  const totalEng = perfs.reduce((s,p)=>s+(p.likes||0)+(p.comments||0)+(p.shares||0),0);
  const avgEng = perfs.length ? fmt(perfs.reduce((s,p)=>s+(p.engagement_rate||0),0)/perfs.length) : "—";
  const heyQueued = drafts.filter(d=>d.heygen_status==="Queued").length;
  const heyDone = drafts.filter(d=>d.heygen_status==="Completed").length;
  const heyGen = drafts.filter(d=>d.heygen_status==="Generating").length;
  const scriptsReady = drafts.filter(d=>d.script_30sec||d.script_15sec||d.script_45sec).length;

  const pillarStats = perfs.reduce((a,p)=>{ if(!p.pillar)return a; if(!a[p.pillar])a[p.pillar]={t:0,c:0}; a[p.pillar].t+=(p.performance_score||0); a[p.pillar].c+=1; return a; },{});
  const platStats = perfs.reduce((a,p)=>{ if(!p.platform)return a; if(!a[p.platform])a[p.platform]={t:0,c:0}; a[p.platform].t+=(p.performance_score||0); a[p.platform].c+=1; return a; },{});

  async function setStatus(id, status) {
    setSaving(true);
    try {
      await ContentDraft.update(id, {status});
      await load();
      if (selected?.id===id) setSelected(p=>({...p,status}));
      toast_(status==="Approved"?"✅ Approved!":status==="Rejected"?"❌ Rejected.":`→ ${status}`);
    } catch(e){ toast_("Error: "+e.message,"error"); }
    setSaving(false);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      await ContentDraft.update(selected.id, editData);
      await load();
      setSelected(p=>({...p,...editData}));
      setEditing(false);
      toast_("💾 Saved!");
    } catch(e){ toast_("Error: "+e.message,"error"); }
    setSaving(false);
  }

  async function postNow() {
    if (!pubPlatforms.length){toast_("Pick at least one platform","error");return;}
    setPosting(true);
    try {
      const res = await fetch("/functions/postToSocials",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({draft_id:selected.id,platforms:pubPlatforms})});
      const data = await res.json();
      if (data.ok) {
        toast_(`🚀 Posted to: ${(data.posted_to||[]).join(", ")}`);
        await load();
        setSelected(p=>({...p,status:"Posted"}));
        setShowPublisher(false);
      } else { toast_(data.error||"Failed","error"); }
    } catch(e){ toast_("Error: "+e.message,"error"); }
    setPosting(false);
  }

  async function savePerf() {
    if (!perfEntry.platform){toast_("Select a platform","error");return;}
    setSaving(true);
    try {
      const r=Number(perfEntry.reach)||0, l=Number(perfEntry.likes)||0, c=Number(perfEntry.comments)||0, s=Number(perfEntry.shares)||0, sv=Number(perfEntry.saves)||0, cl=Number(perfEntry.clicks)||0;
      const eng = r>0?((l+c+s)/r*100).toFixed(2):0;
      const score = Math.min(10,Math.round((l+c*2+s*3+sv*2+cl*2)/10));
      const label = score>=8?"Winner":score>=6?"Good":score>=4?"Average":"Underperformer";
      await PostPerformance.create({content_draft_id:selected.id,content_title:selected.title||"",platform:perfEntry.platform,pillar:selected.pillar||"",audience:selected.audience||"",hook:selected.hook||"",week_tag:selected.week_tag||"",reach:r,likes:l,comments:c,shares:s,saves:sv,clicks:cl,engagement_rate:parseFloat(eng),performance_score:score,performance_label:label,analyzed:true});
      if (label==="Winner") await ContentDraft.update(selected.id,{is_winner:true,avg_performance_score:score,top_performing_platform:perfEntry.platform});
      await load();
      setShowPerfModal(false); setPerfEntry({});
      toast_(`📊 Logged! ${label}`);
    } catch(e){ toast_("Error: "+e.message,"error"); }
    setSaving(false);
  }

  async function queueHeyGen(d) {
    try {
      await ContentDraft.update(d.id,{heygen_status:"Queued"});
      await load();
      toast_("🎬 Queued for HeyGen!");
    } catch(e){ toast_("Error: "+e.message,"error"); }
  }

  // ── LOADING ──
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
      <p className="text-gray-500 text-sm font-medium">Loading PureTask Studio...</p>
    </div>
  );

  // ── ERROR ──
  if (loadError) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3 p-6">
      <p className="text-4xl">⚠️</p>
      <p className="font-semibold text-gray-800">Could not load data</p>
      <p className="text-sm text-gray-500 text-center max-w-xs">{loadError}</p>
      <button onClick={load} className="mt-2 bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-semibold">↻ Retry</button>
    </div>
  );

  // ── MAIN ──
  return (
    <div className="min-h-screen bg-gray-50">
      <Toast toast={toast}/>

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"#0099FF"}}>
              <span className="text-white font-black text-base">P</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-tight">PureTask Content Studio</h1>
              <p className="text-xs text-gray-400">{drafts.length} drafts · {perfs.length} perf records · {dna.length} winner patterns</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-xs text-gray-400 hidden md:block">{counts["Approved"]||0} approved · {counts["Posted"]||0} posted · {heyQueued} queued</span>
            <a href="/BrainstormDashboard" className="text-xs bg-violet-50 text-violet-600 px-3 py-1.5 rounded-lg font-medium hover:bg-violet-100 transition">🧠 Brainstorm</a>
            <button onClick={load} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 transition">↻ Refresh</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map(t=>(
            <button key={t} onClick={()=>{setTab(t);setSelected(null);}}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition ${tab===t?"bg-blue-50 text-blue-600 border-b-2 border-blue-500":"text-gray-500 hover:text-gray-700"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ══ QUEUE ══ */}
        {tab==="📋 Queue" && (
          <div className="flex gap-5">
            {/* List */}
            <div className="w-72 flex-shrink-0">
              <div className="flex flex-wrap gap-1 mb-2">
                {["All","Approved","Draft","Posted","Rejected"].map(s=>(
                  <button key={s} onClick={()=>setStatusFilter(s)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${statusFilter===s?"bg-blue-500 text-white":"bg-white border border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                    {s}{s!=="All"&&counts[s]?` (${counts[s]})`:""}</button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {["All","Convenience","Trust","Transformation","Recruitment","Local","Proof"].map(p=>(
                  <button key={p} onClick={()=>setPillarFilter(p)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium transition ${pillarFilter===p?"bg-gray-800 text-white":p==="All"?"bg-gray-100 text-gray-600":PILLAR_STYLE[p]||"bg-gray-100 text-gray-600"}`}>
                    {p}</button>
                ))}
              </div>
              <div className="space-y-2 max-h-[68vh] overflow-y-auto pr-1">
                {filtered.length===0&&<p className="text-sm text-gray-400 text-center py-8">No drafts match these filters.</p>}
                {filtered.map(d=>(
                  <div key={d.id} onClick={()=>{setSelected(d);setEditing(false);setActivePlatform("platform_facebook");}}
                    className={`bg-white rounded-xl border p-3 cursor-pointer transition hover:border-blue-300 hover:shadow-sm ${selected?.id===d.id?"border-blue-400 shadow-md":"border-gray-100"}`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">{d.is_winner?"🏆 ":""}{d.title||"Untitled"}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_STYLE[d.status]||"bg-gray-100 text-gray-500"}`}>{d.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {d.pillar&&<Pill label={d.pillar} style={PILLAR_STYLE[d.pillar]||"bg-gray-100 text-gray-500"}/>}
                      {d.audience&&<Pill label={d.audience} style="bg-gray-50 text-gray-500"/>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {d.avg_performance_score?<span className="text-xs font-bold text-green-600">{Number(d.avg_performance_score).toFixed(1)}★</span>:null}
                        {d.heygen_status&&d.heygen_status!=="None"&&<span className={`text-xs px-1.5 py-0.5 rounded font-medium ${HEYGEN_STYLE[d.heygen_status]||"bg-gray-100 text-gray-400"}`}>🎬 {d.heygen_status}</span>}
                      </div>
                      <div className="flex gap-0.5">{ALL_PLATFORM_KEYS.filter(k=>d[k]).map(k=><span key={k} className="text-sm">{PI[k]}</span>)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail */}
            <div className="flex-1 min-w-0">
              {!selected?(
                <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center h-72 gap-2">
                  <p className="text-5xl">📋</p>
                  <p className="font-semibold text-gray-600">Select a draft to view</p>
                  <p className="text-sm text-gray-400">{drafts.length} drafts loaded</p>
                </div>
              ):(
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  {/* Header */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">{selected.is_winner?"🏆 ":""}{selected.title}</h2>
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[selected.status]||"bg-gray-100 text-gray-500"}`}>{selected.status}</span>
                          {selected.pillar&&<Pill label={selected.pillar} style={PILLAR_STYLE[selected.pillar]||"bg-gray-100 text-gray-500"}/>}
                          {selected.audience&&<Pill label={selected.audience} style="bg-gray-50 text-gray-500"/>}
                          {selected.week_tag&&<Pill label={selected.week_tag} style="bg-blue-50 text-blue-500"/>}
                          {selected.city&&<Pill label={"📍 "+selected.city} style="bg-teal-50 text-teal-600"/>}
                          {selected.heygen_status&&selected.heygen_status!=="None"&&<Pill label={"🎬 "+selected.heygen_status} style={HEYGEN_STYLE[selected.heygen_status]||"bg-gray-100 text-gray-400"}/>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {[["C",selected.clarity_score],["R",selected.relatability_score],["V",selected.conversion_score]].map(([l,sc])=>(
                          <div key={l} className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                            <p className="text-xs text-gray-400 mb-0.5">{l}</p>
                            <ScoreBadge score={sc}/>
                          </div>
                        ))}
                        <div className="bg-blue-50 rounded-lg px-3 py-2 text-center">
                          <p className="text-xs text-blue-400 mb-0.5">Avg</p>
                          <ScoreBadge score={selected.avg_performance_score||safeAvg(selected.clarity_score,selected.relatability_score,selected.conversion_score)}/>
                        </div>
                      </div>
                    </div>
                    {selected.hook&&<p className="text-sm text-gray-500 italic">"{selected.hook}"</p>}
                  </div>

                  {/* Platform tabs */}
                  <div className="px-5 pt-3 border-b border-gray-100 flex gap-1 overflow-x-auto">
                    {ALL_PLATFORM_KEYS.map(k=>(
                      <button key={k} onClick={()=>setActivePlatform(k)}
                        className={`text-xs px-2.5 py-1.5 rounded-t-lg font-medium whitespace-nowrap flex items-center gap-1 transition ${activePlatform===k?"bg-blue-50 text-blue-600 border-b-2 border-blue-400":"text-gray-400 hover:text-gray-600"}`}>
                        {PI[k]} {PL[k].split("/")[0]}{!selected[k]&&<span className="text-red-300">✗</span>}
                      </button>
                    ))}
                  </div>

                  {/* Copy */}
                  <div className="p-5">
                    {editing?(
                      <textarea className="w-full border border-blue-300 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[140px] resize-y"
                        value={editData[activePlatform]!==undefined?editData[activePlatform]:(selected[activePlatform]||"")}
                        onChange={e=>setEditData(prev=>({...prev,[activePlatform]:e.target.value}))}/>
                    ):(
                      <div className="bg-gray-50 rounded-xl p-4 min-h-[100px]">
                        {selected[activePlatform]
                          ?<p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selected[activePlatform]}</p>
                          :<p className="text-sm text-gray-400 italic">No {PL[activePlatform]} copy yet.</p>}
                      </div>
                    )}

                    {/* Scripts */}
                    {(selected.script_15sec||selected.script_30sec||selected.script_45sec)&&(
                      <div className="mt-4 border border-blue-100 rounded-xl p-4 bg-blue-50">
                        <p className="text-xs font-bold text-blue-600 mb-2">🎬 HeyGen Scripts</p>
                        <div className="space-y-2">
                          {[["15s",selected.script_15sec],["30s",selected.script_30sec],["45s",selected.script_45sec]].filter(([,v])=>v).map(([lbl,val])=>(
                            <div key={lbl}>
                              <p className="text-xs font-semibold text-blue-500 mb-0.5">{lbl}</p>
                              <p className="text-xs text-gray-600 leading-relaxed bg-white rounded-lg p-2.5 border border-blue-100">{val}</p>
                            </div>
                          ))}
                        </div>
                        {selected.video_cdn_url&&(
                          <div className="mt-3 pt-3 border-t border-blue-100">
                            <p className="text-xs font-bold text-green-600 mb-1">✅ Video Ready</p>
                            <a href={selected.video_cdn_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 underline break-all">{selected.video_cdn_url}</a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CTAs */}
                    {(selected.cta_1||selected.cta_2||selected.cta_3)&&(
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[selected.cta_1,selected.cta_2,selected.cta_3].filter(Boolean).map((c,i)=>(
                          <span key={i} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-lg border border-green-100">{c}</span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {!editing
                        ?<button onClick={()=>{setEditing(true);setEditData({});}} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium">✏️ Edit</button>
                        :<><button onClick={saveEdit} disabled={saving} className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-50">{saving?"Saving...":"💾 Save"}</button>
                           <button onClick={()=>setEditing(false)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium">Cancel</button></>}
                      {selected.status!=="Approved"&&selected.status!=="Posted"&&(
                        <button onClick={()=>setStatus(selected.id,"Approved")} disabled={saving} className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-50">✅ Approve</button>)}
                      <button onClick={()=>{setShowPublisher(true);setPubPlatforms([]);}} className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg font-medium">🚀 Post Now</button>
                      {selected.status!=="Rejected"&&(
                        <button onClick={()=>setStatus(selected.id,"Rejected")} disabled={saving} className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg font-medium">❌ Reject</button>)}
                      <button onClick={()=>setShowPerfModal(true)} className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg font-medium">📊 Log Perf</button>
                      {selected.heygen_status!=="Completed"&&selected.heygen_status!=="Generating"&&(
                        <button onClick={()=>queueHeyGen(selected)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium">🎬 Queue HeyGen</button>)}
                    </div>
                  </div>

                  {/* Perf history */}
                  {selPerfs.length>0&&(
                    <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Performance</p>
                      <div className="space-y-1.5">
                        {selPerfs.map(p=>(
                          <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 gap-3">
                            <span className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">{p.platform}</span>
                            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                              <span>👁 {(p.reach||0).toLocaleString()}</span>
                              <span>❤️ {p.likes||0}</span>
                              <span>💬 {p.comments||0}</span>
                              <span>🔁 {p.shares||0}</span>
                              <span>🔗 {p.clicks||0}</span>
                              <span>{p.engagement_rate?Number(p.engagement_rate).toFixed(1):0}%</span>
                              <span className={`px-2 py-0.5 rounded-full font-medium ${PERF_STYLE[p.performance_label]||PERF_STYLE.Pending}`}>{p.performance_label||"Pending"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ HEYGEN ══ */}
        {tab==="🎬 HeyGen"&&(
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[["Queued","🕐",heyQueued,"bg-blue-50 text-blue-600"],["Generating","⚙️",heyGen,"bg-yellow-50 text-yellow-600"],["Completed","✅",heyDone,"bg-green-50 text-green-600"],["Scripts Ready","📝",scriptsReady,"bg-purple-50 text-purple-600"]].map(([l,icon,v,s])=>(
                <div key={l} className={`rounded-2xl p-4 ${s}`}><p className="text-2xl mb-1">{icon}</p><p className="text-2xl font-black">{v}</p><p className="text-xs font-medium opacity-75">{l}</p></div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl p-5 mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-75 mb-1">Golden Story Formula</p>
              <p className="text-sm font-bold">MESS / STRESS → EASY BOOKING → TRUSTED CLEANER → VISIBLE TRANSFORMATION → RELIEF / CONFIDENCE → CTA</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Video Production Queue</h3>
                <span className="text-xs text-gray-400">{drafts.filter(d=>d.script_30sec||d.script_15sec||d.script_45sec||(d.heygen_status&&d.heygen_status!=="None")).length} items</span>
              </div>
              <div className="divide-y divide-gray-50">
                {drafts.filter(d=>d.script_30sec||d.script_15sec||d.script_45sec||(d.heygen_status&&d.heygen_status!=="None")).map(d=>(
                  <div key={d.id} className="px-5 py-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-semibold text-gray-800">{d.is_winner?"🏆 ":""}{d.title}</p>
                          <Pill label={d.heygen_status||"No Status"} style={HEYGEN_STYLE[d.heygen_status||"None"]||"bg-gray-100 text-gray-400"}/>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {d.pillar&&<Pill label={d.pillar} style={PILLAR_STYLE[d.pillar]||"bg-gray-100 text-gray-500"}/>}
                          {d.audience&&<Pill label={d.audience} style="bg-gray-50 text-gray-500"/>}
                        </div>
                        {d.script_30sec&&<p className="text-xs text-gray-400 italic line-clamp-2">"{d.script_30sec}"</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="flex gap-1">
                          {d.script_15sec&&<span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium">15s</span>}
                          {d.script_30sec&&<span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium">30s</span>}
                          {d.script_45sec&&<span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium">45s</span>}
                        </div>
                        {d.video_cdn_url
                          ?<a href={d.video_cdn_url} target="_blank" rel="noreferrer" className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-medium">▶ View</a>
                          :d.heygen_status==="Queued"
                            ?<span className="text-xs bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-medium">⏳ Queued</span>
                            :<button onClick={()=>queueHeyGen(d)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100">🎬 Queue</button>}
                      </div>
                    </div>
                  </div>
                ))}
                {drafts.filter(d=>d.script_30sec||d.script_15sec||(d.heygen_status&&d.heygen_status!=="None")).length===0&&(
                  <p className="text-center text-gray-400 py-10 text-sm">No video scripts yet.</p>)}
              </div>
            </div>
          </div>
        )}

        {/* ══ RESEARCH ══ */}
        {tab==="🔬 Research"&&(
          <div>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[["Total",research.length,"bg-blue-50 text-blue-600"],["High Urgency",research.filter(r=>r.urgency==="High").length,"bg-red-50 text-red-600"],["Unused",research.filter(r=>!r.used_in_brainstorm).length,"bg-yellow-50 text-yellow-600"]].map(([l,v,s])=>(
                <div key={l} className={`rounded-2xl p-4 ${s}`}><p className="text-2xl font-black">{v}</p><p className="text-xs font-medium opacity-75">{l}</p></div>
              ))}
            </div>
            {research.length===0&&<div className="bg-white rounded-2xl border border-gray-100 text-center py-16 text-gray-400">Research loads every Sunday night automatically.</div>}
            <div className="grid gap-3">
              {research.map(r=>(
                <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm">{r.title}</h3>
                    <div className="flex gap-1.5 flex-shrink-0 flex-wrap">
                      <Pill label={r.research_type} style={RESEARCH_STYLE[r.research_type]||"bg-gray-100 text-gray-500"}/>
                      <Pill label={r.urgency} style={r.urgency==="High"?"bg-red-50 text-red-600":r.urgency==="Medium"?"bg-yellow-50 text-yellow-600":"bg-gray-50 text-gray-500"}/>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 leading-relaxed">{r.summary}</p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex gap-1.5 flex-wrap">
                      {r.suggested_pillar&&<Pill label={r.suggested_pillar} style={PILLAR_STYLE[r.suggested_pillar]||"bg-gray-100 text-gray-500"}/>}
                      {r.suggested_audience&&<Pill label={r.suggested_audience} style="bg-gray-50 text-gray-500"/>}
                      {r.season_tag&&<Pill label={r.season_tag} style="bg-emerald-50 text-emerald-600"/>}
                    </div>
                    {r.used_in_brainstorm&&<span className="text-xs text-green-500 font-medium">✓ Used</span>}
                  </div>
                  {r.relevance_to_puretask&&<p className="text-xs text-blue-700 mt-2 bg-blue-50 rounded-lg px-2.5 py-1.5">💡 {r.relevance_to_puretask}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ IDEAS ══ */}
        {tab==="💡 Ideas"&&(
          <div>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[["Total",ideas.length,"bg-purple-50 text-purple-600"],["Selected",ideas.filter(i=>i.status==="Selected").length,"bg-green-50 text-green-600"],["Avg Score",ideas.length?(ideas.reduce((s,i)=>s+(i.predicted_score||0),0)/ideas.length).toFixed(1):"—","bg-blue-50 text-blue-600"]].map(([l,v,s])=>(
                <div key={l} className={`rounded-2xl p-4 ${s}`}><p className="text-2xl font-black">{v}</p><p className="text-xs font-medium opacity-75">{l}</p></div>
              ))}
            </div>
            {ideas.length===0&&<div className="bg-white rounded-2xl border border-gray-100 text-center py-16 text-gray-400">Ideas generate every Monday 6am automatically.</div>}
            <div className="grid gap-3">
              {ideas.map(idea=>(
                <div key={idea.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">{idea.idea_title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{idea.concept}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-black text-green-600">{idea.predicted_score?Number(idea.predicted_score).toFixed(1):"—"}</p>
                      <p className="text-xs text-gray-400">score</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <Pill label={idea.status} style={IDEA_STYLE[idea.status]||"bg-gray-100 text-gray-500"}/>
                    {idea.pillar&&<Pill label={idea.pillar} style={PILLAR_STYLE[idea.pillar]||"bg-gray-100 text-gray-500"}/>}
                    {idea.audience&&<Pill label={idea.audience} style="bg-gray-50 text-gray-500"/>}
                    {idea.pillar_gap_bonus>0&&<Pill label={`+${idea.pillar_gap_bonus} gap bonus`} style="bg-orange-50 text-orange-600"/>}
                    {idea.seasonal_relevance&&<Pill label="🌸 Seasonal" style="bg-emerald-50 text-emerald-600"/>}
                  </div>
                  {idea.hook_options&&<p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg px-2.5 py-1.5">💬 {idea.hook_options}</p>}
                  {idea.best_platform&&<div className="mt-2 flex items-center gap-2 flex-wrap"><span className="text-xs text-gray-400">Best:</span><Pill label={idea.best_platform} style="bg-blue-50 text-blue-600"/>{idea.week_tag&&<Pill label={idea.week_tag} style="bg-blue-50 text-blue-500"/>}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ ANALYTICS ══ */}
        {tab==="📊 Analytics"&&(
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[["Posts",perfs.length,"📤","bg-blue-50 text-blue-600"],["Total Reach",totalReach.toLocaleString(),"👁","bg-purple-50 text-purple-600"],["Engagement",totalEng.toLocaleString(),"❤️","bg-pink-50 text-pink-600"],["Avg Eng %",avgEng+"%","📈","bg-green-50 text-green-600"]].map(([l,v,icon,s])=>(
                <div key={l} className={`rounded-2xl p-4 ${s}`}><p className="text-2xl mb-1">{icon}</p><p className="text-2xl font-black">{v}</p><p className="text-xs font-medium opacity-75">{l}</p></div>
              ))}
            </div>
            {winners.length>0&&(
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-3">🏆 Winners ({winners.length})</h3>
                <div className="space-y-2">
                  {winners.map(w=>(
                    <div key={w.id} className="flex items-center justify-between bg-yellow-50 rounded-xl px-4 py-3 gap-3">
                      <div className="min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{w.content_title}</p><p className="text-xs text-gray-500">{w.platform} · {w.pillar}</p></div>
                      <div className="flex gap-3 text-xs flex-shrink-0 flex-wrap justify-end">
                        <span>👁 {(w.reach||0).toLocaleString()}</span><span>❤️ {w.likes||0}</span><span>🔁 {w.shares||0}</span>
                        <span className="font-bold text-yellow-700">{w.engagement_rate?Number(w.engagement_rate).toFixed(1):0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-3">By Pillar</h3>
                {Object.keys(pillarStats).length===0&&<p className="text-sm text-gray-400 text-center py-4">No data yet.</p>}
                <div className="space-y-2">
                  {Object.entries(pillarStats).sort((a,b)=>(b[1].t/b[1].c)-(a[1].t/a[1].c)).map(([p,s])=>(
                    <div key={p} className="flex items-center gap-3">
                      <Pill label={p} style={PILLAR_STYLE[p]||"bg-gray-100 text-gray-500"}/>
                      <div className="flex-1 bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width:`${((s.t/s.c)/10)*100}%`}}/></div>
                      <span className="text-sm font-bold text-gray-700 w-8">{(s.t/s.c).toFixed(1)}</span>
                      <span className="text-xs text-gray-400 w-12">{s.c} posts</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-3">By Platform</h3>
                {Object.keys(platStats).length===0&&<p className="text-sm text-gray-400 text-center py-4">No data yet.</p>}
                <div className="space-y-2">
                  {Object.entries(platStats).sort((a,b)=>(b[1].t/b[1].c)-(a[1].t/a[1].c)).map(([p,s])=>(
                    <div key={p} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">{p}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width:`${((s.t/s.c)/10)*100}%`}}/></div>
                      <span className="text-sm font-bold text-gray-700 w-8">{(s.t/s.c).toFixed(1)}</span>
                      <span className="text-xs text-gray-400 w-12">{s.c} posts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-800">All Records ({perfs.length})</h3></div>
              {perfs.length===0&&<p className="text-center text-gray-400 py-10">No performance data yet.</p>}
              <div className="divide-y divide-gray-50">
                {perfs.map(p=>(
                  <div key={p.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 gap-3">
                    <div className="min-w-0"><p className="text-sm font-medium text-gray-800 truncate">{p.content_title}</p><p className="text-xs text-gray-400">{p.platform} · {p.pillar} · {p.posted_at?p.posted_at.split("T")[0]:"—"}</p></div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0 flex-wrap justify-end">
                      <span>👁 {(p.reach||0).toLocaleString()}</span><span>❤️ {p.likes||0}</span><span>🔁 {p.shares||0}</span><span>🔗 {p.clicks||0}</span>
                      <Pill label={p.performance_label||"Pending"} style={PERF_STYLE[p.performance_label]||PERF_STYLE.Pending}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ WINNER DNA ══ */}
        {tab==="🧬 Winner DNA"&&(
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">What's Working</p>
              <p className="text-sm font-medium">{dna.length} patterns extracted · Feeds Monday brainstorm automatically</p>
            </div>
            {dna.length===0&&<div className="bg-white rounded-2xl border border-gray-100 text-center py-16 text-gray-400">Winner DNA extracts automatically every 2 days.</div>}
            {dna.map(d=>(
              <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition">
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 mb-1">{d.title}</h3>
                    <div className="flex gap-1.5 flex-wrap">
                      {d.winning_pillar&&<Pill label={d.winning_pillar} style={PILLAR_STYLE[d.winning_pillar]||"bg-gray-100 text-gray-500"}/>}
                      {d.winning_audience&&<Pill label={d.winning_audience} style="bg-gray-50 text-gray-500"/>}
                      {d.winning_platform&&<Pill label={d.winning_platform} style="bg-blue-50 text-blue-500"/>}
                      {d.winning_format&&<Pill label={d.winning_format} style="bg-purple-50 text-purple-500"/>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-black text-yellow-600">{d.avg_score?Number(d.avg_score).toFixed(1):"—"}</p>
                    <p className="text-xs text-gray-400">avg score</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-3">
                  {[["Hook Style",d.winning_hook_style],["Emotional Trigger",d.emotional_trigger],["CTA Style",d.winning_cta_style],["Key Phrases",d.key_phrases]].filter(([,v])=>v).map(([l,v])=>(
                    <div key={l} className="bg-gray-50 rounded-lg p-2.5"><p className="text-gray-400 font-medium mb-0.5">{l}</p><p className="text-gray-700">{v}</p></div>
                  ))}
                </div>
                {d.pattern_notes&&<p className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2 leading-relaxed">📋 {d.pattern_notes}</p>}
                <div className="mt-2 flex gap-4 text-xs text-gray-400 flex-wrap">
                  <span>📊 Reach: {d.total_reach?Number(d.total_reach).toLocaleString():"—"}</span>
                  <span>❤️ Engagement: {d.total_engagement?Number(d.total_engagement).toLocaleString():"—"}</span>
                  <span>🔁 Reused: {d.reuse_count||0}×</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PUBLISH MODAL */}
      {showPublisher&&selected&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-1">🚀 Post Now</h3>
            <p className="text-xs text-gray-500 mb-4">Posting: <strong>{selected.title}</strong></p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {AYRSHARE_PLATFORMS.map(p=>{
                const key="platform_"+p.toLowerCase();
                const has=!!selected[key];
                return (
                  <label key={p} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${pubPlatforms.includes(p)?"border-blue-400 bg-blue-50":"border-gray-200"} ${!has?"opacity-40":""}`}>
                    <input type="checkbox" checked={pubPlatforms.includes(p)} disabled={!has}
                      onChange={e=>setPubPlatforms(prev=>e.target.checked?[...prev,p]:prev.filter(x=>x!==p))} className="rounded"/>
                    <span className="text-sm font-medium text-gray-700">{p}</span>
                    {!has&&<span className="text-xs text-red-400 ml-auto">no copy</span>}
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">⚠️ Instagram auto-trimmed to 5 hashtags. TikTok needs a video URL.</p>
            <div className="flex gap-2">
              <button onClick={postNow} disabled={posting||!pubPlatforms.length} className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50">
                {posting?"Posting...":`🚀 Post to ${pubPlatforms.length} platform${pubPlatforms.length!==1?"s":""}`}
              </button>
              <button onClick={()=>setShowPublisher(false)} className="px-4 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* PERF MODAL */}
      {showPerfModal&&selected&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">📊 Log Performance</h3>
            <div className="space-y-3">
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                value={perfEntry.platform||""} onChange={e=>setPerfEntry(p=>({...p,platform:e.target.value}))}>
                <option value="">Select Platform</option>
                {["Facebook","Instagram","LinkedIn","TikTok","X","Pinterest"].map(p=><option key={p}>{p}</option>)}
              </select>
              {[["reach","Reach / Views"],["likes","Likes"],["comments","Comments"],["shares","Shares"],["clicks","Link Clicks"]].map(([k,l])=>(
                <input key={k} type="number" placeholder={l} min="0"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  value={perfEntry[k]||""} onChange={e=>setPerfEntry(p=>({...p,[k]:parseInt(e.target.value)||0}))}/>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={savePerf} disabled={saving} className="flex-1 bg-purple-500 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50">{saving?"Saving...":"💾 Save"}</button>
              <button onClick={()=>{setShowPerfModal(false);setPerfEntry({});}} className="px-4 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
