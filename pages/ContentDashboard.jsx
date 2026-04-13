import { useState, useEffect, useCallback } from "react";

// ─── Direct API calls to the correct app ──────────────────────────────────────
const APP_ID = "69d5e4bdf3e0e9aab2818c8a";
const PROXY_URL = `https://app.base44.com/api/apps/${APP_ID}/functions/getDashboardData`;

// Use the proxy function (service-role) to bypass RLS on entities
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
  if (!res.ok) throw new Error(`Failed to update: ${res.status}`);
  return res.json();
}

// ─── Brand Config ─────────────────────────────────────────────────────────────
const BRAND_BLUE = "#0099FF";
const BRAND_DARK = "#0066CC";

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
  Draft:             { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
  "Pending Approval":{ bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  Approved:          { bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
  Rejected:          { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
  Posted:            { bg: "#EDE9FE", color: "#6D28D9", dot: "#8B5CF6" },
  Scheduled:         { bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
};

const PLAT_CFG = {
  facebook:  { icon: "👥", label: "Facebook",  field: "platform_facebook"  },
  instagram: { icon: "📸", label: "Instagram", field: "platform_instagram" },
  linkedin:  { icon: "💼", label: "LinkedIn",  field: "platform_linkedin"  },
  tiktok:    { icon: "🎵", label: "TikTok",    field: "platform_tiktok"    },
  x:         { icon: "🐦", label: "X/Twitter", field: "platform_x"         },
  pinterest: { icon: "📌", label: "Pinterest", field: "platform_pinterest" },
};

const TABS = ["📋 Queue", "📊 Analytics", "💡 Ideas", "🧬 Winner DNA"];
const ALL_STATUSES = ["All", "Approved", "Posted", "Draft", "Rejected"];
const ALL_PILLARS  = ["All", ...Object.keys(PILLAR_CFG)];

// ─── Helper components ────────────────────────────────────────────────────────
function getAvgScore(d) {
  const vals = [d.clarity_score, d.relatability_score, d.conversion_score]
    .filter(v => typeof v === "number" && !isNaN(v));
  return vals.length === 3 ? vals.reduce((a, b) => a + b, 0) / 3 : null;
}

function ScorePill({ draft }) {
  const avg = getAvgScore(draft);
  if (avg === null) return <span className="text-xs text-gray-300">—</span>;
  const col = avg >= 7.5 ? { color: "#059669", bg: "#ECFDF5" }
            : avg >= 6   ? { color: "#B45309", bg: "#FFFBEB" }
            :               { color: "#DC2626", bg: "#FEF2F2" };
  return (
    <span className="text-xs font-black px-2 py-0.5 rounded-full"
      style={{ color: col.color, background: col.bg }}>
      {avg.toFixed(1)}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.Draft;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
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
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold pointer-events-none
      ${toast.type === "error" ? "bg-red-500" : "bg-gray-900"}`}>
      {toast.msg}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ContentDashboard() {
  const [tab, setTab]         = useState("📋 Queue");
  const [drafts, setDrafts]   = useState([]);
  const [perfs, setPerfs]     = useState([]);
  const [ideas, setIdeas]     = useState([]);
  const [dna, setDna]         = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [pillarFilter, setPillarFilter] = useState("All");
  const [search, setSearch]             = useState("");

  const [selected, setSelected]     = useState(null);
  const [activePlat, setActivePlat] = useState("facebook");
  const [editing, setEditing]       = useState(false);
  const [editData, setEditData]     = useState({});
  const [saving, setSaving]         = useState(false);
  const [showPost, setShowPost]     = useState(false);
  const [pubPlats, setPubPlats]     = useState([]);
  const [toast, setToast]           = useState(null);

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const [d, p, i, w] = await Promise.all([
        fetchEntity("ContentDraft", 500),
        fetchEntity("PostPerformance", 300),
        fetchEntity("ContentIdea", 300),
        fetchEntity("WinnerDNA", 100),
      ]);
      setDrafts(d);
      setPerfs(p);
      setIdeas(i);
      setDna(w);
    } catch (e) {
      setLoadErr(e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  // ── Stats ───────────────────────────────────────────────────────────────────
  const approvedCt  = drafts.filter(d => d.status === "Approved").length;
  const postedCt    = drafts.filter(d => d.status === "Posted").length;
  const withImgCt   = drafts.filter(d => d.image_url).length;
  const needImgCt   = drafts.filter(d => !d.image_url && !["Rejected","Posted"].includes(d.status)).length;
  const realPerfs   = perfs.filter(p => (Number(p.reach) || 0) > 0);
  const totalReach  = realPerfs.reduce((s, p) => s + (Number(p.reach) || 0), 0);
  const avgEng      = realPerfs.length
    ? (realPerfs.reduce((s, p) => s + (Number(p.engagement_rate) || 0), 0) / realPerfs.length).toFixed(1)
    : "—";
  const winnersCt   = perfs.filter(p => p.performance_label === "Winner").length;

  // ── Filtered queue ───────────────────────────────────────────────────────────
  const filteredDrafts = drafts
    .filter(d => {
      if (statusFilter !== "All" && d.status !== statusFilter) return false;
      if (pillarFilter !== "All" && d.pillar !== pillarFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!d.title?.toLowerCase().includes(q) && !d.hook?.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));

  const selPerfs = selected ? realPerfs.filter(p => p.content_draft_id === selected.id) : [];

  // ── Actions ──────────────────────────────────────────────────────────────────
  async function updateStatus(id, status) {
    setSaving(true);
    try {
      await updateEntity("ContentDraft", id, { status });
      setDrafts(prev => prev.map(d => d.id === id ? { ...d, status } : d));
      if (selected?.id === id) setSelected(p => ({ ...p, status }));
      showToast(status === "Approved" ? "✅ Approved!" : `Marked as ${status}`);
    } catch (e) { showToast("Error: " + e.message, "error"); }
    setSaving(false);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      await updateEntity("ContentDraft", selected.id, editData);
      const updated = { ...selected, ...editData };
      setDrafts(prev => prev.map(d => d.id === selected.id ? updated : d));
      setSelected(updated);
      setEditing(false);
      showToast("💾 Saved!");
    } catch (e) { showToast("Error: " + e.message, "error"); }
    setSaving(false);
  }

  async function postNow() {
    if (!pubPlats.length) { showToast("Pick at least one platform", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch(`https://app.base44.com/api/apps/${APP_ID}/functions/postToSocials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft_id: selected.id, platforms: pubPlats }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast("🚀 Posted to " + (data.posted_to || pubPlats).join(", "));
        setShowPost(false);
        load();
      } else showToast(data.error || "Post failed", "error");
    } catch (e) { showToast("Error: " + e.message, "error"); }
    setSaving(false);
  }

  function openDraft(draft) {
    setSelected(draft);
    setActivePlat("facebook");
    setEditing(false);
    setShowPost(false);
    setPubPlats([]);
    setEditData({
      title: draft.title || "",
      hook: draft.hook || "",
      platform_facebook: draft.platform_facebook || "",
      platform_instagram: draft.platform_instagram || "",
      platform_linkedin: draft.platform_linkedin || "",
      platform_tiktok: draft.platform_tiktok || "",
      platform_x: draft.platform_x || "",
      platform_pinterest: draft.platform_pinterest || "",
      cta_1: draft.cta_1 || "",
      cta_2: draft.cta_2 || "",
      cta_3: draft.cta_3 || "",
      editor_notes: draft.editor_notes || "",
    });
  }

  // ── Loading / Error ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
          style={{ borderColor: BRAND_BLUE, borderTopColor: "transparent" }} />
        <p className="text-sm font-semibold text-gray-500">Loading content engine…</p>
        <p className="text-xs text-gray-400 mt-1">Connecting to PureTask database</p>
      </div>
    </div>
  );

  if (loadErr) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="font-bold text-gray-800 mb-2">Couldn't load data</p>
        <p className="text-sm text-red-500 mb-5 font-mono bg-red-50 rounded-lg px-3 py-2">{loadErr}</p>
        <button onClick={load}
          className="px-5 py-2 rounded-xl text-white text-sm font-bold"
          style={{ background: BRAND_BLUE }}>↻ Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans">
      <Toast toast={toast} />

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 shadow-sm"
        style={{ background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_DARK} 100%)` }}>
        <div className="max-w-[1400px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow">
              <span className="font-black text-sm" style={{ color: BRAND_BLUE }}>P</span>
            </div>
            <div>
              <p className="font-black text-sm text-white">PureTask Content Engine</p>
              <a href="https://www.puretask.co" target="_blank" rel="noreferrer"
                className="text-xs text-blue-200 hover:text-white">www.puretask.co</a>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {[
              { v: drafts.length, l: "Total",    bg: "bg-white/20" },
              { v: approvedCt,    l: "Approved", bg: "bg-green-500/30" },
              { v: postedCt,      l: "Posted",   bg: "bg-purple-500/30" },
              { v: withImgCt,     l: "Has Image",bg: "bg-white/20" },
              { v: needImgCt,     l: "Need Img", bg: needImgCt > 0 ? "bg-orange-500/30" : "bg-white/20" },
            ].map(({ v, l, bg }) => (
              <div key={l} className={`${bg} rounded-xl px-3 py-1.5 text-center min-w-[56px]`}>
                <p className="text-white font-black text-sm leading-none">{v}</p>
                <p className="text-blue-200 text-[10px] font-medium mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          <button onClick={load}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl font-semibold transition-all">
            ↻ Refresh
          </button>
        </div>
        {/* Tabs */}
        <div className="max-w-[1400px] mx-auto px-5 flex border-t border-white/10">
          {TABS.map(t => (
            <button key={t}
              onClick={() => { setTab(t); setSelected(null); setStatusFilter("All"); }}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all
                ${tab === t ? "border-white text-white" : "border-transparent text-blue-200 hover:text-white"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 py-5">

        {/* ══════════════════════════════════════════════════════════════════
            📋  QUEUE TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === "📋 Queue" && (
          <div className="flex gap-4" style={{ height: "calc(100vh - 118px)" }}>

            {/* Left — Filter + List */}
            <div className="w-[290px] flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-gray-100">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="🔍  Search title or hook…"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Status filter */}
              <div className="px-3 pt-2.5 pb-2 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status</p>
                <div className="flex flex-wrap gap-1">
                  {ALL_STATUSES.map(s => {
                    const cfg = STATUS_CFG[s];
                    const active = statusFilter === s;
                    return (
                      <button key={s} onClick={() => setStatusFilter(s)}
                        className="text-xs px-2.5 py-1 rounded-full font-semibold transition-all"
                        style={active
                          ? { background: cfg?.dot || BRAND_BLUE, color: "#fff" }
                          : { background: "#F3F4F6", color: "#6B7280" }
                        }>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pillar filter */}
              <div className="px-3 pt-2.5 pb-2 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Pillar</p>
                <div className="flex flex-wrap gap-1">
                  {ALL_PILLARS.map(p => {
                    const cfg = PILLAR_CFG[p];
                    const active = pillarFilter === p;
                    return (
                      <button key={p} onClick={() => setPillarFilter(p)}
                        className="text-xs px-2.5 py-1 rounded-full font-semibold transition-all"
                        style={active
                          ? { background: cfg?.color || BRAND_BLUE, color: "#fff" }
                          : { background: "#F3F4F6", color: "#6B7280" }
                        }>
                        {p === "All" ? "All" : `${cfg?.emoji} ${p}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-3 py-1.5 border-b border-gray-50">
                <p className="text-xs text-gray-400">{filteredDrafts.length} of {drafts.length} drafts</p>
              </div>

              {/* Draft list */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {filteredDrafts.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-sm text-gray-400">No drafts match filters</p>
                  </div>
                ) : filteredDrafts.map(d => {
                  const isActive = selected?.id === d.id;
                  return (
                    <div key={d.id}
                      onClick={() => openDraft(d)}
                      className={`p-3 cursor-pointer transition-all hover:bg-blue-50
                        ${isActive ? "bg-blue-50 border-l-[3px] border-blue-500" : ""}`}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug flex-1">
                          {d.title || "Untitled"}
                        </p>
                        <StatusBadge status={d.status} />
                      </div>
                      {d.hook && (
                        <p className="text-xs text-gray-500 line-clamp-1 mb-1.5 italic">"{d.hook}"</p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {d.pillar && <PillarTag pillar={d.pillar} />}
                        <ScorePill draft={d} />
                        {d.image_url && <span title="Has image">🖼️</span>}
                        {d.video_cdn_url && <span title="Has video">🎬</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — Detail panel */}
            <div className="flex-1 overflow-y-auto min-w-0">
              {!selected ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 select-none">
                  <p className="text-6xl mb-4">👈</p>
                  <p className="text-xl font-bold text-gray-500">Select a draft to open it</p>
                  <p className="text-sm mt-1 text-gray-400">{filteredDrafts.length} drafts in queue</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                  {/* Header */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        {editing ? (
                          <input value={editData.title}
                            onChange={e => setEditData(p => ({ ...p, title: e.target.value }))}
                            className="text-xl font-bold text-gray-900 w-full border-b-2 border-blue-400 pb-1 focus:outline-none bg-transparent" />
                        ) : (
                          <h2 className="text-xl font-bold text-gray-900 leading-snug">{selected.title}</h2>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <StatusBadge status={selected.status} />
                          {selected.pillar && <PillarTag pillar={selected.pillar} />}
                          {selected.audience && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">👤 {selected.audience}</span>
                          )}
                          {selected.city && (
                            <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium border border-teal-100">📍 {selected.city}</span>
                          )}
                          {selected.week_tag && (
                            <span className="text-xs bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full font-medium border border-gray-200">{selected.week_tag}</span>
                          )}
                        </div>
                      </div>
                      {/* Scores */}
                      <div className="flex gap-3 flex-shrink-0">
                        {[["C", selected.clarity_score], ["R", selected.relatability_score], ["CV", selected.conversion_score]].map(([lbl, val]) => (
                          <div key={lbl} className="text-center">
                            <p className="text-[10px] text-gray-400 font-semibold">{lbl}</p>
                            <p className="text-lg font-black" style={{
                              color: typeof val === "number" ? val >= 7.5 ? "#059669" : val >= 6 ? "#B45309" : "#DC2626" : "#D1D5DB"
                            }}>
                              {typeof val === "number" ? val.toFixed(1) : "—"}
                            </p>
                          </div>
                        ))}
                        <div className="text-center pl-2 border-l border-gray-100">
                          <p className="text-[10px] text-gray-400 font-semibold">AVG</p>
                          <div className="mt-0.5"><ScorePill draft={selected} /></div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {!["Approved","Posted"].includes(selected.status) && (
                        <button disabled={saving} onClick={() => updateStatus(selected.id, "Approved")}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold text-white hover:opacity-90"
                          style={{ background: "#059669" }}>✅ Approve</button>
                      )}
                      {selected.status === "Approved" && (
                        <button onClick={() => setShowPost(!showPost)}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold text-white hover:opacity-90"
                          style={{ background: BRAND_BLUE }}>🚀 Post Now</button>
                      )}
                      {!["Rejected","Posted"].includes(selected.status) && (
                        <button disabled={saving} onClick={() => updateStatus(selected.id, "Rejected")}
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
                            className="text-xs px-3 py-1.5 rounded-lg font-bold text-white hover:opacity-90"
                            style={{ background: BRAND_BLUE }}>
                            {saving ? "Saving…" : "💾 Save"}
                          </button>
                          <button onClick={() => setEditing(false)}
                            className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-200 text-gray-500 bg-white">
                            Cancel
                          </button>
                        </>
                      )}
                    </div>

                    {/* Publisher */}
                    {showPost && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs font-bold text-blue-800 mb-2">Select platforms to post:</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(PLAT_CFG).map(([key, cfg]) => (
                            <button key={key}
                              onClick={() => setPubPlats(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key])}
                              className="text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all"
                              style={pubPlats.includes(key)
                                ? { background: BRAND_BLUE, color: "#fff", borderColor: BRAND_BLUE }
                                : { background: "#fff", color: "#374151", borderColor: "#D1D5DB" }}>
                              {cfg.icon} {cfg.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button disabled={saving || !pubPlats.length} onClick={postNow}
                            className="text-xs px-4 py-2 rounded-lg font-bold text-white disabled:opacity-50"
                            style={{ background: BRAND_BLUE }}>
                            {saving ? "Posting…" : `🚀 Post to ${pubPlats.length} platform${pubPlats.length !== 1 ? "s" : ""}`}
                          </button>
                          <button onClick={() => setShowPost(false)}
                            className="text-xs px-3 py-2 rounded-lg font-semibold bg-white border border-gray-200 text-gray-500">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Image */}
                  <div className="px-5 pt-5">
                    {selected.image_url ? (
                      <img src={selected.image_url} alt={selected.title}
                        className="w-full max-h-64 object-cover rounded-xl shadow-sm" />
                    ) : (
                      <div className="w-full h-28 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <p className="text-xl mb-0.5">🖼️</p>
                          <p className="text-xs">Image generating…</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hook */}
                  <div className="px-5 pt-5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Hook</p>
                    {editing ? (
                      <input value={editData.hook}
                        onChange={e => setEditData(p => ({ ...p, hook: e.target.value }))}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed italic bg-gray-50 rounded-xl px-4 py-3">
                        "{selected.hook || "No hook set"}"
                      </p>
                    )}
                  </div>

                  {/* Platform copy */}
                  <div className="px-5 pt-5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Platform Copy</p>
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {Object.entries(PLAT_CFG).map(([key, cfg]) => {
                        const hasCopy = !!selected[cfg.field];
                        return (
                          <button key={key} onClick={() => setActivePlat(key)}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all relative"
                            style={activePlat === key
                              ? { background: BRAND_BLUE, color: "#fff" }
                              : { background: hasCopy ? "#F0FDF4" : "#F9FAFB", color: hasCopy ? "#166534" : "#9CA3AF", border: "1px solid " + (hasCopy ? "#BBF7D0" : "#E5E7EB") }}>
                            {cfg.icon} {cfg.label}
                            {hasCopy && activePlat !== key && (
                              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {editing ? (
                      <textarea
                        value={editData[PLAT_CFG[activePlat]?.field] || ""}
                        onChange={e => setEditData(p => ({ ...p, [PLAT_CFG[activePlat].field]: e.target.value }))}
                        rows={7}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                      />
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                        {selected[PLAT_CFG[activePlat]?.field] || (
                          <span className="text-gray-300 italic">No copy for {PLAT_CFG[activePlat]?.label} yet</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTAs */}
                  {(selected.cta_1 || selected.cta_2 || selected.cta_3) && (
                    <div className="px-5 pt-5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">CTAs</p>
                      <div className="space-y-2">
                        {[selected.cta_1, selected.cta_2, selected.cta_3].filter(Boolean).map((cta, i) => (
                          <div key={i} className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
                            <span className="text-blue-400 font-black text-xs mt-0.5 w-4 flex-shrink-0">{i + 1}</span>
                            <p className="text-sm text-blue-900 font-medium">{cta}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video scripts */}
                  {(selected.script_15sec || selected.script_30sec || selected.script_45sec) && (
                    <div className="px-5 pt-5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Video Scripts</p>
                      <div className="space-y-3">
                        {[["15s", selected.script_15sec], ["30s", selected.script_30sec], ["45s", selected.script_45sec]]
                          .filter(([, v]) => v)
                          .map(([label, script]) => (
                            <div key={label} className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                              <p className="text-xs font-bold text-purple-500 mb-1.5">{label}</p>
                              <p className="text-sm text-gray-700 leading-relaxed">{script}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Posted platforms */}
                  {selected.posted_platforms && (
                    <div className="px-5 pt-5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Posted To</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.posted_platforms.split(",").filter(Boolean).map(p => (
                          <span key={p} className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full font-semibold capitalize">
                            {PLAT_CFG[p.trim()]?.icon || "📱"} {p.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Performance */}
                  {selPerfs.length > 0 && (
                    <div className="px-5 pt-5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Performance</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selPerfs.map(p => (
                          <div key={p.id} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm font-bold text-gray-800 capitalize">{p.platform}</p>
                              {p.performance_label && (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                                  ${p.performance_label === "Winner" ? "bg-amber-100 text-amber-700"
                                  : p.performance_label === "Good" ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"}`}>{p.performance_label}</span>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              {[["Reach",(p.reach||0).toLocaleString()],["Eng%",p.engagement_rate?(+p.engagement_rate).toFixed(1)+"%":"—"],["Likes",p.likes||0],["Comments",p.comments||0],["Shares",p.shares||0],["Clicks",p.clicks||0]].map(([l,v])=>(
                                <div key={l}><p className="text-gray-400">{l}</p><p className="font-bold text-gray-800">{v}</p></div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Editor notes */}
                  <div className="px-5 pt-5 pb-6">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Editor Notes</p>
                    {editing ? (
                      <textarea value={editData.editor_notes}
                        onChange={e => setEditData(p => ({ ...p, editor_notes: e.target.value }))}
                        rows={3}
                        className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none resize-none text-gray-600" />
                    ) : (
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {selected.editor_notes || <span className="text-gray-300 italic">No notes</span>}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            📊  ANALYTICS TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === "📊 Analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon:"📡", label:"Total Reach",   value:totalReach.toLocaleString(), color:BRAND_BLUE },
                { icon:"💬", label:"Avg Engagement",value:avgEng+(avgEng!=="—"?"%":""), color:"#059669" },
                { icon:"🏆", label:"Winners",        value:winnersCt, color:"#D97706" },
                { icon:"📊", label:"Posts Tracked",  value:perfs.length, color:"#7C3AED" },
              ].map(({ icon, label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <p className="text-3xl mb-2">{icon}</p>
                  <p className="text-2xl font-black text-gray-900">{value}</p>
                  <p className="text-xs font-bold mt-1" style={{ color }}>{label}</p>
                </div>
              ))}
            </div>
            {realPerfs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                <p className="text-5xl mb-4">📊</p>
                <p className="text-lg font-bold text-gray-600">No live performance data yet</p>
                <p className="text-sm text-gray-400 mt-2">Data appears once posts go live and analytics are pulled</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800">🏆 Top Performers</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {[...realPerfs].sort((a,b)=>(b.performance_score||0)-(a.performance_score||0)).slice(0,10).map(p => (
                    <div key={p.id} className="px-6 py-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{p.content_title||"Untitled"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.platform} · {p.pillar}</p>
                      </div>
                      <div className="flex gap-5 text-center flex-shrink-0">
                        {[["Reach",(p.reach||0).toLocaleString()],["Eng",p.engagement_rate?(+p.engagement_rate).toFixed(1)+"%":"—"],["Score",p.performance_score?.toFixed(1)||"—"]].map(([l,v])=>(
                          <div key={l}><p className="text-xs text-gray-400">{l}</p><p className="text-sm font-bold text-gray-800">{v}</p></div>
                        ))}
                      </div>
                      {p.performance_label && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0
                          ${p.performance_label==="Winner"?"bg-amber-100 text-amber-700"
                          :p.performance_label==="Good"?"bg-green-100 text-green-700"
                          :"bg-gray-100 text-gray-500"}`}>{p.performance_label}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            💡  IDEAS TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === "💡 Ideas" && (
          <div className="flex gap-4" style={{ height: "calc(100vh - 118px)" }}>
            <div className="w-[290px] flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-500 mb-2">{ideas.length} ideas</p>
                <div className="flex flex-wrap gap-1">
                  {["All","Brainstormed","Selected","Converted","Rejected"].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all
                        ${statusFilter===s?"bg-indigo-600 text-white":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {ideas
                  .filter(i => statusFilter==="All" || (i.status||"").includes(statusFilter.replace("Converted","Convert")))
                  .sort((a,b)=>(b.predicted_score||0)-(a.predicted_score||0))
                  .map(idea => {
                    const pCfg = PILLAR_CFG[idea.pillar] || {};
                    return (
                      <div key={idea.id}
                        onClick={() => { setSelected(idea); }}
                        className={`p-3 cursor-pointer hover:bg-indigo-50 transition-all
                          ${selected?.id===idea.id?"bg-indigo-50 border-l-[3px] border-indigo-500":""}`}>
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5">
                          {idea.idea_title||"Untitled"}
                        </p>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {idea.pillar && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium border"
                              style={{background:pCfg.bg,color:pCfg.color,borderColor:pCfg.border}}>
                              {pCfg.emoji} {idea.pillar}
                            </span>
                          )}
                          {idea.predicted_score && (
                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                              {idea.predicted_score}/10
                            </span>
                          )}
                          {idea.status && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                              style={{
                                background:idea.status==="Selected"?"#ECFDF5":idea.status?.includes("Convert")?"#EDE9FE":idea.status==="Rejected"?"#FEF2F2":"#FFFBEB",
                                color:idea.status==="Selected"?"#059669":idea.status?.includes("Convert")?"#6D28D9":idea.status==="Rejected"?"#DC2626":"#B45309"
                              }}>
                              {idea.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            {/* Idea detail */}
            <div className="flex-1 overflow-y-auto">
              {!selected ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                  <p className="text-5xl mb-3">💡</p>
                  <p className="text-lg font-semibold text-gray-500">Select an idea</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{selected.idea_title||selected.title}</h2>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {selected.pillar && <PillarTag pillar={selected.pillar} />}
                    {selected.audience && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">👤 {selected.audience}</span>}
                    {selected.predicted_score && <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Predicted: {selected.predicted_score}/10</span>}
                    {selected.winner_pattern_match && <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Winner match: {selected.winner_pattern_match}/10</span>}
                  </div>
                  {selected.concept && <div className="mb-4"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Concept</p><p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">{selected.concept}</p></div>}
                  {selected.hook_options && (
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Hook Options</p>
                      <div className="space-y-2">
                        {selected.hook_options.split("|").map((h,i)=>(
                          <div key={i} className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
                            <p className="text-sm text-indigo-800 font-medium">{h.trim().replace(/^['"]|['"]$/g,"")}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {selected.angle && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs font-bold text-gray-400 mb-1">Angle</p><p className="text-sm text-gray-700 font-medium">{selected.angle}</p></div>}
                    {selected.format_suggestion && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs font-bold text-gray-400 mb-1">Format</p><p className="text-sm text-gray-700 font-medium">{selected.format_suggestion}</p></div>}
                    {selected.best_platform && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs font-bold text-gray-400 mb-1">Best Platform</p><p className="text-sm font-bold text-gray-700">{selected.best_platform}</p></div>}
                    {selected.trend_relevance_score && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs font-bold text-gray-400 mb-1">Trend Score</p><p className="text-lg font-black text-gray-800">{selected.trend_relevance_score}/10</p></div>}
                  </div>
                  {selected.selection_reasoning && <div className="mb-4"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Why This Works</p><p className="text-sm text-gray-700 leading-relaxed">{selected.selection_reasoning}</p></div>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            🧬  WINNER DNA TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === "🧬 Winner DNA" && (
          <div className="space-y-4">
            {dna.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                <p className="text-5xl mb-4">🧬</p>
                <p className="text-lg font-bold text-gray-600">No Winner DNA yet</p>
                <p className="text-sm text-gray-400 mt-2">Patterns captured after posts hit 8.0+ performance</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...dna].sort((a,b)=>(b.avg_score||0)-(a.avg_score||0)).map(w => {
                  const pCfg = PILLAR_CFG[w.winning_pillar]||{};
                  return (
                    <div key={w.id} className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
                      <div className="p-4 border-b border-amber-100" style={{background:"#FFFBEB"}}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-gray-800 text-sm leading-snug">{w.title}</p>
                          {w.avg_score && <span className="text-lg font-black text-amber-600 flex-shrink-0">★{w.avg_score}</span>}
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {w.winning_pillar && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:pCfg.bg,color:pCfg.color}}>{pCfg.emoji} {w.winning_pillar}</span>}
                          {w.winning_platform && <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">{w.winning_platform}</span>}
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        {[["Hook Style",w.winning_hook_style],["Trigger",w.emotional_trigger],["CTA Style",w.winning_cta_style],["Key Phrases",w.key_phrases]].filter(([,v])=>v).map(([l,v])=>(
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
