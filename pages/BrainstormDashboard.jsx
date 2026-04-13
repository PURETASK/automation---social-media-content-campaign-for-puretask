import { useState, useEffect } from "react";

const APP_ID = "69d5e4bdf3e0e9aab2818c8a";
const PROXY_URL = `https://app.base44.com/api/apps/${APP_ID}/functions/getDashboardData`;

async function fetchAllData(entityNames) {
  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entities: entityNames }),
  });
  if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Unknown proxy error");
  return json.data;
}

async function updateEntity(name, id, payload) {
  const res = await fetch(`${BASE_URL}/${name}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  return res.json();
}

async function createEntity(name, payload) {
  const res = await fetch(`${BASE_URL}/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Create failed: ${res.status}`);
  return res.json();
}

const BRAND_BLUE = "#0099FF";

const PILLAR_CFG = {
  Convenience:    { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", emoji: "⚡" },
  Trust:          { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", emoji: "🔒" },
  Transformation: { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", emoji: "✨" },
  Recruitment:    { color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA", emoji: "💰" },
  Local:          { color: "#0D9488", bg: "#F0FDFA", border: "#99F6E4", emoji: "📍" },
  Proof:          { color: "#DB2777", bg: "#FDF2F8", border: "#FBCFE8", emoji: "⭐" },
  Seniors:        { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", emoji: "🌿" },
  Spring:         { color: "#65A30D", bg: "#F7FEE7", border: "#D9F99D", emoji: "🌸" },
};

const STATUS_CFG = {
  Brainstormed:       { bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  Selected:           { bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
  "Converted to Draft":{ bg: "#EDE9FE", color: "#6D28D9", dot: "#8B5CF6" },
  Converted:          { bg: "#EDE9FE", color: "#6D28D9", dot: "#8B5CF6" },
  Rejected:           { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
};

const SENTIMENT_CFG = {
  Positive: { bg: "#ECFDF5", color: "#059669" },
  Neutral:  { bg: "#F9FAFB", color: "#6B7280" },
  Negative: { bg: "#FEF2F2", color: "#DC2626" },
  Mixed:    { bg: "#FFFBEB", color: "#B45309" },
};

const TABS = ["🧠 Ideas", "📚 Market Intel", "🏆 Winner DNA"];

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {status}
    </span>
  );
}

function PillarTag({ pillar }) {
  const cfg = PILLAR_CFG[pillar];
  if (!cfg) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border"
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
      {cfg.emoji} {pillar}
    </span>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold
      ${toast.type === "error" ? "bg-red-500" : "bg-gray-900"}`}>
      {toast.msg}
    </div>
  );
}

export default function BrainstormDashboard() {
  const [activeTab,   setActiveTab]   = useState("🧠 Ideas");
  const [ideas,       setIdeas]       = useState([]);
  const [research,    setResearch]    = useState([]);
  const [winners,     setWinners]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [statusFilter,setStatusFilter]= useState("All");
  const [pillarFilter,setPillarFilter]= useState("All");
  const [searchQ,     setSearchQ]     = useState("");
  const [selected,    setSelected]    = useState(null);
  const [selResearch, setSelResearch] = useState(null);
  const [editing,     setEditing]     = useState(false);
  const [editData,    setEditData]    = useState({});
  const [saving,      setSaving]      = useState(false);
  const [converting,  setConverting]  = useState(false);
  const [toast,       setToast]       = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchAllData(["ContentIdea","MarketResearch","WinnerDNA"]);
      setIdeas(data.ContentIdea || []);
      setResearch(data.MarketResearch || []);
      setWinners(data.WinnerDNA || []);
    } catch (e) { showToast(e.message, "error"); }
    setLoading(false);
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Filtered ideas ────────────────────────────────────────────────────────
  const filteredIdeas = ideas
    .filter(i => {
      if (statusFilter !== "All" && !(i.status || "").includes(statusFilter.replace("Converted","Convert"))) return false;
      if (pillarFilter !== "All" && i.pillar !== pillarFilter) return false;
      if (searchQ) {
        const q = searchQ.toLowerCase();
        if (!i.idea_title?.toLowerCase().includes(q) && !i.concept?.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a,b) => (b.predicted_score||0) - (a.predicted_score||0));

  const statusCounts = ideas.reduce((a,i) => {
    const s = i.status || "Brainstormed";
    a[s] = (a[s]||0)+1;
    return a;
  }, {});

  // ── Actions ───────────────────────────────────────────────────────────────
  function openIdea(idea) {
    setSelected(idea);
    setEditing(false);
    setEditData({
      idea_title:          idea.idea_title || "",
      concept:             idea.concept || "",
      pillar:              idea.pillar || "",
      audience:            idea.audience || "",
      hook_options:        idea.hook_options || "",
      angle:               idea.angle || "",
      format_suggestion:   idea.format_suggestion || "",
      selection_reasoning: idea.selection_reasoning || "",
      notes:               idea.notes || "",
    });
  }

  async function updateIdea(id, data) {
    setSaving(true);
    try {
      await updateEntity("ContentIdea", id, data);
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
      if (selected?.id === id) setSelected(p => ({ ...p, ...data }));
      showToast("✅ Updated!");
    } catch (e) { showToast("Error: " + e.message, "error"); }
    setSaving(false);
  }

  async function saveEdit() {
    await updateIdea(selected.id, editData);
    setEditing(false);
  }

  async function convertToDraft() {
    if (!selected) return;
    setConverting(true);
    try {
      const draft = await createEntity("ContentDraft", {
        title:       selected.idea_title,
        pillar:      selected.pillar,
        audience:    selected.audience,
        hook:        selected.hook_options?.split("|")[0]?.trim().replace(/^['"]|['"]$/g,"") || "",
        status:      "Draft",
        editor_notes:`From brainstorm: ${selected.idea_title}. Angle: ${selected.angle || ""}. Format: ${selected.format_suggestion || ""}.`,
        week_tag:    selected.week_tag || "Current Week",
        campaign_tag:selected.campaign_tag || "Brainstorm",
      });
      await updateIdea(selected.id, { status: "Converted to Draft", converted_draft_id: draft.id });
      showToast("✨ Draft created!");
    } catch (e) { showToast("Error: " + e.message, "error"); }
    setConverting(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
          style={{ borderColor: "#6366F1", borderTopColor: "transparent" }} />
        <p className="text-sm font-semibold text-gray-500">Loading brainstorm engine…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans">
      <Toast toast={toast} />

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-5 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-gray-900">Content Brainstorm</h1>
            <p className="text-xs text-gray-400">Idea pipeline · market intel · winner patterns</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {[
              { s:"Brainstormed",        bg:"#FFFBEB", c:"#B45309" },
              { s:"Selected",            bg:"#ECFDF5", c:"#059669" },
              { s:"Converted to Draft",  bg:"#EDE9FE", c:"#6D28D9" },
            ].map(({ s, bg, c }) => (
              <span key={s} className="text-xs px-3 py-1 rounded-full font-semibold"
                style={{ background: bg, color: c }}>
                {statusCounts[s] || 0} {s}
              </span>
            ))}
            <button onClick={load}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-semibold ml-1">
              ↻
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-[1400px] mx-auto px-5 flex border-t border-gray-100">
          {TABS.map(t => (
            <button key={t}
              onClick={() => { setActiveTab(t); setSelected(null); setSelResearch(null); setStatusFilter("All"); setPillarFilter("All"); setSearchQ(""); }}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all
                ${activeTab===t?"border-indigo-600 text-indigo-600":"border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 py-5">

        {/* ════════════════════════════════════════════════════════════════════
            🧠  IDEAS TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "🧠 Ideas" && (
          <div className="flex gap-4" style={{ height: "calc(100vh - 118px)" }}>

            {/* Sidebar */}
            <div className="w-[290px] flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-gray-100">
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="🔍  Search ideas…"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
              {/* Status filter */}
              <div className="px-3 pt-2.5 pb-2 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status</p>
                <div className="flex flex-wrap gap-1">
                  {["All","Brainstormed","Selected","Converted","Rejected"].map(s => {
                    const cfg = STATUS_CFG[s] || {};
                    const active = statusFilter === s;
                    return (
                      <button key={s} onClick={() => setStatusFilter(s)}
                        className="text-xs px-2.5 py-1 rounded-full font-semibold transition-all"
                        style={active
                          ? { background: cfg.dot || "#6366F1", color: "#fff" }
                          : { background: "#F3F4F6", color: "#6B7280" }
                        }>{s}</button>
                    );
                  })}
                </div>
              </div>
              {/* Pillar filter */}
              <div className="px-3 pt-2.5 pb-2 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Pillar</p>
                <div className="flex flex-wrap gap-1">
                  {["All",...Object.keys(PILLAR_CFG)].map(p => {
                    const cfg = PILLAR_CFG[p] || {};
                    const active = pillarFilter === p;
                    return (
                      <button key={p} onClick={() => setPillarFilter(p)}
                        className="text-xs px-2 py-0.5 rounded-full font-semibold transition-all"
                        style={active
                          ? { background: cfg.color || "#6366F1", color: "#fff" }
                          : { background: "#F3F4F6", color: "#6B7280" }
                        }>{p === "All" ? "All" : `${cfg.emoji} ${p}`}</button>
                    );
                  })}
                </div>
              </div>
              <div className="px-3 py-1.5 border-b border-gray-50">
                <p className="text-xs text-gray-400">{filteredIdeas.length} of {ideas.length} ideas</p>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {filteredIdeas.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-3xl mb-2">🧠</p>
                    <p className="text-sm text-gray-400">No ideas match filters</p>
                  </div>
                ) : filteredIdeas.map(idea => {
                  const pCfg = PILLAR_CFG[idea.pillar] || {};
                  const isActive = selected?.id === idea.id;
                  return (
                    <div key={idea.id} onClick={() => openIdea(idea)}
                      className={`p-3 cursor-pointer hover:bg-indigo-50 transition-all
                        ${isActive ? "bg-indigo-50 border-l-[3px] border-indigo-500" : ""}`}>
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5">
                        {idea.idea_title || "Untitled"}
                      </p>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {idea.pillar && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium border"
                            style={{ background: pCfg.bg, color: pCfg.color, borderColor: pCfg.border }}>
                            {pCfg.emoji} {idea.pillar}
                          </span>
                        )}
                        {idea.predicted_score && (
                          <span className="text-xs font-black text-indigo-600">{idea.predicted_score}/10</span>
                        )}
                        {idea.winner_pattern_match && (
                          <span className="text-xs font-bold text-amber-600">★{idea.winner_pattern_match}</span>
                        )}
                      </div>
                      <div className="mt-1.5">
                        <StatusBadge status={idea.status || "Brainstormed"} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail panel */}
            <div className="flex-1 overflow-y-auto">
              {!selected ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                  <p className="text-6xl mb-4">👈</p>
                  <p className="text-xl font-bold text-gray-500">Select an idea</p>
                  <p className="text-sm mt-1">{filteredIdeas.length} ideas available</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      {editing ? (
                        <input value={editData.idea_title}
                          onChange={e => setEditData(p => ({ ...p, idea_title: e.target.value }))}
                          className="text-xl font-bold text-gray-900 w-full border-b-2 border-indigo-400 pb-1 focus:outline-none bg-transparent" />
                      ) : (
                        <h2 className="text-xl font-bold text-gray-900">{selected.idea_title || "Untitled"}</h2>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <StatusBadge status={selected.status || "Brainstormed"} />
                        {selected.pillar && <PillarTag pillar={selected.pillar} />}
                        {selected.audience && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">👤 {selected.audience}</span>}
                      </div>
                    </div>
                    {selected.predicted_score && (
                      <div className="text-center flex-shrink-0">
                        <p className="text-3xl font-black text-indigo-600">{selected.predicted_score}</p>
                        <p className="text-xs text-gray-400 font-medium">predicted</p>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap mb-6">
                    {(selected.status === "Brainstormed" || !selected.status) && (
                      <button disabled={saving} onClick={() => updateIdea(selected.id, { status: "Selected" })}
                        className="text-xs px-3 py-1.5 rounded-lg font-bold text-white"
                        style={{ background: "#059669" }}>✅ Select</button>
                    )}
                    {["Selected","Brainstormed",undefined,null].includes(selected.status) && !selected.status?.includes("Convert") && (
                      <button disabled={converting || saving} onClick={convertToDraft}
                        className="text-xs px-3 py-1.5 rounded-lg font-bold text-white"
                        style={{ background: "#6366F1" }}>
                        {converting ? "Converting…" : "✨ Convert to Draft"}
                      </button>
                    )}
                    {selected.status !== "Rejected" && (
                      <button disabled={saving} onClick={() => updateIdea(selected.id, { status: "Rejected" })}
                        className="text-xs px-3 py-1.5 rounded-lg font-bold border border-red-200 text-red-600 bg-red-50 hover:bg-red-100">
                        ✕ Reject
                      </button>
                    )}
                    {!editing ? (
                      <button onClick={() => setEditing(true)}
                        className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50">
                        ✏️ Edit
                      </button>
                    ) : (
                      <>
                        <button disabled={saving} onClick={saveEdit}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold text-white"
                          style={{ background: BRAND_BLUE }}>
                          {saving ? "Saving…" : "💾 Save"}
                        </button>
                        <button onClick={() => setEditing(false)}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-200 text-gray-500 bg-white">Cancel</button>
                      </>
                    )}
                  </div>

                  {/* Fields */}
                  {[
                    { label: "Concept",            field: "concept",            multi: true  },
                    { label: "Angle",               field: "angle",              multi: false },
                    { label: "Format",              field: "format_suggestion",  multi: false },
                    { label: "Why This Works",      field: "selection_reasoning",multi: true  },
                    { label: "Notes",               field: "notes",              multi: true  },
                  ].map(({ label, field, multi }) => (
                    (editing || selected[field]) ? (
                      <div key={field} className="mb-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
                        {editing ? (
                          multi
                            ? <textarea value={editData[field]||""} onChange={e => setEditData(p=>({...p,[field]:e.target.value}))} rows={3}
                                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none resize-none" />
                            : <input value={editData[field]||""} onChange={e => setEditData(p=>({...p,[field]:e.target.value}))}
                                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none" />
                        ) : (
                          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">{selected[field]}</p>
                        )}
                      </div>
                    ) : null
                  ))}

                  {/* Hook options */}
                  {selected.hook_options && (
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Hook Options</p>
                      {editing ? (
                        <textarea value={editData.hook_options||""} onChange={e => setEditData(p=>({...p,hook_options:e.target.value}))} rows={4}
                          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none resize-none" />
                      ) : (
                        <div className="space-y-2">
                          {selected.hook_options.split("|").map((h,i) => (
                            <div key={i} className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
                              <p className="text-sm text-indigo-800 font-medium">{h.trim().replace(/^['"]|['"]$/g,"")}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scores grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label:"Predicted",      value:selected.predicted_score,      color:"#6366F1" },
                      { label:"Winner Match",   value:selected.winner_pattern_match, color:"#D97706" },
                      { label:"Trend Score",    value:selected.trend_relevance_score,color:"#0D9488" },
                    ].filter(s => s.value).map(({ label, value, color }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400 font-semibold">{label}</p>
                        <p className="text-xl font-black mt-0.5" style={{ color }}>{value}/10</p>
                      </div>
                    ))}
                    {selected.best_platform && (
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400 font-semibold">Best Platform</p>
                        <p className="text-sm font-black text-gray-800 mt-0.5">{selected.best_platform}</p>
                      </div>
                    )}
                  </div>

                  {/* Platform fit bars */}
                  {(selected.platform_facebook_score || selected.platform_instagram_score) && (
                    <div className="mt-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Platform Fit</p>
                      <div className="space-y-2">
                        {[
                          ["Facebook",  selected.platform_facebook_score,  "#1877F2"],
                          ["Instagram", selected.platform_instagram_score, "#E1306C"],
                          ["LinkedIn",  selected.platform_linkedin_score,  "#0A66C2"],
                          ["TikTok",    selected.platform_tiktok_score,    "#010101"],
                        ].filter(([,v]) => v).map(([l,v,col]) => (
                          <div key={l} className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 w-20 font-medium">{l}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div className="h-2 rounded-full" style={{ width:`${(v/10)*100}%`, background: col }} />
                            </div>
                            <span className="text-xs font-black text-gray-700 w-5 text-right">{v}</span>
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

        {/* ════════════════════════════════════════════════════════════════════
            📚  MARKET INTEL TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "📚 Market Intel" && (
          <div className="flex gap-4" style={{ height: "calc(100vh - 118px)" }}>
            {/* List */}
            <div className="w-[290px] flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-400 font-medium">{research.length} research items</p>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {research.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-3xl mb-2">📚</p>
                    <p className="text-sm text-gray-400">No research yet</p>
                  </div>
                ) : research.map(r => {
                  const sentCfg = SENTIMENT_CFG[r.sentiment] || {};
                  return (
                    <div key={r.id} onClick={() => setSelResearch(r)}
                      className={`p-3 cursor-pointer hover:bg-blue-50 transition-all
                        ${selResearch?.id===r.id?"bg-blue-50 border-l-[3px] border-blue-500":""}`}>
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5">{r.title}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {r.urgency && <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-semibold">🔥 {r.urgency}</span>}
                        {r.sentiment && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background:sentCfg.bg,color:sentCfg.color}}>{r.sentiment}</span>}
                        {r.actionable && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold">✓ Act.</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail */}
            <div className="flex-1 overflow-y-auto">
              {!selResearch ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                  <p className="text-5xl mb-3">📚</p>
                  <p className="text-lg font-semibold text-gray-500">Select a research item</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{selResearch.title}</h2>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {selResearch.research_type && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">{selResearch.research_type}</span>}
                    {selResearch.urgency && <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-bold">🔥 {selResearch.urgency}</span>}
                    {selResearch.sentiment && <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{background:(SENTIMENT_CFG[selResearch.sentiment]||{}).bg,color:(SENTIMENT_CFG[selResearch.sentiment]||{}).color}}>{selResearch.sentiment}</span>}
                    {selResearch.actionable && <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-bold">✅ Actionable</span>}
                  </div>
                  {selResearch.summary && <div className="mb-4"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Summary</p><p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">{selResearch.summary}</p></div>}
                  {selResearch.relevance_to_puretask && <div className="mb-4"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Relevance to PureTask</p><p className="text-sm text-gray-700 leading-relaxed">{selResearch.relevance_to_puretask}</p></div>}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {selResearch.suggested_pillar && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs font-bold text-gray-400 mb-1.5">Suggested Pillar</p><PillarTag pillar={selResearch.suggested_pillar} /></div>}
                    {selResearch.suggested_audience && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs font-bold text-gray-400 mb-1">Suggested Audience</p><p className="text-sm font-bold text-gray-700">{selResearch.suggested_audience}</p></div>}
                  </div>
                  {selResearch.source_url && <a href={selResearch.source_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 font-semibold hover:underline">↗ {selResearch.source}</a>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            🏆  WINNER DNA TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "🏆 Winner DNA" && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon:"🧬", label:"DNA Patterns",    value:winners.length,    color:"#D97706" },
                { icon:"📡", label:"Total Reach",     value:winners.reduce((s,w)=>s+(w.total_reach||0),0).toLocaleString(), color:BRAND_BLUE },
                { icon:"♻️", label:"Times Reused",    value:winners.reduce((s,w)=>s+(w.reuse_count||0),0), color:"#059669" },
              ].map(({ icon, label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <p className="text-3xl mb-2">{icon}</p>
                  <p className="text-2xl font-black text-gray-900">{value}</p>
                  <p className="text-xs font-bold mt-1" style={{ color }}>{label}</p>
                </div>
              ))}
            </div>

            {winners.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                <p className="text-5xl mb-4">🏆</p>
                <p className="text-lg font-bold text-gray-600">No Winner DNA yet</p>
                <p className="text-sm text-gray-400 mt-2">Patterns extracted after posts hit 8.0+ performance score</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...winners].sort((a,b)=>(b.avg_score||0)-(a.avg_score||0)).map(w => {
                  const pCfg = PILLAR_CFG[w.winning_pillar] || {};
                  return (
                    <div key={w.id} className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
                      <div className="p-4 border-b border-amber-100" style={{ background: "#FFFBEB" }}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-gray-800 text-sm">{w.title}</p>
                          {w.avg_score && <span className="text-xl font-black text-amber-600 flex-shrink-0">★{w.avg_score}</span>}
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {w.winning_pillar && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:pCfg.bg,color:pCfg.color}}>{pCfg.emoji} {w.winning_pillar}</span>}
                          {w.winning_platform && <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{w.winning_platform}</span>}
                          {w.winning_audience && <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{w.winning_audience}</span>}
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        {[["Hook Style",w.winning_hook_style],["Emotional Trigger",w.emotional_trigger],["CTA Style",w.winning_cta_style],["Key Phrases",w.key_phrases]].filter(([,v])=>v).map(([l,v])=>(
                          <div key={l}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{l}</p>
                            <p className="text-sm text-gray-700 mt-0.5">{v}</p>
                          </div>
                        ))}
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
                          {[["Reach",w.total_reach?.toLocaleString()],["Engagement",w.total_engagement],["Reuses",w.reuse_count]].map(([l,v])=>(
                            <div key={l}><p className="text-xs text-gray-400">{l}</p><p className="text-sm font-black text-gray-800">{v??"—"}</p></div>
                          ))}
                        </div>
                        {w.pattern_notes && <p className="text-xs text-gray-500 italic leading-relaxed pt-2 border-t border-gray-100">{w.pattern_notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
