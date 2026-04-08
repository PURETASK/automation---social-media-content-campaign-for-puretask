import { useState, useEffect } from "react";
import { ContentDraft, PostPerformance } from "@/api/entities";

const PLATFORMS = ["platform_x", "platform_instagram", "platform_facebook", "platform_linkedin", "platform_tiktok", "platform_pinterest"];
const PLATFORM_LABELS = { platform_x: "X", platform_instagram: "Instagram", platform_facebook: "Facebook", platform_linkedin: "LinkedIn", platform_tiktok: "TikTok", platform_pinterest: "Pinterest" };
const PLATFORM_ICONS = { platform_x: "𝕏", platform_instagram: "📸", platform_facebook: "👤", platform_linkedin: "💼", platform_tiktok: "🎵", platform_pinterest: "📌" };
const PLATFORM_NAMES = ["Facebook", "Instagram", "TikTok", "LinkedIn", "X", "Pinterest"];
const STATUS_COLORS = { Draft: "bg-gray-100 text-gray-600", "Pending Approval": "bg-yellow-100 text-yellow-700", Approved: "bg-green-100 text-green-700", Rejected: "bg-red-100 text-red-600", Scheduled: "bg-blue-100 text-blue-700", Posted: "bg-purple-100 text-purple-700" };
const PILLAR_COLORS = { Convenience: "bg-blue-50 text-blue-600", Trust: "bg-green-50 text-green-600", Transformation: "bg-violet-50 text-violet-600", Recruitment: "bg-orange-50 text-orange-600", Local: "bg-teal-50 text-teal-600", Proof: "bg-pink-50 text-pink-600" };
const PERF_COLORS = { Winner: "bg-yellow-100 text-yellow-700", Good: "bg-green-100 text-green-700", Average: "bg-blue-100 text-blue-600", Underperformer: "bg-red-100 text-red-600", Pending: "bg-gray-100 text-gray-500" };

const TABS = ["📋 Queue", "📅 Scheduler", "📊 Analytics"];

export default function ContentDashboard() {
  const [activeTab, setActiveTab] = useState("📋 Queue");
  const [drafts, setDrafts] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [activePlatform, setActivePlatform] = useState("platform_instagram");
  const [toast, setToast] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleData, setScheduleData] = useState({ date: "", platforms: [] });
  const [showPerfModal, setShowPerfModal] = useState(false);
  const [perfEntry, setPerfEntry] = useState({});

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [d, p] = await Promise.all([ContentDraft.list("-created_date"), PostPerformance.list("-posted_at")]);
      setDrafts(d); setPerformances(p);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const filtered = drafts.filter(d => statusFilter === "All" || d.status === statusFilter);
  const statusCounts = drafts.reduce((a, d) => { a[d.status] = (a[d.status] || 0) + 1; return a; }, {});

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

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
    showToast("💾 Changes saved!");
  }

  async function schedulePost() {
    if (!scheduleData.date || scheduleData.platforms.length === 0) { showToast("Pick a date and at least one platform", "error"); return; }
    setSaving(true);
    await ContentDraft.update(selected.id, { status: "Scheduled", scheduled_date: scheduleData.date, scheduled_platforms: scheduleData.platforms.join(", ") });
    await fetchAll();
    setSelected(p => ({ ...p, status: "Scheduled", scheduled_date: scheduleData.date, scheduled_platforms: scheduleData.platforms.join(", ") }));
    setShowScheduler(false); setSaving(false);
    showToast("📅 Post scheduled!");
  }

  async function savePerformance() {
    if (!perfEntry.platform) { showToast("Select a platform", "error"); return; }
    setSaving(true);
    const eng = perfEntry.reach > 0 ? (((perfEntry.likes || 0) + (perfEntry.comments || 0) + (perfEntry.shares || 0)) / perfEntry.reach * 100).toFixed(2) : 0;
    const score = Math.min(10, Math.round(
      ((perfEntry.likes || 0) * 1 + (perfEntry.comments || 0) * 2 + (perfEntry.shares || 0) * 3 + (perfEntry.saves || 0) * 2 + (perfEntry.clicks || 0) * 2) / 10
    ));
    const label = score >= 8 ? "Winner" : score >= 6 ? "Good" : score >= 4 ? "Average" : "Underperformer";
    await PostPerformance.create({
      ...perfEntry, content_draft_id: selected.id, content_title: selected.title,
      pillar: selected.pillar, audience: selected.audience, hook: selected.hook,
      week_tag: selected.week_tag, campaign_tag: selected.campaign_tag,
      engagement_rate: parseFloat(eng), performance_score: score, performance_label: label, analyzed: true
    });
    if (label === "Winner") await ContentDraft.update(selected.id, { is_winner: true, avg_performance_score: score });
    await fetchAll();
    setShowPerfModal(false); setPerfEntry({});
    setSaving(false);
    showToast(`📊 Performance logged! Rated: ${label}`);
  }

  function openDraft(draft) {
    setSelected(draft); setEditing(false); setShowScheduler(false); setShowPerfModal(false);
    setActivePlatform("platform_instagram");
    setEditData({ title: draft.title || "", hook: draft.hook || "", primary_caption: draft.primary_caption || "", short_caption: draft.short_caption || "", long_caption: draft.long_caption || "", cta_1: draft.cta_1 || "", cta_2: draft.cta_2 || "", cta_3: draft.cta_3 || "", platform_x: draft.platform_x || "", platform_instagram: draft.platform_instagram || "", platform_facebook: draft.platform_facebook || "", platform_linkedin: draft.platform_linkedin || "", platform_tiktok: draft.platform_tiktok || "", platform_pinterest: draft.platform_pinterest || "", blog_post: draft.blog_post || "", image_prompt: draft.image_prompt || "", video_prompt: draft.video_prompt || "", script_15sec: draft.script_15sec || "", script_30sec: draft.script_30sec || "", editor_notes: draft.editor_notes || "" });
    setScheduleData({ date: draft.scheduled_date || "", platforms: draft.scheduled_platforms ? draft.scheduled_platforms.split(", ") : [] });
  }

  // Analytics computed
  const winners = performances.filter(p => p.performance_label === "Winner");
  const pillarStats = performances.reduce((acc, p) => {
    if (!p.pillar) return acc;
    if (!acc[p.pillar]) acc[p.pillar] = { total: 0, count: 0 };
    acc[p.pillar].total += p.performance_score || 0;
    acc[p.pillar].count += 1;
    return acc;
  }, {});
  const platformStats = performances.reduce((acc, p) => {
    if (!acc[p.platform]) acc[p.platform] = { total: 0, count: 0 };
    acc[p.platform].total += p.performance_score || 0;
    acc[p.platform].count += 1;
    return acc;
  }, {});

  const draftPerfs = selected ? performances.filter(p => p.content_draft_id === selected.id) : [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {toast && <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">P</div>
          <div>
            <h1 className="text-base font-bold text-gray-900">PureTask Content Studio</h1>
            <p className="text-xs text-gray-400">Generate · Schedule · Analyze</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">{statusCounts["Pending Approval"] || 0} pending</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{statusCounts["Scheduled"] || 0} scheduled</span>
          <span className="bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full font-medium">🏆 {winners.length} winners</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-6">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* QUEUE TAB */}
      {activeTab === "📋 Queue" && (
        <div className="flex h-[calc(100vh-113px)]">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-wrap gap-1.5">
                {["All", "Pending Approval", "Approved", "Scheduled", "Posted", "Rejected"].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${statusFilter === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {s} {s !== "All" && statusCounts[s] ? `(${statusCounts[s]})` : ""}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? <div className="p-6 text-center text-gray-400 text-sm">Loading...</div>
                : filtered.length === 0 ? <div className="p-6 text-center text-gray-400 text-sm">No drafts found.</div>
                : filtered.map(draft => (
                  <div key={draft.id} onClick={() => openDraft(draft)}
                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-indigo-50 transition-all ${selected?.id === draft.id ? "bg-indigo-50 border-l-4 border-l-indigo-500" : ""}`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">
                        {draft.is_winner && "🏆 "}{draft.title}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${STATUS_COLORS[draft.status] || "bg-gray-100 text-gray-500"}`}>{draft.status}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {draft.pillar && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PILLAR_COLORS[draft.pillar]}`}>{draft.pillar}</span>}
                      {draft.audience && <span className="text-xs text-gray-400 truncate">{draft.audience}</span>}
                    </div>
                    {draft.scheduled_date && <p className="text-xs text-blue-500 mt-1">📅 {new Date(draft.scheduled_date).toLocaleDateString()}</p>}
                  </div>
                ))}
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 overflow-y-auto">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-lg font-medium text-gray-500">Select a content draft</p>
                <p className="text-sm mt-1">Review, edit, schedule, and analyze your content</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selected.is_winner && "🏆 "}{selected.title}</h2>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
                      {selected.pillar && <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PILLAR_COLORS[selected.pillar]}`}>{selected.pillar}</span>}
                      {selected.audience && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{selected.audience}</span>}
                      {selected.week_tag && <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">{selected.week_tag}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {!editing ? (
                      <>
                        <button onClick={() => setEditing(true)} className="text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">✏️ Edit</button>
                        {selected.status === "Approved" && <button onClick={() => setShowScheduler(true)} className="text-sm px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">📅 Schedule</button>}
                        {selected.status === "Posted" && <button onClick={() => { setPerfEntry({ platform: "", reach: 0, impressions: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, video_completion_rate: 0, follower_growth: 0, posted_at: new Date().toISOString().slice(0,10) }); setShowPerfModal(true); }} className="text-sm px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium">📊 Log Stats</button>}
                        {selected.status !== "Approved" && selected.status !== "Scheduled" && selected.status !== "Posted" && (
                          <button onClick={() => updateStatus(selected.id, "Approved")} className="text-sm px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">✅ Approve</button>
                        )}
                        {selected.status !== "Rejected" && selected.status !== "Posted" && (
                          <button onClick={() => updateStatus(selected.id, "Rejected")} className="text-sm px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">❌ Reject</button>
                        )}
                        {selected.status === "Scheduled" && <button onClick={() => updateStatus(selected.id, "Posted")} className="text-sm px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium">📤 Mark Posted</button>}
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditing(false)} className="text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">Cancel</button>
                        <button onClick={saveEdit} disabled={saving} className="text-sm px-3 py-2 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50">{saving ? "Saving..." : "💾 Save"}</button>
                      </>
                    )}
                  </div>
                </div>

                {/* Schedule modal */}
                {showScheduler && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <h3 className="text-sm font-bold text-blue-800 mb-3">📅 Schedule This Post</h3>
                    <div className="mb-3">
                      <label className="text-xs text-blue-700 font-medium block mb-1">Date & Time</label>
                      <input type="datetime-local" className="border border-blue-200 rounded-lg px-3 py-2 text-sm w-full" value={scheduleData.date} onChange={e => setScheduleData(p => ({...p, date: e.target.value}))} />
                    </div>
                    <div className="mb-3">
                      <label className="text-xs text-blue-700 font-medium block mb-1">Platforms</label>
                      <div className="flex flex-wrap gap-2">
                        {PLATFORM_NAMES.map(pl => (
                          <button key={pl} onClick={() => setScheduleData(p => ({ ...p, platforms: p.platforms.includes(pl) ? p.platforms.filter(x => x !== pl) : [...p.platforms, pl] }))}
                            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${scheduleData.platforms.includes(pl) ? "bg-blue-600 text-white" : "bg-white text-blue-600 border border-blue-200"}`}>{pl}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowScheduler(false)} className="text-sm px-3 py-2 bg-white text-gray-600 border rounded-lg">Cancel</button>
                      <button onClick={schedulePost} disabled={saving} className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">{saving ? "Scheduling..." : "📅 Confirm Schedule"}</button>
                    </div>
                  </div>
                )}

                {/* Perf log modal */}
                {showPerfModal && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                    <h3 className="text-sm font-bold text-purple-800 mb-3">📊 Log Post Performance</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-purple-700 font-medium block mb-1">Platform</label>
                        <select className="border border-purple-200 rounded-lg px-3 py-2 text-sm w-full" value={perfEntry.platform} onChange={e => setPerfEntry(p => ({...p, platform: e.target.value}))}>
                          <option value="">Select...</option>
                          {PLATFORM_NAMES.map(pl => <option key={pl}>{pl}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-purple-700 font-medium block mb-1">Posted Date</label>
                        <input type="date" className="border border-purple-200 rounded-lg px-3 py-2 text-sm w-full" value={perfEntry.posted_at} onChange={e => setPerfEntry(p => ({...p, posted_at: e.target.value}))} />
                      </div>
                      {[["Reach", "reach"], ["Impressions", "impressions"], ["Likes", "likes"], ["Comments", "comments"], ["Shares", "shares"], ["Saves", "saves"], ["Clicks", "clicks"], ["Followers Gained", "follower_growth"]].map(([label, key]) => (
                        <div key={key}>
                          <label className="text-xs text-purple-700 font-medium block mb-1">{label}</label>
                          <input type="number" className="border border-purple-200 rounded-lg px-3 py-2 text-sm w-full" value={perfEntry[key] || ""} onChange={e => setPerfEntry(p => ({...p, [key]: parseFloat(e.target.value) || 0}))} />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowPerfModal(false)} className="text-sm px-3 py-2 bg-white text-gray-600 border rounded-lg">Cancel</button>
                      <button onClick={savePerformance} disabled={saving} className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50">{saving ? "Saving..." : "📊 Save Stats"}</button>
                    </div>
                  </div>
                )}

                {/* Scores */}
                {(selected.clarity_score || selected.relatability_score || selected.conversion_score) && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[["Clarity", selected.clarity_score, "blue"], ["Relatability", selected.relatability_score, "violet"], ["Conversion", selected.conversion_score, "green"]].map(([l, s, c]) => (
                      <div key={l} className={`bg-${c}-50 rounded-xl p-3 text-center`}>
                        <p className={`text-2xl font-bold text-${c}-600`}>{s}/10</p>
                        <p className={`text-xs text-${c}-500 font-medium`}>{l}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Performance results for this draft */}
                {draftPerfs.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">📊 Performance Results</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {draftPerfs.map(p => (
                        <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-800 text-sm">{p.platform}</span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PERF_COLORS[p.performance_label]}`}>{p.performance_label}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            {[["Reach", p.reach], ["Likes", p.likes], ["Comments", p.comments], ["Shares", p.shares], ["Saves", p.saves], ["Clicks", p.clicks], ["Eng%", p.engagement_rate + "%"], ["Score", p.performance_score + "/10"]].map(([l, v]) => (
                              <div key={l} className="bg-gray-50 rounded-lg p-2">
                                <p className="text-xs text-gray-400">{l}</p>
                                <p className="text-sm font-bold text-gray-700">{v || 0}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hook */}
                <Section label="Hook" icon="🎣">
                  {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={2} value={editData.hook} onChange={e => setEditData(p => ({...p, hook: e.target.value}))} /> : <p className="text-gray-800 font-medium text-base italic">"{selected.hook}"</p>}
                </Section>

                {/* Platform Tabs */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Platform Content</h3>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {PLATFORMS.map(p => (
                      <button key={p} onClick={() => setActivePlatform(p)}
                        className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${activePlatform === p ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {PLATFORM_ICONS[p]} {PLATFORM_LABELS[p]}
                      </button>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none bg-white" rows={5} value={editData[activePlatform]} onChange={e => setEditData(p => ({...p, [activePlatform]: e.target.value}))} />
                      : <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selected[activePlatform] || "No content for this platform yet."}</p>}
                  </div>
                </div>

                {/* Captions */}
                <Section label="Captions" icon="📝">
                  <div className="space-y-3">
                    {[["Short Caption", "short_caption", 2], ["Primary Caption", "primary_caption", 3], ["Long Caption", "long_caption", 4]].map(([label, key, rows]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-400 mb-1 font-medium">{label}</p>
                        {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={rows} value={editData[key]} onChange={e => setEditData(p => ({...p, [key]: e.target.value}))} />
                          : <p className="text-gray-700 text-sm">{selected[key]}</p>}
                      </div>
                    ))}
                  </div>
                </Section>

                {/* CTAs */}
                <Section label="CTAs" icon="🎯">
                  <div className="space-y-2">
                    {["cta_1", "cta_2", "cta_3"].map((k, i) => (
                      <div key={k} className="flex items-center gap-2">
                        <span className="text-xs bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                        {editing ? <input className="flex-1 border rounded-lg px-3 py-2 text-sm" value={editData[k]} onChange={e => setEditData(p => ({...p, [k]: e.target.value}))} />
                          : <p className="text-gray-700 text-sm">{selected[k]}</p>}
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Scripts */}
                <Section label="Video Scripts" icon="🎬">
                  <div className="space-y-3">
                    {[["15-Second Script", "script_15sec", 2], ["30-Second Script", "script_30sec", 3]].map(([label, key, rows]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-400 mb-1 font-medium">{label}</p>
                        {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={rows} value={editData[key]} onChange={e => setEditData(p => ({...p, [key]: e.target.value}))} />
                          : <p className="text-gray-700 text-sm">{selected[key]}</p>}
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Creative Prompts */}
                <Section label="Creative Prompts" icon="🖼️">
                  <div className="space-y-3">
                    {[["Image Prompt", "image_prompt", 2], ["Video Prompt", "video_prompt", 2]].map(([label, key, rows]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-400 mb-1 font-medium">{label}</p>
                        {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={rows} value={editData[key]} onChange={e => setEditData(p => ({...p, [key]: e.target.value}))} />
                          : <p className="text-gray-700 text-sm">{selected[key]}</p>}
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Blog */}
                {(selected.blog_post || editing) && (
                  <Section label="Blog Post" icon="✍️">
                    {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={6} value={editData.blog_post} onChange={e => setEditData(p => ({...p, blog_post: e.target.value}))} />
                      : <p className="text-gray-700 text-sm whitespace-pre-wrap">{selected.blog_post}</p>}
                  </Section>
                )}

                {/* Notes */}
                <Section label="Editor Notes" icon="💬">
                  {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={3} placeholder="Add notes..." value={editData.editor_notes} onChange={e => setEditData(p => ({...p, editor_notes: e.target.value}))} />
                    : <p className="text-gray-500 text-sm italic">{selected.editor_notes || "No notes yet."}</p>}
                </Section>

                {/* Bottom action bar */}
                {!editing && selected.status === "Pending Approval" && (
                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                    <button onClick={() => updateStatus(selected.id, "Approved")} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 text-sm">✅ Approve</button>
                    <button onClick={() => updateStatus(selected.id, "Rejected")} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 text-sm">❌ Reject</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCHEDULER TAB */}
      {activeTab === "📅 Scheduler" && (
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Scheduled & Posted Content</h2>
          {["Scheduled", "Posted"].map(s => (
            <div key={s} className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{s === "Scheduled" ? "📅" : "✅"} {s}</h3>
              {drafts.filter(d => d.status === s).length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400 text-sm">{s === "Scheduled" ? "No posts scheduled yet. Approve content and schedule it." : "No posted content yet."}</div>
              ) : drafts.filter(d => d.status === s).map(draft => (
                <div key={draft.id} className="bg-white rounded-xl border border-gray-100 p-4 mb-3 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{draft.is_winner && "🏆 "}{draft.title}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {draft.pillar && <span className={`text-xs px-2 py-0.5 rounded-full ${PILLAR_COLORS[draft.pillar]}`}>{draft.pillar}</span>}
                      {draft.scheduled_platforms && draft.scheduled_platforms.split(", ").map(pl => (
                        <span key={pl} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{pl}</span>
                      ))}
                    </div>
                    {draft.scheduled_date && <p className="text-xs text-gray-400 mt-1">📅 {new Date(draft.scheduled_date).toLocaleString()}</p>}
                  </div>
                  <div className="flex gap-2">
                    {s === "Scheduled" && <button onClick={() => updateStatus(draft.id, "Posted")} className="text-xs px-3 py-1.5 bg-purple-500 text-white rounded-lg font-medium">Mark Posted</button>}
                    {s === "Posted" && <button onClick={() => { openDraft(draft); setActiveTab("📋 Queue"); setPerfEntry({ platform: "", reach: 0, impressions: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, video_completion_rate: 0, follower_growth: 0, posted_at: new Date().toISOString().slice(0,10) }); setShowPerfModal(true); }} className="text-xs px-3 py-1.5 bg-purple-500 text-white rounded-lg font-medium">📊 Log Stats</button>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === "📊 Analytics" && (
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Performance Analytics</h2>

          {performances.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-gray-500 font-medium">No performance data yet.</p>
              <p className="text-gray-400 text-sm mt-1">Once you post content and log stats, your analytics will appear here.</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  ["Total Posts Tracked", performances.length, "indigo"],
                  ["🏆 Winners", winners.length, "yellow"],
                  ["Avg Score", (performances.reduce((a, p) => a + (p.performance_score || 0), 0) / performances.length).toFixed(1) + "/10", "green"],
                  ["Total Reach", performances.reduce((a, p) => a + (p.reach || 0), 0).toLocaleString(), "blue"]
                ].map(([label, val, color]) => (
                  <div key={label} className={`bg-${color}-50 rounded-xl p-4 text-center`}>
                    <p className={`text-2xl font-bold text-${color}-600`}>{val}</p>
                    <p className={`text-xs text-${color}-500 font-medium mt-1`}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Pillar breakdown */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-4">📌 Performance by Pillar</h3>
                <div className="space-y-3">
                  {Object.entries(pillarStats).sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count)).map(([pillar, stat]) => {
                    const avg = (stat.total / stat.count).toFixed(1);
                    const pct = Math.round((stat.total / stat.count) * 10);
                    return (
                      <div key={pillar} className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium w-28 text-center ${PILLAR_COLORS[pillar]}`}>{pillar}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                          <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="text-sm font-bold text-gray-700 w-12 text-right">{avg}/10</span>
                        <span className="text-xs text-gray-400">{stat.count} posts</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Platform breakdown */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-4">📱 Performance by Platform</h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(platformStats).map(([platform, stat]) => {
                    const avg = (stat.total / stat.count).toFixed(1);
                    return (
                      <div key={platform} className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-gray-700">{avg}/10</p>
                        <p className="text-xs text-gray-500 font-medium">{platform}</p>
                        <p className="text-xs text-gray-400">{stat.count} posts</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Winners feed */}
              {winners.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">🏆 Winner Posts — What's Working</h3>
                  <div className="space-y-3">
                    {winners.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{p.content_title}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{p.platform}</span>
                            {p.pillar && <span className={`text-xs px-2 py-0.5 rounded-full ${PILLAR_COLORS[p.pillar]}`}>{p.pillar}</span>}
                          </div>
                          {p.hook && <p className="text-xs text-gray-500 italic mt-1">"{p.hook}"</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-yellow-600">{p.performance_score}/10</p>
                          <p className="text-xs text-gray-400">Reach: {p.reach?.toLocaleString() || 0}</p>
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
    </div>
  );
}

function Section({ label, icon, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{icon} {label}</h3>
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">{children}</div>
    </div>
  );
}
