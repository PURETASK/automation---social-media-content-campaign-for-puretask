import { useState, useEffect } from "react";
import { ContentDraft, PostPerformance, ContentIdea, MarketResearch, WinnerDNA } from "@/api/entities";

const PLATFORMS = ["platform_x","platform_instagram","platform_facebook","platform_linkedin","platform_tiktok","platform_pinterest"];
const PL = { platform_x:"X", platform_instagram:"Instagram", platform_facebook:"Facebook", platform_linkedin:"LinkedIn", platform_tiktok:"TikTok", platform_pinterest:"Pinterest" };
const PI = { platform_x:"𝕏", platform_instagram:"📸", platform_facebook:"👤", platform_linkedin:"💼", platform_tiktok:"🎵", platform_pinterest:"📌" };
const PN = ["Facebook","Instagram","TikTok","LinkedIn","X","Pinterest"];
const SC = { Draft:"bg-gray-100 text-gray-600","Pending Approval":"bg-yellow-100 text-yellow-700",Approved:"bg-green-100 text-green-700",Rejected:"bg-red-100 text-red-600",Scheduled:"bg-blue-100 text-blue-700",Posted:"bg-purple-100 text-purple-700" };
const PC = { Convenience:"bg-blue-50 text-blue-600 border-blue-100",Trust:"bg-green-50 text-green-600 border-green-100",Transformation:"bg-violet-50 text-violet-600 border-violet-100",Recruitment:"bg-orange-50 text-orange-600 border-orange-100",Local:"bg-teal-50 text-teal-600 border-teal-100",Proof:"bg-pink-50 text-pink-600 border-pink-100" };
const PERF_C = { Winner:"bg-yellow-100 text-yellow-700",Good:"bg-green-100 text-green-700",Average:"bg-blue-100 text-blue-600",Underperformer:"bg-red-100 text-red-600",Pending:"bg-gray-100 text-gray-500" };
const RT_C = { "Trending Topic":"bg-rose-50 text-rose-600","Competitor Intel":"bg-amber-50 text-amber-600","Audience Pain Point":"bg-red-50 text-red-600","Seasonal Trend":"bg-emerald-50 text-emerald-600","Industry News":"bg-sky-50 text-sky-600","Platform Algorithm Change":"bg-indigo-50 text-indigo-600","Viral Format":"bg-fuchsia-50 text-fuchsia-600" };
const IS_C = { Brainstormed:"bg-gray-100 text-gray-600",Selected:"bg-green-100 text-green-700",Rejected:"bg-red-100 text-red-600","Converted to Draft":"bg-purple-100 text-purple-700" };

const TABS = ["📋 Queue","🔬 Research","💡 Ideas","📅 Scheduler","📊 Analytics","🧬 Winner DNA"];

export default function ContentDashboard() {
  const [tab, setTab] = useState("📋 Queue");
  const [drafts, setDrafts] = useState([]);
  const [perfs, setPerfs] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [research, setResearch] = useState([]);
  const [dna, setDna] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sf, setSf] = useState("All");
  const [sel, setSel] = useState(null);
  const [editing, setEditing] = useState(false);
  const [ed, setEd] = useState({});
  const [saving, setSaving] = useState(false);
  const [ap, setAp] = useState("platform_instagram");
  const [toast, setToast] = useState(null);
  const [showSch, setShowSch] = useState(false);
  const [schData, setSchData] = useState({ date:"", platforms:[] });
  const [showPerf, setShowPerf] = useState(false);
  const [pe, setPe] = useState({});
  const [resFilter, setResFilter] = useState("All");
  const [ideaFilter, setIdeaFilter] = useState("All");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [d, p, i, r, w] = await Promise.all([
        ContentDraft.list("-created_date"), PostPerformance.list("-posted_at"),
        ContentIdea.list("-predicted_score"), MarketResearch.list("-research_date"),
        WinnerDNA.list("-avg_score")
      ]);
      setDrafts(d); setPerfs(p); setIdeas(i); setResearch(r); setDna(w);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  const filtered = drafts.filter(d => sf === "All" || d.status === sf);
  const sc2 = drafts.reduce((a,d) => { a[d.status]=(a[d.status]||0)+1; return a; }, {});

  function showT(m,t="success") { setToast({m,t}); setTimeout(() => setToast(null), 3000); }

  async function updateStatus(id, status) {
    setSaving(true);
    await ContentDraft.update(id, { status });
    await fetchAll();
    if (sel?.id===id) setSel(p => ({...p, status}));
    setSaving(false);
    showT(status==="Approved"?"✅ Approved!":status==="Rejected"?"❌ Rejected.":`Updated to ${status}`);
  }

  async function saveEdit() {
    setSaving(true);
    await ContentDraft.update(sel.id, ed);
    await fetchAll();
    setSel(p => ({...p,...ed}));
    setEditing(false); setSaving(false);
    showT("💾 Saved!");
  }

  async function schedulePost() {
    if (!schData.date||schData.platforms.length===0) { showT("Pick date + platforms","error"); return; }
    setSaving(true);
    await ContentDraft.update(sel.id, { status:"Scheduled", scheduled_date:schData.date, scheduled_platforms:schData.platforms.join(", ") });
    await fetchAll();
    setSel(p => ({...p, status:"Scheduled", scheduled_date:schData.date, scheduled_platforms:schData.platforms.join(", ")}));
    setShowSch(false); setSaving(false);
    showT("📅 Scheduled!");
  }

  async function savePerformance() {
    if (!pe.platform) { showT("Select platform","error"); return; }
    setSaving(true);
    const eng = pe.reach>0?(((pe.likes||0)+(pe.comments||0)+(pe.shares||0))/pe.reach*100).toFixed(2):0;
    const score = Math.min(10, Math.round(((pe.likes||0)*1+(pe.comments||0)*2+(pe.shares||0)*3+(pe.saves||0)*2+(pe.clicks||0)*2)/10));
    const label = score>=8?"Winner":score>=6?"Good":score>=4?"Average":"Underperformer";
    await PostPerformance.create({...pe, content_draft_id:sel.id, content_title:sel.title, pillar:sel.pillar, audience:sel.audience, hook:sel.hook, week_tag:sel.week_tag, campaign_tag:sel.campaign_tag, engagement_rate:parseFloat(eng), performance_score:score, performance_label:label, analyzed:true });
    if (label==="Winner") await ContentDraft.update(sel.id, { is_winner:true, avg_performance_score:score });
    await fetchAll();
    setShowPerf(false); setPe({});
    setSaving(false);
    showT(`📊 Logged! Rated: ${label}`);
  }

  function openDraft(draft) {
    setSel(draft); setEditing(false); setShowSch(false); setShowPerf(false);
    setAp("platform_instagram");
    setEd({ title:draft.title||"", hook:draft.hook||"", primary_caption:draft.primary_caption||"", short_caption:draft.short_caption||"", long_caption:draft.long_caption||"", cta_1:draft.cta_1||"", cta_2:draft.cta_2||"", cta_3:draft.cta_3||"", platform_x:draft.platform_x||"", platform_instagram:draft.platform_instagram||"", platform_facebook:draft.platform_facebook||"", platform_linkedin:draft.platform_linkedin||"", platform_tiktok:draft.platform_tiktok||"", platform_pinterest:draft.platform_pinterest||"", blog_post:draft.blog_post||"", image_prompt:draft.image_prompt||"", video_prompt:draft.video_prompt||"", script_15sec:draft.script_15sec||"", script_30sec:draft.script_30sec||"", editor_notes:draft.editor_notes||"" });
    setSchData({ date:draft.scheduled_date||"", platforms:draft.scheduled_platforms?draft.scheduled_platforms.split(", "):[] });
  }

  const winners = perfs.filter(p => p.performance_label==="Winner");
  const pillarStats = perfs.reduce((a,p) => { if(!p.pillar)return a; if(!a[p.pillar])a[p.pillar]={t:0,c:0}; a[p.pillar].t+=p.performance_score||0; a[p.pillar].c+=1; return a; }, {});
  const platStats = perfs.reduce((a,p) => { if(!a[p.platform])a[p.platform]={t:0,c:0}; a[p.platform].t+=p.performance_score||0; a[p.platform].c+=1; return a; }, {});
  const draftPerfs = sel ? perfs.filter(p => p.content_draft_id===sel.id) : [];

  const filteredRes = research.filter(r => resFilter==="All" || r.research_type===resFilter);
  const filteredIdeas = ideas.filter(i => ideaFilter==="All" || i.status===ideaFilter);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {toast && <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.t==="error"?"bg-red-500 text-white":"bg-green-500 text-white"}`}>{toast.m}</div>}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">P</div>
          <div>
            <h1 className="text-base font-bold text-gray-900">PureTask Content Studio</h1>
            <p className="text-xs text-gray-400">Platform-specific brainstorm · Create · Analyze</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">{sc2["Pending Approval"]||0} pending</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{sc2["Scheduled"]||0} scheduled</span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">{ideas.filter(i=>i.status==="Selected").length} ideas selected</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${tab===t?"border-indigo-600 text-indigo-600":"border-transparent text-gray-500 hover:text-gray-700"}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* ==================== RESEARCH TAB ==================== */}
      {tab==="🔬 Research" && (
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Market Intelligence</h2>
              <p className="text-sm text-gray-400">Auto-collected trends, pain points, and competitor intel</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-medium">{research.length} insights</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {["All","Trending Topic","Competitor Intel","Audience Pain Point","Seasonal Trend","Industry News","Viral Format"].map(f => (
              <button key={f} onClick={() => setResFilter(f)} className={`text-xs px-3 py-1.5 rounded-full font-medium ${resFilter===f?"bg-indigo-600 text-white":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{f}</button>
            ))}
          </div>
          {filteredRes.length===0 ? (
            <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
              <div className="text-5xl mb-4">🔬</div>
              <p className="font-medium text-gray-500">No research data yet.</p>
              <p className="text-sm mt-1">The weekly market scan runs every Sunday at 6pm PT. Research will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRes.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800 leading-tight">{r.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ml-2 font-medium ${RT_C[r.research_type]||"bg-gray-100 text-gray-500"}`}>{r.research_type}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{r.summary}</p>
                  {r.relevance_to_puretask && <p className="text-xs text-indigo-600 bg-indigo-50 rounded-lg p-2 mb-3">💡 {r.relevance_to_puretask}</p>}
                  <div className="flex items-center gap-2 flex-wrap">
                    {r.suggested_pillar && <span className={`text-xs px-2 py-0.5 rounded-full ${PC[r.suggested_pillar]}`}>{r.suggested_pillar}</span>}
                    {r.sentiment && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{r.sentiment}</span>}
                    {r.urgency && <span className={`text-xs px-2 py-0.5 rounded-full ${r.urgency==="High"?"bg-red-50 text-red-600":r.urgency==="Medium"?"bg-yellow-50 text-yellow-600":"bg-gray-50 text-gray-500"}`}>{r.urgency} urgency</span>}
                    {r.used_in_brainstorm && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">✓ Used</span>}
                  </div>
                  {r.source && <p className="text-xs text-gray-400 mt-2">Source: {r.source}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== IDEAS TAB ==================== */}
      {tab==="💡 Ideas" && (
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Brainstorm & Platform-Specific Ideas</h2>
              <p className="text-sm text-gray-400">Ideas scored and optimized per platform — top picks auto-selected</p>
            </div>
            <span className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-full font-medium">{ideas.filter(i=>i.status==="Selected").length} selected</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {["All","Selected","Brainstormed","Converted to Draft","Rejected"].map(f => (
              <button key={f} onClick={() => setIdeaFilter(f)} className={`text-xs px-3 py-1.5 rounded-full font-medium ${ideaFilter===f?"bg-indigo-600 text-white":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{f}</button>
            ))}
          </div>
          {filteredIdeas.length===0 ? (
            <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
              <div className="text-5xl mb-4">💡</div>
              <p className="font-medium text-gray-500">No ideas yet.</p>
              <p className="text-sm mt-1">The brainstorm engine runs every Monday at 6am PT. Ideas will appear here with platform scores.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIdeas.map(idea => (
                <div key={idea.id} className={`bg-white rounded-xl border p-4 shadow-sm ${idea.status==="Selected"?"border-green-200 bg-green-50/30":""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {idea.status==="Selected" && <span className="text-green-600 text-sm font-bold">✅</span>}
                        <h3 className="text-sm font-semibold text-gray-800">{idea.idea_title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{idea.concept}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-3 shrink-0">
                      <div className="text-center">
                        <p className="text-lg font-bold text-indigo-600">{idea.predicted_score?.toFixed(1)}</p>
                        <p className="text-xs text-gray-400">Overall</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${IS_C[idea.status]}`}>{idea.status}</span>
                    </div>
                  </div>

                  {/* Platform-specific scores */}
                  {(idea.platform_x_score || idea.platform_instagram_score || idea.platform_facebook_score || idea.platform_linkedin_score || idea.platform_tiktok_score || idea.platform_pinterest_score) && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-500 font-semibold mb-2">📱 Platform Scores</p>
                      <div className="grid grid-cols-6 gap-2">
                        {[["X",idea.platform_x_score,"𝕏"],["IG",idea.platform_instagram_score,"📸"],["FB",idea.platform_facebook_score,"👤"],["LI",idea.platform_linkedin_score,"💼"],["TikTok",idea.platform_tiktok_score,"🎵"],["Pin",idea.platform_pinterest_score,"📌"]].map(([l,s,i]) => s ? (
                          <div key={l} className="text-center">
                            <p className={`text-lg font-bold ${s>=8?"text-green-600":s>=6?"text-yellow-600":"text-gray-400"}`}>{s?.toFixed(1)}</p>
                            <p className="text-xs text-gray-500">{l}</p>
                          </div>
                        ) : null)}
                      </div>
                      {idea.best_platform && <p className="text-xs text-indigo-600 mt-2">🎯 Best for: <span className="font-semibold">{idea.best_platform}</span></p>}
                    </div>
                  )}

                  {idea.hook_options && <p className="text-xs text-gray-500 italic mb-2">🎣 Hooks: {idea.hook_options}</p>}
                  
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {idea.pillar && <span className={`text-xs px-2 py-0.5 rounded-full ${PC[idea.pillar]}`}>{idea.pillar}</span>}
                    {idea.audience && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{idea.audience}</span>}
                    {idea.format_suggestion && <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{idea.format_suggestion}</span>}
                    {idea.seasonal_relevance && <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">🌱 Seasonal</span>}
                  </div>

                  {idea.selection_reasoning && (
                    <div className="bg-yellow-50 rounded-lg p-2">
                      <p className="text-xs text-gray-600"><span className="font-semibold text-gray-800">Why selected:</span> {idea.selection_reasoning}</p>
                    </div>
                  )}

                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Trend: {idea.trend_relevance_score||0}/10</span>
                    <span>Winner Match: {idea.winner_pattern_match||0}/10</span>
                    <span>Pillar Gap: +{idea.pillar_gap_bonus||0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== QUEUE TAB ==================== */}
      {tab==="📋 Queue" && (
        <div className="flex h-[calc(100vh-113px)]">
          <div className="w-80 bg-white border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-wrap gap-1.5">
                {["All","Pending Approval","Approved","Scheduled","Posted","Rejected"].map(s => (
                  <button key={s} onClick={() => setSf(s)} className={`text-xs px-2.5 py-1 rounded-full font-medium ${sf===s?"bg-indigo-600 text-white":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{s}{s!=="All"&&sc2[s]?` (${sc2[s]})`:""}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? <div className="p-6 text-center text-gray-400 text-sm">Loading...</div>
              : filtered.length===0 ? <div className="p-6 text-center text-gray-400 text-sm">No drafts.</div>
              : filtered.map(d => (
                <div key={d.id} onClick={() => openDraft(d)} className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-indigo-50 transition-all ${sel?.id===d.id?"bg-indigo-50 border-l-4 border-l-indigo-500":""}`}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">{d.is_winner&&"🏆 "}{d.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${SC[d.status]}`}>{d.status}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {d.pillar && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PC[d.pillar]}`}>{d.pillar}</span>}
                    {d.audience && <span className="text-xs text-gray-400 truncate">{d.audience}</span>}
                  </div>
                  {d.scheduled_date && <p className="text-xs text-blue-500 mt-1">📅 {new Date(d.scheduled_date).toLocaleDateString()}</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!sel ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-lg font-medium text-gray-500">Select a draft</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{sel.is_winner&&"🏆 "}{sel.title}</h2>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${SC[sel.status]}`}>{sel.status}</span>
                      {sel.pillar && <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PC[sel.pillar]}`}>{sel.pillar}</span>}
                      {sel.audience && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{sel.audience}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {!editing ? <>
                      <button onClick={() => setEditing(true)} className="text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">✏️ Edit</button>
                      {sel.status==="Approved" && <button onClick={() => setShowSch(true)} className="text-sm px-3 py-2 bg-blue-500 text-white rounded-lg font-medium">📅 Schedule</button>}
                      {sel.status==="Posted" && <button onClick={() => { setPe({platform:"",reach:0,impressions:0,likes:0,comments:0,shares:0,saves:0,clicks:0,video_completion_rate:0,follower_growth:0,posted_at:new Date().toISOString().slice(0,10)}); setShowPerf(true); }} className="text-sm px-3 py-2 bg-purple-500 text-white rounded-lg font-medium">📊 Log Stats</button>}
                      {!["Approved","Scheduled","Posted"].includes(sel.status) && <button onClick={() => updateStatus(sel.id,"Approved")} className="text-sm px-3 py-2 bg-green-500 text-white rounded-lg font-medium">✅ Approve</button>}
                      {!["Rejected","Posted"].includes(sel.status) && <button onClick={() => updateStatus(sel.id,"Rejected")} className="text-sm px-3 py-2 bg-red-500 text-white rounded-lg font-medium">❌ Reject</button>}
                      {sel.status==="Scheduled" && <button onClick={() => updateStatus(sel.id,"Posted")} className="text-sm px-3 py-2 bg-purple-500 text-white rounded-lg font-medium">📤 Posted</button>}
                    </> : <>
                      <button onClick={() => setEditing(false)} className="text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">Cancel</button>
                      <button onClick={saveEdit} disabled={saving} className="text-sm px-3 py-2 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50">{saving?"Saving...":"💾 Save"}</button>
                    </>}
                  </div>
                </div>

                {showSch && <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <h3 className="text-sm font-bold text-blue-800 mb-3">📅 Schedule Post</h3>
                  <div className="mb-3"><label className="text-xs text-blue-700 font-medium block mb-1">Date & Time</label><input type="datetime-local" className="border border-blue-200 rounded-lg px-3 py-2 text-sm w-full" value={schData.date} onChange={e => setSchData(p=>({...p,date:e.target.value}))} /></div>
                  <div className="mb-3"><label className="text-xs text-blue-700 font-medium block mb-1">Platforms</label><div className="flex flex-wrap gap-2">{PN.map(pl => <button key={pl} onClick={() => setSchData(p=>({...p,platforms:p.platforms.includes(pl)?p.platforms.filter(x=>x!==pl):[...p.platforms,pl]}))} className={`text-xs px-3 py-1.5 rounded-full font-medium ${schData.platforms.includes(pl)?"bg-blue-600 text-white":"bg-white text-blue-600 border border-blue-200"}`}>{pl}</button>)}</div></div>
                  <div className="flex gap-2"><button onClick={() => setShowSch(false)} className="text-sm px-3 py-2 bg-white text-gray-600 border rounded-lg">Cancel</button><button onClick={schedulePost} disabled={saving} className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">{saving?"...":"📅 Confirm"}</button></div>
                </div>}

                {showPerf && <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                  <h3 className="text-sm font-bold text-purple-800 mb-3">📊 Log Performance</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div><label className="text-xs text-purple-700 font-medium block mb-1">Platform</label><select className="border border-purple-200 rounded-lg px-3 py-2 text-sm w-full" value={pe.platform} onChange={e => setPe(p=>({...p,platform:e.target.value}))}><option value="">Select...</option>{PN.map(pl => <option key={pl}>{pl}</option>)}</select></div>
                    <div><label className="text-xs text-purple-700 font-medium block mb-1">Date</label><input type="date" className="border border-purple-200 rounded-lg px-3 py-2 text-sm w-full" value={pe.posted_at} onChange={e => setPe(p=>({...p,posted_at:e.target.value}))} /></div>
                    {[["Reach","reach"],["Impressions","impressions"],["Likes","likes"],["Comments","comments"],["Shares","shares"],["Saves","saves"],["Clicks","clicks"],["Followers","follower_growth"]].map(([l,k]) => <div key={k}><label className="text-xs text-purple-700 font-medium block mb-1">{l}</label><input type="number" className="border border-purple-200 rounded-lg px-3 py-2 text-sm w-full" value={pe[k]||""} onChange={e => setPe(p=>({...p,[k]:parseFloat(e.target.value)||0}))} /></div>)}
                  </div>
                  <div className="flex gap-2"><button onClick={() => setShowPerf(false)} className="text-sm px-3 py-2 bg-white text-gray-600 border rounded-lg">Cancel</button><button onClick={savePerformance} disabled={saving} className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg font-medium">{saving?"...":"📊 Save"}</button></div>
                </div>}

                {(sel.clarity_score||sel.relatability_score||sel.conversion_score) && <div className="grid grid-cols-3 gap-3 mb-6">{[["Clarity",sel.clarity_score,"blue"],["Relatability",sel.relatability_score,"violet"],["Conversion",sel.conversion_score,"green"]].map(([l,s,c]) => <div key={l} className={`bg-${c}-50 rounded-xl p-3 text-center`}><p className={`text-2xl font-bold text-${c}-600`}>{s}/10</p><p className={`text-xs text-${c}-500 font-medium`}>{l}</p></div>)}</div>}

                {draftPerfs.length>0 && <div className="mb-6"><h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">📊 Performance</h3>{draftPerfs.map(p => <div key={p.id} className="bg-white rounded-xl border p-4 shadow-sm mb-3"><div className="flex justify-between items-center mb-2"><span className="font-semibold text-gray-800 text-sm">{p.platform}</span><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PERF_C[p.performance_label]}`}>{p.performance_label}</span></div><div className="grid grid-cols-4 gap-2 text-center">{[["Reach",p.reach],["Likes",p.likes],["Comments",p.comments],["Shares",p.shares],["Saves",p.saves],["Clicks",p.clicks],["Eng%",p.engagement_rate+"%"],["Score",p.performance_score+"/10"]].map(([l,v]) => <div key={l} className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">{l}</p><p className="text-sm font-bold text-gray-700">{v||0}</p></div>)}</div></div>)}</div>}

                <Sec l="Hook" i="🎣">{editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={2} value={ed.hook} onChange={e => setEd(p=>({...p,hook:e.target.value}))} /> : <p className="text-gray-800 font-medium text-base italic">"{sel.hook}"</p>}</Sec>

                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Platform Content</h3>
                  <div className="flex gap-2 flex-wrap mb-3">{PLATFORMS.map(p => <button key={p} onClick={() => setAp(p)} className={`text-sm px-3 py-1.5 rounded-lg font-medium ${ap===p?"bg-indigo-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{PI[p]} {PL[p]}</button>)}</div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">{editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none bg-white" rows={5} value={ed[ap]} onChange={e => setEd(p=>({...p,[ap]:e.target.value}))} /> : <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{sel[ap]||"No content yet."}</p>}</div>
                </div>

                <Sec l="Captions" i="📝"><div className="space-y-3">{[["Short","short_caption",2],["Primary","primary_caption",3],["Long","long_caption",4]].map(([l,k,r]) => <div key={k}><p className="text-xs text-gray-400 mb-1 font-medium">{l}</p>{editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={r} value={ed[k]} onChange={e => setEd(p=>({...p,[k]:e.target.value}))} /> : <p className="text-gray-700 text-sm">{sel[k]}</p>}</div>)}</div></Sec>

                <Sec l="CTAs" i="🎯"><div className="space-y-2">{["cta_1","cta_2","cta_3"].map((k,i) => <div key={k} className="flex items-center gap-2"><span className="text-xs bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">{i+1}</span>{editing ? <input className="flex-1 border rounded-lg px-3 py-2 text-sm" value={ed[k]} onChange={e => setEd(p=>({...p,[k]:e.target.value}))} /> : <p className="text-gray-700 text-sm">{sel[k]}</p>}</div>)}</div></Sec>

                <Sec l="Scripts" i="🎬"><div className="space-y-3">{[["15sec","script_15sec",2],["30sec","script_30sec",3]].map(([l,k,r]) => <div key={k}><p className="text-xs text-gray-400 mb-1 font-medium">{l}</p>{editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={r} value={ed[k]} onChange={e => setEd(p=>({...p,[k]:e.target.value}))} /> : <p className="text-gray-700 text-sm">{sel[k]}</p>}</div>)}</div></Sec>

                <Sec l="Creative Prompts" i="🖼️"><div className="space-y-3">{[["Image","image_prompt",2],["Video","video_prompt",2]].map(([l,k,r]) => <div key={k}><p className="text-xs text-gray-400 mb-1 font-medium">{l}</p>{editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={r} value={ed[k]} onChange={e => setEd(p=>({...p,[k]:e.target.value}))} /> : <p className="text-gray-700 text-sm">{sel[k]}</p>}</div>)}</div></Sec>

                {(sel.blog_post||editing) && <Sec l="Blog" i="✍️">{editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={6} value={ed.blog_post} onChange={e => setEd(p=>({...p,blog_post:e.target.value}))} /> : <p className="text-gray-700 text-sm whitespace-pre-wrap">{sel.blog_post}</p>}</Sec>}

                <Sec l="Notes" i="💬">{editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={3} placeholder="Notes..." value={ed.editor_notes} onChange={e => setEd(p=>({...p,editor_notes:e.target.value}))} /> : <p className="text-gray-500 text-sm italic">{sel.editor_notes||"No notes."}</p>}</Sec>

                {!editing && sel.status==="Pending Approval" && <div className="flex gap-3 mt-6 pt-6 border-t"><button onClick={() => updateStatus(sel.id,"Approved")} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold text-sm">✅ Approve</button><button onClick={() => updateStatus(sel.id,"Rejected")} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm">❌ Reject</button></div>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SCHEDULER TAB ==================== */}
      {tab==="📅 Scheduler" && (
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Scheduled & Posted Content</h2>
          {["Scheduled","Posted"].map(s => (
            <div key={s} className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{s==="Scheduled"?"📅":"✅"} {s}</h3>
              {drafts.filter(d => d.status===s).length===0 ? <div className="bg-white rounded-xl border p-6 text-center text-gray-400 text-sm">No {s.toLowerCase()} content yet.</div>
              : drafts.filter(d => d.status===s).map(d => (
                <div key={d.id} className="bg-white rounded-xl border p-4 mb-3 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{d.is_winner&&"🏆 "}{d.title}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">{d.pillar && <span className={`text-xs px-2 py-0.5 rounded-full ${PC[d.pillar]}`}>{d.pillar}</span>}{d.scheduled_platforms && d.scheduled_platforms.split(", ").map(pl => <span key={pl} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{pl}</span>)}</div>
                    {d.scheduled_date && <p className="text-xs text-gray-400 mt-1">📅 {new Date(d.scheduled_date).toLocaleString()}</p>}
                  </div>
                  <div className="flex gap-2">
                    {s==="Scheduled" && <button onClick={() => updateStatus(d.id,"Posted")} className="text-xs px-3 py-1.5 bg-purple-500 text-white rounded-lg font-medium">Mark Posted</button>}
                    {s==="Posted" && <button onClick={() => { openDraft(d); setTab("📋 Queue"); setPe({platform:"",reach:0,impressions:0,likes:0,comments:0,shares:0,saves:0,clicks:0,video_completion_rate:0,follower_growth:0,posted_at:new Date().toISOString().slice(0,10)}); setShowPerf(true); }} className="text-xs px-3 py-1.5 bg-purple-500 text-white rounded-lg font-medium">📊 Log Stats</button>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ==================== ANALYTICS TAB ==================== */}
      {tab==="📊 Analytics" && (
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Performance Analytics</h2>
          {perfs.length===0 ? (
            <div className="bg-white rounded-xl border p-12 text-center"><div className="text-5xl mb-4">📊</div><p className="text-gray-500 font-medium">No data yet.</p><p className="text-gray-400 text-sm mt-1">Log post stats and your analytics will build here.</p></div>
          ) : (<>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[["Tracked",perfs.length,"indigo"],["🏆 Winners",winners.length,"yellow"],["Avg Score",(perfs.reduce((a,p)=>a+(p.performance_score||0),0)/perfs.length).toFixed(1)+"/10","green"],["Total Reach",perfs.reduce((a,p)=>a+(p.reach||0),0).toLocaleString(),"blue"]].map(([l,v,c]) => <div key={l} className={`bg-${c}-50 rounded-xl p-4 text-center`}><p className={`text-2xl font-bold text-${c}-600`}>{v}</p><p className={`text-xs text-${c}-500 font-medium mt-1`}>{l}</p></div>)}
            </div>
            <div className="bg-white rounded-xl border p-5 mb-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 mb-4">📌 By Pillar</h3>
              <div className="space-y-3">{Object.entries(pillarStats).sort((a,b)=>(b[1].t/b[1].c)-(a[1].t/a[1].c)).map(([p,s]) => {const avg=(s.t/s.c).toFixed(1); return <div key={p} className="flex items-center gap-3"><span className={`text-xs px-2 py-1 rounded-full font-medium w-28 text-center ${PC[p]}`}>{p}</span><div className="flex-1 bg-gray-100 rounded-full h-2.5"><div className="bg-indigo-500 h-2.5 rounded-full" style={{width:`${Math.round(s.t/s.c*10)}%`}}></div></div><span className="text-sm font-bold text-gray-700 w-12 text-right">{avg}/10</span><span className="text-xs text-gray-400">{s.c} posts</span></div>})}</div>
            </div>
            <div className="bg-white rounded-xl border p-5 mb-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 mb-4">📱 By Platform</h3>
              <div className="grid grid-cols-3 gap-3">{Object.entries(platStats).map(([p,s]) => <div key={p} className="bg-gray-50 rounded-xl p-3 text-center"><p className="text-lg font-bold text-gray-700">{(s.t/s.c).toFixed(1)}/10</p><p className="text-xs text-gray-500 font-medium">{p}</p><p className="text-xs text-gray-400">{s.c} posts</p></div>)}</div>
            </div>
            {winners.length>0 && <div className="bg-white rounded-xl border p-5 shadow-sm"><h3 className="text-sm font-bold text-gray-700 mb-4">🏆 Winners</h3><div className="space-y-3">{winners.map(p => <div key={p.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100"><div><p className="text-sm font-semibold text-gray-800">{p.content_title}</p><div className="flex gap-2 mt-1">{p.platform && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{p.platform}</span>}{p.pillar && <span className={`text-xs px-2 py-0.5 rounded-full ${PC[p.pillar]}`}>{p.pillar}</span>}</div>{p.hook && <p className="text-xs text-gray-500 italic mt-1">"{p.hook}"</p>}</div><div className="text-right"><p className="text-lg font-bold text-yellow-600">{p.performance_score}/10</p><p className="text-xs text-gray-400">Eng: {p.engagement_rate}%</p></div></div>)}</div></div>}
          </>)}
        </div>
      )}

      {/* ==================== WINNER DNA TAB ==================== */}
      {tab==="🧬 Winner DNA" && (
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Winner DNA Patterns</h2>
              <p className="text-sm text-gray-400">Extracted from 8+ rated posts — feeds back into brainstorm</p>
            </div>
          </div>
          {dna.length===0 ? (
            <div className="bg-white rounded-xl border p-12 text-center"><div className="text-5xl mb-4">🧬</div><p className="text-gray-500 font-medium">No winner DNA yet.</p><p className="text-gray-400 text-sm mt-1">When posts score 8+, their patterns get saved here and feed into future brainstorms.</p></div>
          ) : (
            <div className="space-y-4">
              {dna.map(w => (
                <div key={w.id} className="bg-white rounded-xl border border-yellow-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800">🏆 {w.title}</h3>
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-600">{w.avg_score}/10</p>
                      <p className="text-xs text-gray-400">Reach: {w.total_reach?.toLocaleString()||0}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {[["Hook Style",w.winning_hook_style],["Pillar",w.winning_pillar],["Audience",w.winning_audience],["Format",w.winning_format],["Top Platform",w.winning_platform],["CTA Style",w.winning_cta_style],["Emotional Trigger",w.emotional_trigger],["Reused",`${w.reuse_count||0}x`]].map(([l,v]) => v ? (
                      <div key={l} className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">{l}</p><p className="text-sm font-medium text-gray-700">{v}</p></div>
                    ) : null)}
                  </div>
                  {w.key_phrases && <div className="bg-yellow-50 rounded-lg p-2 mb-2"><p className="text-xs text-yellow-600 font-medium">Key Phrases:</p><p className="text-sm text-gray-700">{w.key_phrases}</p></div>}
                  {w.pattern_notes && <p className="text-xs text-gray-500 italic">{w.pattern_notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Sec({l, i, children}) {
  return <div className="mb-6"><h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{i} {l}</h3><div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">{children}</div></div>;
}
