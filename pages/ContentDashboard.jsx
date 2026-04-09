import { useState, useEffect } from "react";
import { ContentDraft, PostPerformance, ContentIdea, MarketResearch, WinnerDNA } from "@/api/entities";

const PLATFORM_KEYS = ["platform_x","platform_instagram","platform_facebook","platform_linkedin","platform_tiktok","platform_pinterest"];
const PL = { platform_x:"X", platform_instagram:"Instagram", platform_facebook:"Facebook", platform_linkedin:"LinkedIn", platform_tiktok:"TikTok", platform_pinterest:"Pinterest" };
const PI = { platform_x:"𝕏", platform_instagram:"📸", platform_facebook:"👤", platform_linkedin:"💼", platform_tiktok:"🎵", platform_pinterest:"📌" };
const PLATFORM_NAMES = ["Facebook","Instagram","TikTok","LinkedIn","X","Pinterest"];

const STATUS_STYLE = {
  Draft: "bg-gray-100 text-gray-600",
  "Pending Approval": "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
  Scheduled: "bg-blue-100 text-blue-700",
  Posted: "bg-purple-100 text-purple-700"
};
const PILLAR_STYLE = {
  Convenience: "bg-blue-50 text-blue-600",
  Trust: "bg-green-50 text-green-600",
  Transformation: "bg-violet-50 text-violet-600",
  Recruitment: "bg-orange-50 text-orange-600",
  Local: "bg-teal-50 text-teal-600",
  Proof: "bg-pink-50 text-pink-600"
};
const PERF_STYLE = {
  Winner: "bg-yellow-100 text-yellow-700",
  Good: "bg-green-100 text-green-700",
  Average: "bg-blue-100 text-blue-600",
  Underperformer: "bg-red-100 text-red-600",
  Pending: "bg-gray-100 text-gray-500"
};
const RESEARCH_STYLE = {
  "Trending Topic": "bg-rose-50 text-rose-600",
  "Competitor Intel": "bg-amber-50 text-amber-600",
  "Audience Pain Point": "bg-red-50 text-red-600",
  "Seasonal Trend": "bg-emerald-50 text-emerald-600",
  "Industry News": "bg-sky-50 text-sky-600",
  "Platform Algorithm Change": "bg-indigo-50 text-indigo-600",
  "Viral Format": "bg-fuchsia-50 text-fuchsia-600"
};
const IDEA_STYLE = {
  Brainstormed: "bg-gray-100 text-gray-600",
  Selected: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
  "Converted to Draft": "bg-purple-100 text-purple-700"
};

const TABS = ["📋 Queue","🔬 Research","💡 Ideas","📅 Scheduler","📊 Analytics","🧬 Winner DNA"];

function ScoreBadge({ score }) {
  const color = score >= 8 ? "text-green-600" : score >= 6 ? "text-yellow-600" : "text-gray-400";
  return <span className={`text-base font-bold ${color}`}>{score?.toFixed(1) ?? "—"}</span>;
}

function Pill({ label, style, extra = "" }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style} ${extra}`}>{label}</span>;
}

function Section({ label, icon, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{icon} {label}</h3>
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">{children}</div>
    </div>
  );
}

export default function ContentDashboard() {
  const [tab, setTab] = useState("📋 Queue");
  const [drafts, setDrafts] = useState([]);
  const [perfs, setPerfs] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [research, setResearch] = useState([]);
  const [dna, setDna] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [activePlatform, setActivePlatform] = useState("platform_instagram");
  const [toast, setToast] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleData, setScheduleData] = useState({ date: "", platforms: [] });
  const [showPerfModal, setShowPerfModal] = useState(false);
  const [perfEntry, setPerfEntry] = useState({});
  const [resFilter, setResFilter] = useState("All");
  const [ideaFilter, setIdeaFilter] = useState("All");
  const [postMode, setPostMode] = useState("now"); // "now" or "schedule"
  const [showKling, setShowKling] = useState(false);
  const [klingGenerating, setKlingGenerating] = useState(false);
  const [klingResult, setKlingResult] = useState(null);
  const [klingOpts, setKlingOpts] = useState({ aspect_ratio: "9:16", duration: "5", mode: "std", use_draft_image: true, generate_both: false });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [d, p, i, r, w] = await Promise.all([
        ContentDraft.list("-created_date"),
        PostPerformance.list("-posted_at"),
        ContentIdea.list("-predicted_score"),
        MarketResearch.list("-research_date"),
        WinnerDNA.list("-avg_score")
      ]);
      setDrafts(d); setPerfs(p); setIdeas(i); setResearch(r); setDna(w);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  const filteredDrafts = drafts.filter(d => statusFilter === "All" || d.status === statusFilter);
  const statusCounts = drafts.reduce((a, d) => { a[d.status] = (a[d.status] || 0) + 1; return a; }, {});
  const winners = perfs.filter(p => p.performance_label === "Winner");
  const selectedPerfs = selected ? perfs.filter(p => p.content_draft_id === selected.id) : [];

  const pillarStats = perfs.reduce((a, p) => {
    if (!p.pillar) return a;
    if (!a[p.pillar]) a[p.pillar] = { t: 0, c: 0 };
    a[p.pillar].t += p.performance_score || 0; a[p.pillar].c += 1;
    return a;
  }, {});

  const platStats = perfs.reduce((a, p) => {
    if (!a[p.platform]) a[p.platform] = { t: 0, c: 0 };
    a[p.platform].t += p.performance_score || 0; a[p.platform].c += 1;
    return a;
  }, {});

  async function updateStatus(id, status) {
    setSaving(true);
    await ContentDraft.update(id, { status });
    await fetchAll();
    if (selected?.id === id) setSelected(p => ({ ...p, status }));
    setSaving(false);
    showToast(status === "Approved" ? "✅ Approved!" : status === "Rejected" ? "❌ Rejected." : `Updated to ${status}`);
  }

  async function saveEdit() {
    setSaving(true);
    await ContentDraft.update(selected.id, editData);
    await fetchAll();
    setSelected(p => ({ ...p, ...editData }));
    setEditing(false); setSaving(false);
    showToast("💾 Saved!");
  }

  // Send to Ayrshare — post now or schedule
  async function publishToAyrshare(mode = "now") {
    if (scheduleData.platforms.length === 0) { showToast("Select at least one platform", "error"); return; }
    if (mode === "schedule" && !scheduleData.date) { showToast("Pick a date and time to schedule", "error"); return; }
    setPosting(true);
    try {
      const payload = {
        draft_id: selected.id,
        platforms: scheduleData.platforms,
        ...(mode === "schedule" ? { schedule_date: new Date(scheduleData.date).toISOString() } : {})
      };
      const res = await fetch(`/functions/postToSocials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        const posted = data.posted_to || [];
        const failed = data.failed || [];
        if (posted.length > 0) {
          showToast(mode === "schedule"
            ? `📅 Scheduled to: ${posted.join(", ")}`
            : `🚀 Posted to: ${posted.join(", ")}${failed.length ? ` | Failed: ${failed.join(", ")}` : ""}`
          );
        } else {
          showToast(`Failed to post: ${JSON.stringify(data.results)}`, "error");
        }
        await fetchAll();
        setSelected(p => ({ ...p, status: mode === "schedule" ? "Scheduled" : "Posted" }));
        setShowScheduler(false);
      } else {
        showToast(data.error || "Something went wrong", "error");
      }
    } catch (e) {
      showToast("Network error: " + e.message, "error");
    }
    setPosting(false);
  }

  async function savePerformance() {
    if (!perfEntry.platform) { showToast("Select a platform", "error"); return; }
    setSaving(true);
    const eng = perfEntry.reach > 0 ? (((perfEntry.likes || 0) + (perfEntry.comments || 0) + (perfEntry.shares || 0)) / perfEntry.reach * 100).toFixed(2) : 0;
    const score = Math.min(10, Math.round(((perfEntry.likes || 0) * 1 + (perfEntry.comments || 0) * 2 + (perfEntry.shares || 0) * 3 + (perfEntry.saves || 0) * 2 + (perfEntry.clicks || 0) * 2) / 10));
    const label = score >= 8 ? "Winner" : score >= 6 ? "Good" : score >= 4 ? "Average" : "Underperformer";
    await PostPerformance.create({ ...perfEntry, content_draft_id: selected.id, content_title: selected.title, pillar: selected.pillar, audience: selected.audience, hook: selected.hook, week_tag: selected.week_tag, engagement_rate: parseFloat(eng), performance_score: score, performance_label: label, analyzed: true });
    if (label === "Winner") await ContentDraft.update(selected.id, { is_winner: true, avg_performance_score: score });
    await fetchAll();
    setShowPerfModal(false); setPerfEntry({});
    setSaving(false);
    showToast(`📊 Logged! Rated: ${label}`);
  }

  async function generateKlingVideo() {
    setKlingGenerating(true);
    setKlingResult(null);
    try {
      const payload = {
        draft_id: selected.id,
        ...klingOpts,
      };
      const res = await fetch(`/functions/generateKlingVideo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.videos?.length > 0) {
        setKlingResult(data);
        await fetchAll();
        const refreshed = drafts.find(d => d.id === selected.id);
        if (refreshed) setSelected(refreshed);
        showToast(`🎬 Video${data.videos.length > 1 ? "s" : ""} generated!`);
      } else {
        showToast(data.error || "Kling generation failed", "error");
      }
    } catch (e) {
      showToast("Network error: " + e.message, "error");
    }
    setKlingGenerating(false);
  }

  function openDraft(draft) {
    setSelected(draft); setEditing(false); setShowScheduler(false); setShowPerfModal(false);
    setActivePlatform("platform_instagram");
    setEditData({
      title: draft.title || "", hook: draft.hook || "", primary_caption: draft.primary_caption || "",
      short_caption: draft.short_caption || "", long_caption: draft.long_caption || "",
      cta_1: draft.cta_1 || "", cta_2: draft.cta_2 || "", cta_3: draft.cta_3 || "",
      platform_x: draft.platform_x || "", platform_instagram: draft.platform_instagram || "",
      platform_facebook: draft.platform_facebook || "", platform_linkedin: draft.platform_linkedin || "",
      platform_tiktok: draft.platform_tiktok || "", platform_pinterest: draft.platform_pinterest || "",
      blog_post: draft.blog_post || "", image_prompt: draft.image_prompt || "",
      video_prompt: draft.video_prompt || "", script_15sec: draft.script_15sec || "",
      script_30sec: draft.script_30sec || "", editor_notes: draft.editor_notes || ""
    });
    setScheduleData({ date: draft.scheduled_date || "", platforms: draft.scheduled_platforms ? draft.scheduled_platforms.split(", ") : [] });
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm ${toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">P</div>
          <div>
            <h1 className="text-base font-bold text-gray-900">PureTask Content Studio</h1>
            <p className="text-xs text-gray-400">🤖 Full Autopilot · AI generates, approves, schedules & posts</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs flex-wrap justify-end">
          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">{statusCounts["Pending Approval"] || 0} pending</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{statusCounts["Scheduled"] || 0} scheduled</span>
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">{statusCounts["Posted"] || 0} posted</span>
          <span className="bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full font-medium">🏆 {winners.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ====== RESEARCH ====== */}
      {tab === "🔬 Research" && (
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Market Intelligence</h2>
              <p className="text-sm text-gray-400">Auto-collected weekly — trends, competitors, pain points</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-medium">{research.length} insights</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {["All","Trending Topic","Competitor Intel","Audience Pain Point","Seasonal Trend","Industry News","Viral Format"].map(f => (
              <button key={f} onClick={() => setResFilter(f)} className={`text-xs px-3 py-1.5 rounded-full font-medium ${resFilter === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{f}</button>
            ))}
          </div>
          {research.filter(r => resFilter === "All" || r.research_type === resFilter).length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <div className="text-5xl mb-4">🔬</div>
              <p className="font-medium text-gray-500">No research data yet.</p>
              <p className="text-sm text-gray-400 mt-1">Market scan runs every Sunday at 6pm PT and populates this automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {research.filter(r => resFilter === "All" || r.research_type === resFilter).map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800 leading-tight flex-1">{r.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ml-2 font-medium ${RESEARCH_STYLE[r.research_type] || "bg-gray-100 text-gray-500"}`}>{r.research_type}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{r.summary}</p>
                  {r.relevance_to_puretask && <p className="text-xs text-indigo-600 bg-indigo-50 rounded-lg p-2 mb-2">💡 {r.relevance_to_puretask}</p>}
                  <div className="flex items-center gap-2 flex-wrap">
                    {r.suggested_pillar && <Pill label={r.suggested_pillar} style={PILLAR_STYLE[r.suggested_pillar] || "bg-gray-100 text-gray-500"} />}
                    {r.sentiment && <Pill label={r.sentiment} style="bg-gray-100 text-gray-500" />}
                    {r.urgency && <Pill label={`${r.urgency} urgency`} style={r.urgency === "High" ? "bg-red-50 text-red-600" : r.urgency === "Medium" ? "bg-yellow-50 text-yellow-600" : "bg-gray-50 text-gray-500"} />}
                    {r.used_in_brainstorm && <Pill label="✓ Used" style="bg-green-50 text-green-600" />}
                  </div>
                  {r.source && <p className="text-xs text-gray-400 mt-2">Source: {r.source}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====== IDEAS ====== */}
      {tab === "💡 Ideas" && (
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Brainstorm & Platform-Scored Ideas</h2>
              <p className="text-sm text-gray-400">Scored per platform — top picks auto-selected by AI using data</p>
            </div>
            <span className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-full font-medium">{ideas.filter(i => i.status === "Selected").length} selected</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {["All","Selected","Brainstormed","Converted to Draft","Rejected"].map(f => (
              <button key={f} onClick={() => setIdeaFilter(f)} className={`text-xs px-3 py-1.5 rounded-full font-medium ${ideaFilter === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{f}</button>
            ))}
          </div>
          {ideas.filter(i => ideaFilter === "All" || i.status === ideaFilter).length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <div className="text-5xl mb-4">💡</div>
              <p className="font-medium text-gray-500">No ideas yet.</p>
              <p className="text-sm text-gray-400 mt-1">Brainstorm engine runs every Monday at 6am PT. Ideas appear here with platform scores.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ideas.filter(i => ideaFilter === "All" || i.status === ideaFilter).map(idea => (
                <div key={idea.id} className={`bg-white rounded-xl border p-4 shadow-sm ${idea.status === "Selected" ? "border-green-200" : "border-gray-100"}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {idea.status === "Selected" && <span className="text-green-600 font-bold">✅</span>}
                        <h3 className="text-sm font-semibold text-gray-800">{idea.idea_title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{idea.concept}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-3 shrink-0">
                      <div className="text-center">
                        <p className="text-xl font-bold text-indigo-600">{idea.predicted_score?.toFixed(1) ?? "—"}</p>
                        <p className="text-xs text-gray-400">Overall</p>
                      </div>
                      <Pill label={idea.status} style={IDEA_STYLE[idea.status] || "bg-gray-100 text-gray-500"} />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">📱 Platform Scores</p>
                    <div className="grid grid-cols-6 gap-2 text-center">
                      {[["X", idea.platform_x_score],["IG", idea.platform_instagram_score],["FB", idea.platform_facebook_score],["LI", idea.platform_linkedin_score],["TT", idea.platform_tiktok_score],["Pin", idea.platform_pinterest_score]].map(([label, score]) => (
                        <div key={label}>
                          <ScoreBadge score={score} />
                          <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                    {idea.best_platform && <p className="text-xs text-indigo-600 mt-2 font-medium">🎯 Best for: {idea.best_platform}</p>}
                  </div>
                  {idea.hook_options && <p className="text-xs text-gray-500 italic mb-2">🎣 {idea.hook_options}</p>}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {idea.pillar && <Pill label={idea.pillar} style={PILLAR_STYLE[idea.pillar] || "bg-gray-100 text-gray-500"} />}
                    {idea.audience && <Pill label={idea.audience} style="bg-gray-100 text-gray-500" />}
                    {idea.format_suggestion && <Pill label={idea.format_suggestion} style="bg-indigo-50 text-indigo-600" />}
                    {idea.seasonal_relevance && <Pill label="🌱 Seasonal" style="bg-emerald-50 text-emerald-600" />}
                  </div>
                  {idea.selection_reasoning && (
                    <div className="bg-yellow-50 rounded-lg p-2">
                      <p className="text-xs text-gray-700"><span className="font-semibold">Why selected:</span> {idea.selection_reasoning}</p>
                    </div>
                  )}
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Trend: {idea.trend_relevance_score || 0}/10</span>
                    <span>Winner Match: {idea.winner_pattern_match || 0}/10</span>
                    <span>Gap Bonus: +{idea.pillar_gap_bonus || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====== QUEUE ====== */}
      {tab === "📋 Queue" && (
        <div className="flex" style={{ height: "calc(100vh - 113px)" }}>
          <div className="w-80 bg-white border-r border-gray-100 flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-gray-700">Content Queue</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">🤖 Autopilot ON</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["All","Approved","Scheduled","Posted","Draft","Rejected"].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusFilter === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {s}{s !== "All" && statusCounts[s] ? ` (${statusCounts[s]})` : ""}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? <div className="p-6 text-center text-gray-400 text-sm">Loading...</div>
                : filteredDrafts.length === 0 ? <div className="p-6 text-center text-gray-400 text-sm">No drafts found.</div>
                : filteredDrafts.map(d => (
                  <div key={d.id} onClick={() => openDraft(d)}
                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-indigo-50 transition-all ${selected?.id === d.id ? "bg-indigo-50 border-l-4 border-l-indigo-500" : ""}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">{d.is_winner && "🏆 "}{d.title}</p>
                      <Pill label={d.status} style={STATUS_STYLE[d.status] || "bg-gray-100 text-gray-500"} extra="shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {d.pillar && <Pill label={d.pillar} style={PILLAR_STYLE[d.pillar] || "bg-gray-100 text-gray-500"} />}
                      {d.audience && <span className="text-xs text-gray-400 truncate">{d.audience}</span>}
                    </div>
                    {d.scheduled_date && <p className="text-xs text-blue-500 mt-1">📅 {new Date(d.scheduled_date).toLocaleDateString()}</p>}
                  </div>
                ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <div className="text-5xl mb-4">🤖</div>
                <p className="text-lg font-medium text-gray-700 mb-1">Autopilot is running</p>
                <p className="text-sm text-gray-400 text-center max-w-xs mb-6">AI generates, scores, approves, schedules, and posts everything. You just observe — or override when needed.</p>
                <div className="bg-white rounded-xl border border-gray-100 p-4 text-left w-full max-w-xs text-xs text-gray-500 space-y-2 shadow-sm">
                  <p className="font-semibold text-gray-700 mb-2">🔄 What runs automatically:</p>
                  <p>✅ Content generated daily at 7am PT</p>
                  <p>✅ Scores calculated (clarity · relatability · conversion)</p>
                  <p>✅ Avg ≥7.0 → auto-approved + scheduled</p>
                  <p>✅ Platform-specific copy selected per channel</p>
                  <p>✅ Posted at optimal times via Ayrshare</p>
                  <p>✅ Performance analyzed every 12hrs</p>
                  <p>✅ Winner DNA extracted every 2 days</p>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto p-6">
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{selected.is_winner && "🏆 "}{selected.title}</h2>
                    <div className="flex gap-2 flex-wrap">
                      <Pill label={selected.status} style={STATUS_STYLE[selected.status] || "bg-gray-100 text-gray-500"} />
                      {selected.pillar && <Pill label={selected.pillar} style={PILLAR_STYLE[selected.pillar] || "bg-gray-100 text-gray-500"} />}
                      {selected.audience && <Pill label={selected.audience} style="bg-gray-100 text-gray-600" />}
                      {selected.week_tag && <Pill label={selected.week_tag} style="bg-indigo-50 text-indigo-600" />}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end shrink-0">
                    {!editing ? (
                      <>
                        <button onClick={() => setEditing(true)} className="text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">✏️ Edit</button>
                        {selected.status === "Approved" && (
                          <button onClick={() => setShowScheduler(true)} className="text-sm px-3 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600">🚀 Publish</button>
                        )}
                        {(selected.status === "Approved" || selected.status === "Draft" || selected.status === "Pending Approval") && (
                          <button onClick={() => { setShowKling(p => !p); setKlingResult(null); }} className="text-sm px-3 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 flex items-center gap-1.5">🎬 Video</button>
                        )}
                        {selected.status === "Posted" && (
                          <button onClick={() => { setPerfEntry({ platform: "", reach: 0, impressions: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, follower_growth: 0, posted_at: new Date().toISOString().slice(0, 10) }); setShowPerfModal(true); }} className="text-sm px-3 py-2 bg-purple-500 text-white rounded-lg font-medium">📊 Log Stats</button>
                        )}
                        {/* Override controls — AI handles approval automatically, these are manual overrides only */}
                        {selected.status === "Draft" && (
                          <button onClick={() => updateStatus(selected.id, "Approved")} className="text-sm px-3 py-2 bg-green-500 text-white rounded-lg font-medium" title="Override: manually approve this draft">⬆️ Force Approve</button>
                        )}
                        {selected.status === "Approved" && (
                          <button onClick={() => updateStatus(selected.id, "Rejected")} className="text-sm px-3 py-2 bg-red-400 text-white rounded-lg font-medium" title="Override: pull this from the queue">🚫 Pull</button>
                        )}
                        {selected.status === "Scheduled" && (
                          <button onClick={() => updateStatus(selected.id, "Posted")} className="text-sm px-3 py-2 bg-purple-500 text-white rounded-lg font-medium">📤 Mark Posted</button>
                        )}
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditing(false)} className="text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">Cancel</button>
                        <button onClick={saveEdit} disabled={saving} className="text-sm px-3 py-2 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50">{saving ? "Saving..." : "💾 Save"}</button>
                      </>
                    )}
                  </div>
                </div>

                {/* Kling Video Generation Panel */}
                {showKling && (
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-5 mb-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-violet-800">🎬 Generate Video with Kling AI</h3>
                        <p className="text-xs text-violet-500 mt-0.5">Creates short-form video from this draft's prompt + scripts</p>
                      </div>
                      <button onClick={() => { setShowKling(false); setKlingResult(null); }} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="text-xs text-violet-700 font-medium block mb-1">Format</label>
                        <div className="flex gap-2">
                          {["9:16","16:9"].map(ar => (
                            <button key={ar} onClick={() => setKlingOpts(p => ({ ...p, aspect_ratio: ar, generate_both: false }))}
                              className={`flex-1 text-xs py-2 rounded-lg font-medium border transition-all ${klingOpts.aspect_ratio === ar && !klingOpts.generate_both ? "bg-violet-600 text-white border-violet-600" : "bg-white text-violet-600 border-violet-200 hover:bg-violet-50"}`}>
                              {ar === "9:16" ? "📱 9:16" : "🖥 16:9"}
                            </button>
                          ))}
                          <button onClick={() => setKlingOpts(p => ({ ...p, generate_both: true }))}
                            className={`flex-1 text-xs py-2 rounded-lg font-medium border transition-all ${klingOpts.generate_both ? "bg-violet-600 text-white border-violet-600" : "bg-white text-violet-600 border-violet-200 hover:bg-violet-50"}`}>
                            ✨ Both
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-violet-700 font-medium block mb-1">Duration</label>
                        <div className="flex gap-2">
                          {[["5","5s"],["10","10s"]].map(([val, label]) => (
                            <button key={val} onClick={() => setKlingOpts(p => ({ ...p, duration: val }))}
                              className={`flex-1 text-xs py-2 rounded-lg font-medium border transition-all ${klingOpts.duration === val ? "bg-violet-600 text-white border-violet-600" : "bg-white text-violet-600 border-violet-200 hover:bg-violet-50"}`}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="text-xs text-violet-700 font-medium block mb-1">Quality</label>
                        <div className="flex gap-2">
                          {[["std","Standard"],["pro","Pro ✨"]].map(([val, label]) => (
                            <button key={val} onClick={() => setKlingOpts(p => ({ ...p, mode: val }))}
                              className={`flex-1 text-xs py-2 rounded-lg font-medium border transition-all ${klingOpts.mode === val ? "bg-violet-600 text-white border-violet-600" : "bg-white text-violet-600 border-violet-200 hover:bg-violet-50"}`}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-violet-700 font-medium block mb-1">Reference Image</label>
                        <button onClick={() => setKlingOpts(p => ({ ...p, use_draft_image: !p.use_draft_image }))}
                          className={`w-full text-xs py-2 rounded-lg font-medium border transition-all ${klingOpts.use_draft_image ? "bg-violet-600 text-white border-violet-600" : "bg-white text-violet-600 border-violet-200 hover:bg-violet-50"}`}>
                          {klingOpts.use_draft_image ? "🖼 Using Draft Image" : "⬜ Text Only"}
                        </button>
                      </div>
                    </div>

                    {/* Prompt preview */}
                    {selected.video_prompt && (
                      <div className="bg-white rounded-lg p-3 mb-4 border border-violet-100">
                        <p className="text-xs font-semibold text-violet-700 mb-1">🎯 Video Prompt</p>
                        <p className="text-xs text-gray-600 line-clamp-3">{selected.video_prompt}</p>
                      </div>
                    )}

                    <button onClick={generateKlingVideo} disabled={klingGenerating}
                      className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                      {klingGenerating ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span>Generating... (up to 6 min)</span>
                        </>
                      ) : (
                        <>🎬 Generate {klingOpts.generate_both ? "Both Formats" : klingOpts.aspect_ratio + " Video"}</>
                      )}
                    </button>

                    {/* Result */}
                    {klingResult && klingResult.videos && (
                      <div className="mt-4 space-y-3">
                        <p className="text-xs font-bold text-violet-800">✅ Videos Ready!</p>
                        {klingResult.videos.map((v, i) => (
                          <div key={i} className="bg-white rounded-xl border border-violet-200 overflow-hidden">
                            <video src={v.video_url} controls className="w-full max-h-64 bg-black" />
                            <div className="p-3 flex items-center justify-between">
                              <span className="text-xs font-medium text-violet-700">{v.aspect_ratio} · {klingResult.duration_seconds}s · {klingResult.mode}</span>
                              <a href={v.video_url} target="_blank" rel="noreferrer"
                                className="text-xs px-3 py-1.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700">
                                ⬇ Download
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Ayrshare Publish Panel */}
                {showScheduler && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-indigo-800">🚀 Publish via Ayrshare</h3>
                      <button onClick={() => setShowScheduler(false)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                    </div>

                    {/* Mode toggle */}
                    <div className="flex gap-2 mb-4">
                      <button onClick={() => setPostMode("now")} className={`text-xs px-4 py-2 rounded-full font-medium ${postMode === "now" ? "bg-indigo-600 text-white" : "bg-white text-indigo-600 border border-indigo-200"}`}>⚡ Post Now</button>
                      <button onClick={() => setPostMode("schedule")} className={`text-xs px-4 py-2 rounded-full font-medium ${postMode === "schedule" ? "bg-indigo-600 text-white" : "bg-white text-indigo-600 border border-indigo-200"}`}>📅 Schedule</button>
                    </div>

                    {postMode === "schedule" && (
                      <div className="mb-4">
                        <label className="text-xs text-indigo-700 font-medium block mb-1">Date & Time</label>
                        <input type="datetime-local" className="border border-indigo-200 rounded-lg px-3 py-2 text-sm w-full bg-white" value={scheduleData.date} onChange={e => setScheduleData(p => ({ ...p, date: e.target.value }))} />
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="text-xs text-indigo-700 font-medium block mb-1">Select Platforms</label>
                      <div className="flex flex-wrap gap-2">
                        {PLATFORM_NAMES.map(pl => (
                          <button key={pl} onClick={() => setScheduleData(p => ({ ...p, platforms: p.platforms.includes(pl) ? p.platforms.filter(x => x !== pl) : [...p.platforms, pl] }))}
                            className={`text-xs px-3 py-2 rounded-lg font-medium transition-all ${scheduleData.platforms.includes(pl) ? "bg-indigo-600 text-white" : "bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50"}`}>
                            {pl}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setScheduleData(p => ({ ...p, platforms: [...PLATFORM_NAMES] }))} className="text-xs text-indigo-500 mt-2 hover:underline">Select all</button>
                    </div>

                    {scheduleData.platforms.length > 0 && (
                      <div className="bg-white rounded-lg p-3 mb-4 border border-indigo-100">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Each platform gets its own copy:</p>
                        {scheduleData.platforms.map(pl => {
                          const key = `platform_${pl.toLowerCase() === "x" ? "x" : pl.toLowerCase()}`;
                          const content = selected[key] || selected.primary_caption || "";
                          return (
                            <div key={pl} className="mb-2">
                              <span className="text-xs font-semibold text-indigo-700">{pl}:</span>
                              <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{content || "No platform-specific copy — will use primary caption"}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <button onClick={() => publishToAyrshare(postMode)} disabled={posting || scheduleData.platforms.length === 0}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all">
                      {posting ? "Publishing..." : postMode === "now" ? `🚀 Post Now to ${scheduleData.platforms.length} platform${scheduleData.platforms.length !== 1 ? "s" : ""}` : `📅 Schedule to ${scheduleData.platforms.length} platform${scheduleData.platforms.length !== 1 ? "s" : ""}`}
                    </button>
                  </div>
                )}

                {/* Perf modal */}
                {showPerfModal && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                    <h3 className="text-sm font-bold text-purple-800 mb-3">📊 Log Performance Stats</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-purple-700 font-medium block mb-1">Platform</label>
                        <select className="border border-purple-200 rounded-lg px-3 py-2 text-sm w-full bg-white" value={perfEntry.platform} onChange={e => setPerfEntry(p => ({ ...p, platform: e.target.value }))}>
                          <option value="">Select...</option>
                          {PLATFORM_NAMES.map(pl => <option key={pl}>{pl}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-purple-700 font-medium block mb-1">Posted Date</label>
                        <input type="date" className="border border-purple-200 rounded-lg px-3 py-2 text-sm w-full bg-white" value={perfEntry.posted_at} onChange={e => setPerfEntry(p => ({ ...p, posted_at: e.target.value }))} />
                      </div>
                      {[["Reach","reach"],["Impressions","impressions"],["Likes","likes"],["Comments","comments"],["Shares","shares"],["Saves","saves"],["Clicks","clicks"],["Followers Gained","follower_growth"]].map(([label, key]) => (
                        <div key={key}>
                          <label className="text-xs text-purple-700 font-medium block mb-1">{label}</label>
                          <input type="number" className="border border-purple-200 rounded-lg px-3 py-2 text-sm w-full bg-white" value={perfEntry[key] || ""} onChange={e => setPerfEntry(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))} />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowPerfModal(false)} className="text-sm px-3 py-2 bg-white text-gray-600 border rounded-lg">Cancel</button>
                      <button onClick={savePerformance} disabled={saving} className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50">{saving ? "..." : "📊 Save Stats"}</button>
                    </div>
                  </div>
                )}

                {(selected.clarity_score || selected.relatability_score || selected.conversion_score) && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-blue-50 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-blue-600">{selected.clarity_score}/10</p><p className="text-xs text-blue-500 font-medium">Clarity</p></div>
                    <div className="bg-violet-50 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-violet-600">{selected.relatability_score}/10</p><p className="text-xs text-violet-500 font-medium">Relatability</p></div>
                    <div className="bg-green-50 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-green-600">{selected.conversion_score}/10</p><p className="text-xs text-green-500 font-medium">Conversion</p></div>
                  </div>
                )}

                {selectedPerfs.length > 0 && (
                  <Section label="Performance Results" icon="📊">
                    {selectedPerfs.map(p => (
                      <div key={p.id} className="mb-4 last:mb-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-800 text-sm">{p.platform}</span>
                          <Pill label={p.performance_label} style={PERF_STYLE[p.performance_label] || "bg-gray-100 text-gray-500"} />
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {[["Reach",p.reach],["Likes",p.likes],["Comments",p.comments],["Shares",p.shares],["Saves",p.saves],["Clicks",p.clicks],["Eng%",(p.engagement_rate||0)+"%"],["Score",(p.performance_score||0)+"/10"]].map(([l,v]) => (
                            <div key={l} className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">{l}</p><p className="text-sm font-bold text-gray-700">{v ?? 0}</p></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </Section>
                )}

                <Section label="Hook" icon="🎣">
                  {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={2} value={editData.hook} onChange={e => setEditData(p => ({ ...p, hook: e.target.value }))} />
                    : <p className="text-gray-800 font-medium text-base italic">"{selected.hook}"</p>}
                </Section>

                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Platform Content</h3>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {PLATFORM_KEYS.map(p => (
                      <button key={p} onClick={() => setActivePlatform(p)}
                        className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${activePlatform === p ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {PI[p]} {PL[p]}
                      </button>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none bg-white" rows={5} value={editData[activePlatform]} onChange={e => setEditData(p => ({ ...p, [activePlatform]: e.target.value }))} />
                      : <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selected[activePlatform] || "No content for this platform yet."}</p>}
                  </div>
                </div>

                <Section label="Captions" icon="📝">
                  <div className="space-y-3">
                    {[["Short Caption","short_caption",2],["Primary Caption","primary_caption",3],["Long Caption","long_caption",4]].map(([label, key, rows]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-400 mb-1 font-medium">{label}</p>
                        {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={rows} value={editData[key]} onChange={e => setEditData(p => ({ ...p, [key]: e.target.value }))} />
                          : <p className="text-gray-700 text-sm">{selected[key]}</p>}
                      </div>
                    ))}
                  </div>
                </Section>

                <Section label="CTAs" icon="🎯">
                  <div className="space-y-2">
                    {["cta_1","cta_2","cta_3"].map((k, i) => (
                      <div key={k} className="flex items-center gap-2">
                        <span className="text-xs bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                        {editing ? <input className="flex-1 border rounded-lg px-3 py-2 text-sm" value={editData[k]} onChange={e => setEditData(p => ({ ...p, [k]: e.target.value }))} />
                          : <p className="text-gray-700 text-sm">{selected[k]}</p>}
                      </div>
                    ))}
                  </div>
                </Section>

                <Section label="Video Scripts" icon="🎬">
                  <div className="space-y-3">
                    {[["15-Second","script_15sec",2],["30-Second","script_30sec",3]].map(([label, key, rows]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-400 mb-1 font-medium">{label}</p>
                        {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={rows} value={editData[key]} onChange={e => setEditData(p => ({ ...p, [key]: e.target.value }))} />
                          : <p className="text-gray-700 text-sm">{selected[key]}</p>}
                      </div>
                    ))}
                  </div>
                </Section>

                <Section label="Creative Prompts" icon="🖼️">
                  <div className="space-y-3">
                    {[["Image Prompt","image_prompt",2],["Video Prompt","video_prompt",2]].map(([label, key, rows]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-400 mb-1 font-medium">{label}</p>
                        {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={rows} value={editData[key]} onChange={e => setEditData(p => ({ ...p, [key]: e.target.value }))} />
                          : <p className="text-gray-700 text-sm">{selected[key]}</p>}
                      </div>
                    ))}
                  </div>
                </Section>

                {(selected.blog_post || editing) && (
                  <Section label="Blog Post" icon="✍️">
                    {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={6} value={editData.blog_post} onChange={e => setEditData(p => ({ ...p, blog_post: e.target.value }))} />
                      : <p className="text-gray-700 text-sm whitespace-pre-wrap">{selected.blog_post}</p>}
                  </Section>
                )}

                <Section label="Editor Notes" icon="💬">
                  {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={3} placeholder="Add notes..." value={editData.editor_notes} onChange={e => setEditData(p => ({ ...p, editor_notes: e.target.value }))} />
                    : <p className="text-gray-500 text-sm italic">{selected.editor_notes || "No notes yet."}</p>}
                </Section>

                {!editing && selected.status === "Draft" && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">⚠️ Below auto-approve threshold</p>
                      <p className="text-xs text-amber-600">AI scored this below 7.0/10. You can force-approve it anyway, or it will be rewritten in the next cycle.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => updateStatus(selected.id, "Approved")} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600">⬆️ Force Approve Anyway</button>
                      <button onClick={() => updateStatus(selected.id, "Rejected")} className="flex-1 py-3 bg-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-300">🗑 Discard</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====== SCHEDULER ====== */}
      {tab === "📅 Scheduler" && (
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Scheduled & Posted Content</h2>
          {["Scheduled","Posted"].map(s => (
            <div key={s} className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{s === "Scheduled" ? "📅" : "✅"} {s}</h3>
              {drafts.filter(d => d.status === s).length === 0
                ? <div className="bg-white rounded-xl border p-6 text-center text-gray-400 text-sm">No {s.toLowerCase()} content yet.</div>
                : drafts.filter(d => d.status === s).map(d => (
                  <div key={d.id} className="bg-white rounded-xl border p-4 mb-3 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{d.is_winner && "🏆 "}{d.title}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {d.pillar && <Pill label={d.pillar} style={PILLAR_STYLE[d.pillar] || "bg-gray-100 text-gray-500"} />}
                        {d.scheduled_platforms && d.scheduled_platforms.split(", ").map(pl => <Pill key={pl} label={pl} style="bg-blue-50 text-blue-600" />)}
                      </div>
                      {d.scheduled_date && <p className="text-xs text-gray-400 mt-1">📅 {new Date(d.scheduled_date).toLocaleString()}</p>}
                    </div>
                    {s === "Posted" && (
                      <button onClick={() => { openDraft(d); setTab("📋 Queue"); setPerfEntry({ platform: "", reach: 0, impressions: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, follower_growth: 0, posted_at: new Date().toISOString().slice(0, 10) }); setShowPerfModal(true); }} className="text-xs px-3 py-1.5 bg-purple-500 text-white rounded-lg font-medium">📊 Log Stats</button>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}

      {/* ====== ANALYTICS ====== */}
      {tab === "📊 Analytics" && (
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Performance Analytics</h2>
          {perfs.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-gray-500 font-medium">No data yet.</p>
              <p className="text-gray-400 text-sm mt-1">Post content, log stats, and analytics will build here automatically.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-indigo-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-indigo-600">{perfs.length}</p><p className="text-xs text-indigo-500 font-medium mt-1">Posts Tracked</p></div>
                <div className="bg-yellow-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{winners.length}</p><p className="text-xs text-yellow-500 font-medium mt-1">🏆 Winners</p></div>
                <div className="bg-green-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-green-600">{(perfs.reduce((a, p) => a + (p.performance_score || 0), 0) / perfs.length).toFixed(1)}/10</p><p className="text-xs text-green-500 font-medium mt-1">Avg Score</p></div>
                <div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-blue-600">{perfs.reduce((a, p) => a + (p.reach || 0), 0).toLocaleString()}</p><p className="text-xs text-blue-500 font-medium mt-1">Total Reach</p></div>
              </div>
              <div className="bg-white rounded-xl border p-5 mb-4 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-4">📌 By Pillar</h3>
                <div className="space-y-3">
                  {Object.entries(pillarStats).sort((a, b) => (b[1].t / b[1].c) - (a[1].t / a[1].c)).map(([p, s]) => (
                    <div key={p} className="flex items-center gap-3">
                      <Pill label={p} style={PILLAR_STYLE[p] || "bg-gray-100 text-gray-500"} extra="w-28 text-center" />
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                        <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${Math.round(s.t / s.c * 10)}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-12 text-right">{(s.t / s.c).toFixed(1)}/10</span>
                      <span className="text-xs text-gray-400">{s.c} posts</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border p-5 mb-4 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-4">📱 By Platform</h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(platStats).map(([p, s]) => (
                    <div key={p} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-gray-700">{(s.t / s.c).toFixed(1)}/10</p>
                      <p className="text-xs text-gray-500 font-medium">{p}</p>
                      <p className="text-xs text-gray-400">{s.c} posts</p>
                    </div>
                  ))}
                </div>
              </div>
              {winners.length > 0 && (
                <div className="bg-white rounded-xl border p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">🏆 Winner Posts</h3>
                  <div className="space-y-3">
                    {winners.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{p.content_title}</p>
                          <div className="flex gap-2 mt-1">
                            {p.platform && <Pill label={p.platform} style="bg-yellow-100 text-yellow-700" />}
                            {p.pillar && <Pill label={p.pillar} style={PILLAR_STYLE[p.pillar] || "bg-gray-100 text-gray-500"} />}
                          </div>
                          {p.hook && <p className="text-xs text-gray-500 italic mt-1">"{p.hook}"</p>}
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-xl font-bold text-yellow-600">{p.performance_score}/10</p>
                          <p className="text-xs text-gray-400">Eng: {p.engagement_rate}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ====== WINNER DNA ====== */}
      {tab === "🧬 Winner DNA" && (
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Winner DNA Patterns</h2>
            <p className="text-sm text-gray-400">Extracted from 8+ scoring posts — feeds into future brainstorms</p>
          </div>
          {dna.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <div className="text-5xl mb-4">🧬</div>
              <p className="text-gray-500 font-medium">No winner DNA yet.</p>
              <p className="text-gray-400 text-sm mt-1">Posts scoring 8+ get their patterns extracted here automatically.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dna.map(w => (
                <div key={w.id} className="bg-white rounded-xl border border-yellow-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800">🏆 {w.title}</h3>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xl font-bold text-yellow-600">{w.avg_score}/10</p>
                      <p className="text-xs text-gray-400">Reach: {w.total_reach?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {[["Hook Style",w.winning_hook_style],["Pillar",w.winning_pillar],["Audience",w.winning_audience],["Format",w.winning_format],["Top Platform",w.winning_platform],["CTA Style",w.winning_cta_style],["Emotional Trigger",w.emotional_trigger],["Times Reused",`${w.reuse_count || 0}x`]].filter(([,v]) => v).map(([l, v]) => (
                      <div key={l} className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-400">{l}</p>
                        <p className="text-sm font-medium text-gray-700">{v}</p>
                      </div>
                    ))}
                  </div>
                  {w.key_phrases && <div className="bg-yellow-50 rounded-lg p-2 mb-2"><p className="text-xs text-yellow-600 font-medium mb-1">Key Phrases</p><p className="text-sm text-gray-700">{w.key_phrases}</p></div>}
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
