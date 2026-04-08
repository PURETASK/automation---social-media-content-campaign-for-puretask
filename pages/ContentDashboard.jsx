import { useState, useEffect } from "react";
import { ContentDraft } from "@/api/entities";

const PLATFORMS = ["platform_x", "platform_instagram", "platform_facebook", "platform_linkedin", "platform_tiktok", "platform_pinterest"];
const PLATFORM_LABELS = { platform_x: "X", platform_instagram: "Instagram", platform_facebook: "Facebook", platform_linkedin: "LinkedIn", platform_tiktok: "TikTok", platform_pinterest: "Pinterest" };
const PLATFORM_ICONS = { platform_x: "𝕏", platform_instagram: "📸", platform_facebook: "👤", platform_linkedin: "💼", platform_tiktok: "🎵", platform_pinterest: "📌" };
const STATUS_COLORS = { Draft: "bg-gray-100 text-gray-600", "Pending Approval": "bg-yellow-100 text-yellow-700", Approved: "bg-green-100 text-green-700", Rejected: "bg-red-100 text-red-600", Scheduled: "bg-blue-100 text-blue-700", Posted: "bg-purple-100 text-purple-700" };
const PILLAR_COLORS = { Convenience: "bg-blue-50 text-blue-600", Trust: "bg-green-50 text-green-600", Transformation: "bg-violet-50 text-violet-600", Recruitment: "bg-orange-50 text-orange-600", Local: "bg-teal-50 text-teal-600", Proof: "bg-pink-50 text-pink-600" };

export default function ContentDashboard() {
  const [drafts, setDrafts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [activePlatform, setActivePlatform] = useState("platform_instagram");
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchDrafts(); }, []);
  useEffect(() => { applyFilters(); }, [drafts, statusFilter, platformFilter]);

  async function fetchDrafts() {
    setLoading(true);
    try {
      const data = await ContentDraft.list("-created_date");
      setDrafts(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  function applyFilters() {
    let result = [...drafts];
    if (statusFilter !== "All") result = result.filter(d => d.status === statusFilter);
    setFiltered(result);
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function updateStatus(id, status) {
    setSaving(true);
    await ContentDraft.update(id, { status });
    await fetchDrafts();
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    setSaving(false);
    showToast(status === "Approved" ? "✅ Content approved!" : status === "Rejected" ? "❌ Content rejected." : `Status updated to ${status}`);
  }

  async function saveEdit() {
    setSaving(true);
    await ContentDraft.update(selected.id, editData);
    await fetchDrafts();
    setSelected(prev => ({ ...prev, ...editData }));
    setEditing(false);
    setSaving(false);
    showToast("💾 Changes saved!");
  }

  function openDraft(draft) {
    setSelected(draft);
    setEditData({
      title: draft.title || "",
      hook: draft.hook || "",
      primary_caption: draft.primary_caption || "",
      short_caption: draft.short_caption || "",
      long_caption: draft.long_caption || "",
      cta_1: draft.cta_1 || "",
      cta_2: draft.cta_2 || "",
      cta_3: draft.cta_3 || "",
      platform_x: draft.platform_x || "",
      platform_instagram: draft.platform_instagram || "",
      platform_facebook: draft.platform_facebook || "",
      platform_linkedin: draft.platform_linkedin || "",
      platform_tiktok: draft.platform_tiktok || "",
      platform_pinterest: draft.platform_pinterest || "",
      blog_post: draft.blog_post || "",
      image_prompt: draft.image_prompt || "",
      video_prompt: draft.video_prompt || "",
      script_15sec: draft.script_15sec || "",
      script_30sec: draft.script_30sec || "",
      editor_notes: draft.editor_notes || "",
    });
    setEditing(false);
    setActivePlatform("platform_instagram");
  }

  const statusCounts = drafts.reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {});

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">P</div>
          <div>
            <h1 className="text-base font-bold text-gray-900">PureTask Content Studio</h1>
            <p className="text-xs text-gray-400">Review, edit & approve your social content</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">{statusCounts["Pending Approval"] || 0} pending</span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">{statusCounts["Approved"] || 0} approved</span>
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">{statusCounts["Posted"] || 0} posted</span>
        </div>
      </div>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-100 flex flex-col">
          {/* Filters */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-wrap gap-1.5">
              {["All", "Pending Approval", "Approved", "Rejected", "Scheduled", "Posted", "Draft"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${statusFilter === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {s} {s !== "All" && statusCounts[s] ? `(${statusCounts[s]})` : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Draft List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-400 text-sm">Loading content...</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No content found.</div>
            ) : filtered.map(draft => (
              <div key={draft.id} onClick={() => openDraft(draft)}
                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-indigo-50 transition-all ${selected?.id === draft.id ? "bg-indigo-50 border-l-4 border-l-indigo-500" : ""}`}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">{draft.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${STATUS_COLORS[draft.status] || "bg-gray-100 text-gray-500"}`}>{draft.status}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {draft.pillar && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PILLAR_COLORS[draft.pillar] || "bg-gray-100 text-gray-500"}`}>{draft.pillar}</span>}
                  {draft.audience && <span className="text-xs text-gray-400 truncate">{draft.audience}</span>}
                </div>
                {draft.week_tag && <p className="text-xs text-gray-400 mt-1">{draft.week_tag}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-lg font-medium text-gray-500">Select a content draft</p>
              <p className="text-sm mt-1">Review, edit, and approve your social content</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto p-6">
              {/* Draft Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{selected.title}</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
                    {selected.pillar && <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PILLAR_COLORS[selected.pillar]}`}>{selected.pillar}</span>}
                    {selected.audience && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{selected.audience}</span>}
                    {selected.week_tag && <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">{selected.week_tag}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!editing ? (
                    <>
                      <button onClick={() => setEditing(true)} className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all">✏️ Edit</button>
                      {selected.status !== "Approved" && (
                        <button onClick={() => updateStatus(selected.id, "Approved")} className="text-sm px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-all">✅ Approve</button>
                      )}
                      {selected.status !== "Rejected" && (
                        <button onClick={() => updateStatus(selected.id, "Rejected")} className="text-sm px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-all">❌ Reject</button>
                      )}
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditing(false)} className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
                      <button onClick={saveEdit} disabled={saving} className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50">
                        {saving ? "Saving..." : "💾 Save Changes"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Scores */}
              {(selected.clarity_score || selected.relatability_score || selected.conversion_score) && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[["Clarity", selected.clarity_score, "blue"], ["Relatability", selected.relatability_score, "violet"], ["Conversion", selected.conversion_score, "green"]].map(([label, score, color]) => (
                    <div key={label} className={`bg-${color}-50 rounded-xl p-3 text-center`}>
                      <p className={`text-2xl font-bold text-${color}-600`}>{score}/10</p>
                      <p className={`text-xs text-${color}-500 font-medium`}>{label}</p>
                    </div>
                  ))}
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
                  {editing
                    ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none bg-white" rows={5} value={editData[activePlatform]} onChange={e => setEditData(p => ({...p, [activePlatform]: e.target.value}))} />
                    : <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selected[activePlatform] || "No content for this platform yet."}</p>
                  }
                </div>
              </div>

              {/* Captions */}
              <Section label="Captions" icon="📝">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1 font-medium">Short Caption</p>
                    {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={2} value={editData.short_caption} onChange={e => setEditData(p => ({...p, short_caption: e.target.value}))} /> : <p className="text-gray-700 text-sm">{selected.short_caption}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1 font-medium">Primary Caption</p>
                    {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={3} value={editData.primary_caption} onChange={e => setEditData(p => ({...p, primary_caption: e.target.value}))} /> : <p className="text-gray-700 text-sm">{selected.primary_caption}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1 font-medium">Long Caption</p>
                    {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={4} value={editData.long_caption} onChange={e => setEditData(p => ({...p, long_caption: e.target.value}))} /> : <p className="text-gray-700 text-sm">{selected.long_caption}</p>}
                  </div>
                </div>
              </Section>

              {/* CTAs */}
              <Section label="CTAs" icon="🎯">
                <div className="space-y-2">
                  {["cta_1","cta_2","cta_3"].map((k, i) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-xs bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">{i+1}</span>
                      {editing ? <input className="flex-1 border rounded-lg px-3 py-2 text-sm" value={editData[k]} onChange={e => setEditData(p => ({...p, [k]: e.target.value}))} /> : <p className="text-gray-700 text-sm">{selected[k]}</p>}
                    </div>
                  ))}
                </div>
              </Section>

              {/* Video Scripts */}
              <Section label="Video Scripts" icon="🎬">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1 font-medium">15-Second Script</p>
                    {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={2} value={editData.script_15sec} onChange={e => setEditData(p => ({...p, script_15sec: e.target.value}))} /> : <p className="text-gray-700 text-sm">{selected.script_15sec}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1 font-medium">30-Second Script</p>
                    {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={3} value={editData.script_30sec} onChange={e => setEditData(p => ({...p, script_30sec: e.target.value}))} /> : <p className="text-gray-700 text-sm">{selected.script_30sec}</p>}
                  </div>
                </div>
              </Section>

              {/* Image / Video Prompts */}
              <Section label="Creative Prompts" icon="🖼️">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1 font-medium">Image Prompt</p>
                    {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={2} value={editData.image_prompt} onChange={e => setEditData(p => ({...p, image_prompt: e.target.value}))} /> : <p className="text-gray-700 text-sm">{selected.image_prompt}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1 font-medium">Video Prompt</p>
                    {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={2} value={editData.video_prompt} onChange={e => setEditData(p => ({...p, video_prompt: e.target.value}))} /> : <p className="text-gray-700 text-sm">{selected.video_prompt}</p>}
                  </div>
                </div>
              </Section>

              {/* Blog Post */}
              {(selected.blog_post || editing) && (
                <Section label="Blog Post" icon="✍️">
                  {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={6} value={editData.blog_post} onChange={e => setEditData(p => ({...p, blog_post: e.target.value}))} /> : <p className="text-gray-700 text-sm whitespace-pre-wrap">{selected.blog_post}</p>}
                </Section>
              )}

              {/* Editor Notes */}
              <Section label="Editor Notes" icon="💬">
                {editing ? <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={3} placeholder="Add notes for this draft..." value={editData.editor_notes} onChange={e => setEditData(p => ({...p, editor_notes: e.target.value}))} /> : <p className="text-gray-500 text-sm italic">{selected.editor_notes || "No notes yet."}</p>}
              </Section>

              {/* Approve / Reject bottom bar */}
              {!editing && selected.status === "Pending Approval" && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                  <button onClick={() => updateStatus(selected.id, "Approved")} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all text-sm">✅ Approve This Content</button>
                  <button onClick={() => updateStatus(selected.id, "Rejected")} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all text-sm">❌ Reject This Content</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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
