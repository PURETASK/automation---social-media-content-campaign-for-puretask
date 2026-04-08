import { useState, useEffect } from "react";
import { ContentIdea, MarketResearch, WinnerDNA, ContentDraft } from "@/api/entities";

const PILLAR_COLORS = { Convenience: "bg-blue-50 text-blue-600", Trust: "bg-green-50 text-green-600", Transformation: "bg-violet-50 text-violet-600", Recruitment: "bg-orange-50 text-orange-600", Local: "bg-teal-50 text-teal-600", Proof: "bg-pink-50 text-pink-600" };
const FORMAT_ICONS = { "Short Post": "📝", "Carousel": "🎞️", "Reel / Short Video": "🎥", "Story Sequence": "📖", "Long-form Blog": "📰", "Testimonial Style": "💬", "Before/After": "📸", "FAQ / Objection": "❓", "Trending Audio Overlay": "🎵", "Meme / Relatable": "😂", "How-To / Tutorial": "🎓" };
const STATUS_COLORS = { Brainstormed: "bg-yellow-100 text-yellow-700", Selected: "bg-green-100 text-green-700", "Converted to Draft": "bg-purple-100 text-purple-700", Rejected: "bg-red-100 text-red-600" };
const TABS = ["🧠 Brainstorm", "📚 Market Intel", "🏆 Winner DNA"];

export default function BrainstormDashboard() {
  const [activeTab, setActiveTab] = useState("🧠 Brainstorm");
  const [ideas, setIdeas] = useState([]);
  const [research, setResearch] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Brainstormed");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [i, r, w] = await Promise.all([
        ContentIdea.list("-created_date"),
        MarketResearch.list("-research_date"),
        WinnerDNA.list("-created_date")
      ]);
      setIdeas(i);
      setResearch(r);
      setWinners(w);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = ideas.filter(i => statusFilter === "All" || i.status === statusFilter);
  const statusCounts = ideas.reduce((a, i) => { a[i.status] = (a[i.status] || 0) + 1; return a; }, {});

  async function updateIdea(id, data) {
    setSaving(true);
    await ContentIdea.update(id, data);
    await fetchAll();
    if (selected?.id === id) setSelected(p => ({ ...p, ...data }));
    setSaving(false);
  }

  async function convertToDraft() {
    if (!selected) return;
    setConverting(true);
    try {
      // Create full ContentDraft from the idea
      const draft = await ContentDraft.create({
        title: selected.idea_title,
        pillar: selected.pillar,
        audience: selected.audience,
        hook: selected.hook_options?.split("\n")[0] || "",
        status: "Draft",
        editor_notes: `Generated from brainstorm idea: ${selected.idea_title}. Angle: ${selected.angle}. Format: ${selected.format_suggestion}.`,
        week_tag: selected.week_tag || "Current Week",
        campaign_tag: selected.campaign_tag || "Brainstorm Campaign"
      });
      await updateIdea(selected.id, { status: "Converted to Draft", converted_draft_id: draft.id });
      setConverting(false);
      showToast(`✨ Converted to draft! Ready to write full content.`);
    } catch (e) {
      console.error(e);
      setConverting(false);
      showToast("Error converting to draft", "error");
    }
  }

  function openIdea(idea) {
    setSelected(idea);
    setEditing(false);
    setEditData({
      idea_title: idea.idea_title || "",
      concept: idea.concept || "",
      pillar: idea.pillar || "",
      audience: idea.audience || "",
      hook_options: idea.hook_options || "",
      angle: idea.angle || "",
      format_suggestion: idea.format_suggestion || "",
      selection_reasoning: idea.selection_reasoning || "",
      notes: idea.notes || ""
    });
  }

  async function saveEdit() {
    setSaving(true);
    await updateIdea(selected.id, editData);
    setEditing(false);
    setSaving(false);
    showToast("💾 Changes saved!");
  }

  // BRAINSTORM TAB
  if (activeTab === "🧠 Brainstorm") {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {toast && <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>{toast.msg}</div>}

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-gray-900">Content Brainstorm</h1>
              <p className="text-xs text-gray-400">Review ideas · greenlight angles · convert to full content</p>
            </div>
            <div className="flex gap-2">
              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">{statusCounts["Brainstormed"] || 0} brainstormed</span>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">{statusCounts["Selected"] || 0} selected</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-100 px-6">
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-[calc(100vh-113px)]">
          {/* Sidebar */}
          <div className="w-72 bg-white border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-wrap gap-1.5">
                {["All", "Brainstormed", "Selected", "Rejected", "Converted to Draft"].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${statusFilter === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {s} {s !== "All" && statusCounts[s] ? `(${statusCounts[s]})` : ""}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-gray-400 text-sm">Loading ideas...</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No ideas in this category.</div>
              ) : filtered.map(idea => (
                <div key={idea.id} onClick={() => openIdea(idea)}
                  className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-indigo-50 transition-all ${selected?.id === idea.id ? "bg-indigo-50 border-l-4 border-l-indigo-500" : ""}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">{idea.idea_title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium whitespace-nowrap ${STATUS_COLORS[idea.status]}`}>{idea.status}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {idea.pillar && <span className={`text-xs px-2 py-0.5 rounded-full ${PILLAR_COLORS[idea.pillar]}`}>{idea.pillar}</span>}
                    {idea.format_suggestion && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{FORMAT_ICONS[idea.format_suggestion] || "📋"} {idea.format_suggestion.split(" ")[0]}</span>}
                  </div>
                  {idea.predicted_score && <p className="text-xs text-indigo-600 font-bold mt-1">Predicted: {idea.predicted_score}/10</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 overflow-y-auto">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="text-5xl mb-4">🧠</div>
                <p className="text-lg font-medium text-gray-500">Select a brainstorm idea</p>
                <p className="text-sm mt-1">Review concept, angle, and format before converting to draft</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selected.idea_title}</h2>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
                      {selected.pillar && <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PILLAR_COLORS[selected.pillar]}`}>{selected.pillar}</span>}
                      {selected.audience && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{selected.audience}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!editing ? (
                      <>
                        <button onClick={() => setEditing(true)} className="text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">✏️ Edit</button>
                        {selected.status !== "Converted to Draft" && (
                          <button onClick={convertToDraft} disabled={converting} className="text-sm px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50">
                            {converting ? "Converting..." : "✨ Convert to Draft"}
                          </button>
                        )}
                        {selected.status !== "Selected" && selected.status !== "Converted to Draft" && (
                          <button onClick={() => updateIdea(selected.id, { status: "Selected" })} className="text-sm px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">✅ Select</button>
                        )}
                        {selected.status !== "Rejected" && (
                          <button onClick={() => updateIdea(selected.id, { status: "Rejected" })} className="text-sm px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">❌ Reject</button>
                        )}
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditing(false)} className="text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">Cancel</button>
                        <button onClick={saveEdit} disabled={saving} className="text-sm px-3 py-2 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50">
                          {saving ? "Saving..." : "💾 Save"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Scores */}
                {(selected.predicted_score || selected.trend_relevance_score || selected.winner_pattern_match) && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[["Predicted Score", selected.predicted_score, "indigo"], ["Trend Relevance", selected.trend_relevance_score, "blue"], ["Winner Pattern Match", selected.winner_pattern_match, "green"]].map(([label, score, color]) => (
                      <div key={label} className={`bg-${color}-50 rounded-xl p-3 text-center`}>
                        <p className={`text-2xl font-bold text-${color}-600`}>{score?.toFixed(1) || "N/A"}/10</p>
                        <p className={`text-xs text-${color}-500 font-medium mt-1`}>{label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Concept */}
                <Section label="Concept" icon="💡">
                  {editing ? (
                    <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={3} value={editData.concept} onChange={e => setEditData(p => ({...p, concept: e.target.value}))} />
                  ) : (
                    <p className="text-gray-700 text-sm leading-relaxed">{selected.concept}</p>
                  )}
                </Section>

                {/* Angle */}
                <Section label="Content Angle" icon="🎯">
                  {editing ? (
                    <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={2} value={editData.angle} onChange={e => setEditData(p => ({...p, angle: e.target.value}))} />
                  ) : (
                    <p className="text-gray-700 text-sm">{selected.angle}</p>
                  )}
                </Section>

                {/* Hook options */}
                <Section label="Hook Options" icon="🎣">
                  {editing ? (
                    <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={4} placeholder="One hook per line..." value={editData.hook_options} onChange={e => setEditData(p => ({...p, hook_options: e.target.value}))} />
                  ) : (
                    <div className="space-y-2">
                      {selected.hook_options?.split("\n").map((hook, i) => (
                        <div key={i} className="bg-yellow-50 border border-yellow-100 rounded-lg p-2">
                          <p className="text-xs text-yellow-600 font-medium mb-0.5">Option {i + 1}</p>
                          <p className="text-gray-700 text-sm italic">"{hook}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* Format */}
                <Section label="Format Suggestion" icon={FORMAT_ICONS[selected.format_suggestion] || "📋"}>
                  {editing ? (
                    <select className="w-full border rounded-lg px-3 py-2 text-sm" value={editData.format_suggestion} onChange={e => setEditData(p => ({...p, format_suggestion: e.target.value}))}>
                      <option value="">Select format...</option>
                      {Object.keys(FORMAT_ICONS).map(f => <option key={f}>{f}</option>)}
                    </select>
                  ) : (
                    <p className="text-gray-700 text-sm font-medium">{selected.format_suggestion}</p>
                  )}
                </Section>

                {/* Source research */}
                {selected.source_research_id && (
                  <Section label="Sourced From" icon="📚">
                    <p className="text-xs text-gray-500">Research ID: {selected.source_research_id}</p>
                  </Section>
                )}

                {/* Selection reasoning */}
                <Section label="Why This Idea" icon="✨">
                  {editing ? (
                    <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={3} value={editData.selection_reasoning} onChange={e => setEditData(p => ({...p, selection_reasoning: e.target.value}))} />
                  ) : (
                    <p className="text-gray-700 text-sm">{selected.selection_reasoning || "Strategic fit identified by brainstorm engine."}</p>
                  )}
                </Section>

                {/* Notes */}
                <Section label="Notes" icon="💬">
                  {editing ? (
                    <textarea className="w-full border rounded-lg p-3 text-sm resize-none" rows={3} placeholder="Add notes..." value={editData.notes} onChange={e => setEditData(p => ({...p, notes: e.target.value}))} />
                  ) : (
                    <p className="text-gray-500 text-sm italic">{selected.notes || "No notes yet."}</p>
                  )}
                </Section>

                {/* Convert button */}
                {selected.status !== "Converted to Draft" && !editing && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <button onClick={convertToDraft} disabled={converting} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50">
                      {converting ? "Converting..." : "✨ Convert This Idea to Full Draft"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // MARKET INTEL TAB
  if (activeTab === "📚 Market Intel") {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-gray-900">Market Research</h1>
              <p className="text-xs text-gray-400">Trends, competitor intel, pain points, seasonal insights</p>
            </div>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">{research.length} insights</span>
          </div>
        </div>

        <div className="bg-white border-b border-gray-100 px-6">
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading market research...</div>
          ) : research.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-gray-500 font-medium">No market research yet.</p>
              <p className="text-gray-400 text-sm mt-1">Research will be collected automatically each week.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {research.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">{r.title}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{r.research_type}</span>
                        {r.sentiment && <span className={`text-xs px-2 py-0.5 rounded-full ${r.sentiment === "Positive" ? "bg-green-100 text-green-700" : r.sentiment === "Negative" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{r.sentiment}</span>}
                        {r.urgency === "High" && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">⚡ High Urgency</span>}
                        {r.actionable && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">✅ Actionable</span>}
                      </div>
                    </div>
                    {r.suggested_pillar && <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 font-medium ${PILLAR_COLORS[r.suggested_pillar] || ""}`}>{r.suggested_pillar}</span>}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">{r.summary}</p>
                  {r.relevance_to_puretask && <p className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded-lg mb-2">💡 {r.relevance_to_puretask}</p>}
                  {r.source_url && <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">📖 View source →</a>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // WINNER DNA TAB
  if (activeTab === "🏆 Winner DNA") {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-gray-900">Winner DNA Patterns</h1>
              <p className="text-xs text-gray-400">What's working - hook styles, emotions, CTAs, formats</p>
            </div>
            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">{winners.length} patterns</span>
          </div>
        </div>

        <div className="bg-white border-b border-gray-100 px-6">
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading winner DNA...</div>
          ) : winners.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <div className="text-5xl mb-4">🏆</div>
              <p className="text-gray-500 font-medium">No winners extracted yet.</p>
              <p className="text-gray-400 text-sm mt-1">When you get winner posts, their patterns will be extracted here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {winners.map(w => (
                <div key={w.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm">{w.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">Score: {w.avg_score}/10 · Reach: {w.total_reach?.toLocaleString() || 0} · Engagement: {w.total_engagement?.toLocaleString() || 0}</p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-semibold">🏆 Winner</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {[["Hook Style", w.winning_hook_style], ["Emotional Trigger", w.emotional_trigger], ["CTA Style", w.winning_cta_style], ["Format", w.winning_format]].map(([label, val]) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                        <p className="text-xs text-gray-500 font-medium">{label}</p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{val || "—"}</p>
                      </div>
                    ))}
                  </div>
                  {w.key_phrases && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 font-medium mb-1.5">Key Phrases</p>
                      <div className="flex flex-wrap gap-1.5">
                        {w.key_phrases?.split(",").map(phrase => (
                          <span key={phrase} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-medium">{phrase.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-full font-medium ${PILLAR_COLORS[w.winning_pillar]}`}>{w.winning_pillar}</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{w.winning_platform}</span>
                    {w.pattern_notes && <span className="text-gray-500 italic">"{w.pattern_notes}"</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

function Section({ label, icon, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{icon} {label}</h3>
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">{children}</div>
    </div>
  );
}
