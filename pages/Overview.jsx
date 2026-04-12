import { useState, useEffect } from "react";
import { ContentDraft, PostPerformance, WinnerDNA } from "@/api/entities";

const PILLAR_STYLE = {
  Convenience: "bg-blue-50 text-blue-600 border-blue-100",
  Trust: "bg-green-50 text-green-600 border-green-100",
  Transformation: "bg-violet-50 text-violet-600 border-violet-100",
  Recruitment: "bg-orange-50 text-orange-600 border-orange-100",
  Local: "bg-teal-50 text-teal-600 border-teal-100",
  Proof: "bg-pink-50 text-pink-600 border-pink-100",
};

const STATUS_STYLE = {
  Draft: "bg-gray-100 text-gray-600",
  "Pending Approval": "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
  Scheduled: "bg-blue-100 text-blue-700",
  Posted: "bg-purple-100 text-purple-700",
};

const PLATFORM_ICONS = {
  platform_facebook: "👥",
  platform_instagram: "📸",
  platform_linkedin: "💼",
  platform_tiktok: "🎵",
  platform_x: "𝕏",
  platform_pinterest: "📌",
  platform_threads: "🧵",
};

export default function Overview() {
  const [drafts, setDrafts] = useState([]);
  const [dna, setDna] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [activePlatform, setActivePlatform] = useState("platform_facebook");
  const [pillarFilter, setPillarFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    async function load() {
      try {
        const [d, w] = await Promise.all([
          ContentDraft.list(),
          WinnerDNA.list(),
        ]);
        setDrafts(Array.isArray(d) ? d : []);
        setDna(Array.isArray(w) ? w : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pillars = ["All", "Convenience", "Trust", "Transformation", "Recruitment", "Local", "Proof"];
  const statuses = ["All", "Approved", "Draft", "Posted", "Rejected"];

  const filtered = drafts.filter((d) => {
    if (pillarFilter !== "All" && d.pillar !== pillarFilter) return false;
    if (statusFilter !== "All" && d.status !== statusFilter) return false;
    return true;
  });

  const totalApproved = drafts.filter((d) => d.status === "Approved").length;
  const totalPosted = drafts.filter((d) => d.status === "Posted").length;
  const heygenQueued = drafts.filter((d) => d.heygen_status === "Queued").length;
  const winners = drafts.filter((d) => d.is_winner).length;
  const pillarCounts = drafts.reduce((a, d) => { if (d.pillar) a[d.pillar] = (a[d.pillar] || 0) + 1; return a; }, {});
  const cityCounts = drafts.filter((d) => d.city).reduce((a, d) => { a[d.city] = (a[d.city] || 0) + 1; return a; }, {});

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading PureTask Content Engine...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <p className="text-4xl mb-4">⚠️</p>
        <p className="text-gray-700 font-semibold mb-2">Couldn't load data</p>
        <p className="text-gray-400 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #0099FF 0%, #0066CC 100%)" }} className="text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="font-black text-2xl" style={{ color: "#0099FF" }}>P</span>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">PureTask Content Engine</h1>
              <p className="text-blue-100 text-sm mt-0.5">
                Fully Automated Social Media System ·{" "}
                <a href="https://www.puretask.co" target="_blank" rel="noreferrer" className="underline text-white font-semibold">
                  www.puretask.co
                </a>
              </p>
            </div>
            <div className="ml-auto hidden md:flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
              <span className="text-green-300 text-lg">●</span>
              <span className="text-sm font-semibold">System Active</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              ["📝", drafts.length, "Total Drafts"],
              ["✅", totalApproved, "Approved"],
              ["📤", totalPosted, "Posted"],
              ["🎬", heygenQueued, "Videos Queued"],
              ["🏆", winners, "Winners"],
            ].map(([icon, val, label]) => (
              <div key={label} className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">{icon}</p>
                <p className="text-3xl font-black">{val}</p>
                <p className="text-blue-100 text-xs font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* WHAT THE SYSTEM DOES */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">🤖 How The System Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "📅", title: "Monday — Full Week Generated", desc: "Market research scanned, best ideas selected, full week of content drafted, scored, and auto-approved if ≥ 7.5/10. Zero manual work.", color: "bg-blue-50 border-blue-100" },
              { icon: "📲", title: "Daily — Posts Go Live Automatically", desc: "7am every day: approved posts go live across Facebook, Instagram, LinkedIn, Pinterest, Threads, and X. Copy is adapted per platform — never copy-pasted.", color: "bg-green-50 border-green-100" },
              { icon: "🎬", title: "Wednesday — AI Videos Generated", desc: "HeyGen AI creates videos from scripts. 9:16 vertical for TikTok/Reels. 16:9 for Facebook/LinkedIn. Auto-scored, auto-posted if quality passes ≥7.5.", color: "bg-purple-50 border-purple-100" },
              { icon: "📊", title: "Daily — Analytics Tracked", desc: "Performance pulled from every platform. Posts scored as Winner / Good / Average / Underperformer. Winners feed next week's brainstorm.", color: "bg-orange-50 border-orange-100" },
              { icon: "🧬", title: "Every 2 Days — Winner DNA Extracted", desc: "Winning hooks, emotional triggers, and formats extracted and stored. The brainstorm engine replicates what works and avoids what doesn't.", color: "bg-pink-50 border-pink-100" },
              { icon: "🏙️", title: "Tuesday — City Content", desc: "Hyper-local content for LA, NYC, Chicago, Houston, Austin and more. City CTAs, landmarks, local hashtags. Local content converts 40-60% better.", color: "bg-teal-50 border-teal-100" },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className={`rounded-2xl border p-5 ${color}`}>
                <p className="text-2xl mb-2">{icon}</p>
                <p className="font-bold text-gray-800 text-sm mb-1">{title}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PILLARS */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">🎯 Content Pillars</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { pillar: "Convenience", icon: "⚡", desc: "Book in 3 min. 6 hrs saved per visit." },
              { pillar: "Trust", icon: "🔒", desc: "GPS, background checks, photo proof." },
              { pillar: "Transformation", icon: "✨", desc: "Before & after. Real visible results." },
              { pillar: "Recruitment", icon: "💰", desc: "Keep 80-85%. Beat TaskRabbit & Handy." },
              { pillar: "Local", icon: "📍", desc: `${Object.keys(cityCounts).length} cities covered with local content.` },
              { pillar: "Proof", icon: "⭐", desc: "4.9★ · 10K+ clients · 98% satisfaction." },
            ].map(({ pillar, icon, desc }) => (
              <div key={pillar} className={`rounded-2xl border p-4 ${PILLAR_STYLE[pillar] || "bg-gray-50 border-gray-100"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="font-bold text-sm">{pillar}</span>
                  </div>
                  <span className="text-2xl font-black">{pillarCounts[pillar] || 0}</span>
                </div>
                <p className="text-xs opacity-70">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CITY COVERAGE */}
        {Object.keys(cityCounts).length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">🏙️ City Coverage ({Object.keys(cityCounts).length} cities)</h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex flex-wrap gap-2">
                {Object.entries(cityCounts).map(([city, count]) => (
                  <div key={city} className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-3 py-1.5">
                    <span className="text-sm">📍</span>
                    <span className="text-sm font-semibold text-teal-700">{city}</span>
                    <span className="text-xs bg-teal-200 text-teal-800 rounded-full px-1.5 py-0.5 font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PLATFORM COVERAGE */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">📱 Platform Coverage</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: "👥", name: "Facebook", key: "platform_facebook", color: "bg-blue-50 text-blue-700 border-blue-100" },
              { icon: "📸", name: "Instagram", key: "platform_instagram", color: "bg-pink-50 text-pink-700 border-pink-100" },
              { icon: "💼", name: "LinkedIn", key: "platform_linkedin", color: "bg-sky-50 text-sky-700 border-sky-100" },
              { icon: "🎵", name: "TikTok", key: "platform_tiktok", color: "bg-gray-50 text-gray-700 border-gray-200" },
              { icon: "𝕏", name: "X / Twitter", key: "platform_x", color: "bg-gray-50 text-gray-800 border-gray-200" },
              { icon: "📌", name: "Pinterest", key: "platform_pinterest", color: "bg-red-50 text-red-600 border-red-100" },
              { icon: "🧵", name: "Threads", key: "platform_threads", color: "bg-gray-50 text-gray-700 border-gray-200" },
              { icon: "▶️", name: "YouTube", key: "platform_youtube", color: "bg-red-50 text-red-600 border-red-100" },
            ].map(({ icon, name, key, color }) => {
              const count = drafts.filter((d) => d[key]).length;
              return (
                <div key={name} className={`rounded-2xl border p-4 ${color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{icon}</span>
                      <span className="font-semibold text-sm">{name}</span>
                    </div>
                    <span className="text-2xl font-black">{count}</span>
                  </div>
                  <p className="text-xs opacity-60 mt-1">{count} posts ready</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONTENT LIBRARY */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-lg font-bold text-gray-800">
              📋 Content Library <span className="text-gray-400 font-normal">({filtered.length} of {drafts.length})</span>
            </h2>
          </div>

          {/* Filters */}
          <div className="space-y-2 mb-5">
            <div className="flex gap-2 flex-wrap">
              {statuses.map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${statusFilter === s ? "bg-blue-500 text-white shadow" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {pillars.map((p) => (
                <button key={p} onClick={() => setPillarFilter(p)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${pillarFilter === p ? "bg-gray-800 text-white shadow" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500">No drafts match this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((d) => {
                const avg = [d.clarity_score, d.relatability_score, d.conversion_score].every(s => s != null)
                  ? ((d.clarity_score + d.relatability_score + d.conversion_score) / 3).toFixed(1)
                  : null;
                const isOpen = selected?.id === d.id;

                return (
                  <div key={d.id}
                    onClick={() => { setSelected(isOpen ? null : d); setActivePlatform("platform_facebook"); }}
                    className={`bg-white rounded-2xl border cursor-pointer transition-all ${isOpen ? "border-blue-400 shadow-lg" : "border-gray-100 hover:shadow-md hover:border-gray-200"}`}>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-semibold text-gray-800 text-sm leading-tight">
                          {d.is_winner ? "🏆 " : ""}{d.title}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_STYLE[d.status] || "bg-gray-100 text-gray-500"}`}>
                          {d.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {d.pillar && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${PILLAR_STYLE[d.pillar] || "bg-gray-50 border-gray-100 text-gray-500"}`}>
                            {d.pillar}
                          </span>
                        )}
                        {d.audience && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
                            {d.audience}
                          </span>
                        )}
                        {d.city && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-100">
                            📍 {d.city}
                          </span>
                        )}
                        {d.heygen_status && d.heygen_status !== "None" && d.heygen_status !== "none" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 border border-blue-100">
                            🎬 {d.heygen_status}
                          </span>
                        )}
                      </div>

                      {d.hook && (
                        <p className="text-xs text-gray-400 italic line-clamp-2 mb-2">"{d.hook}"</p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex gap-0.5">
                          {Object.keys(PLATFORM_ICONS).filter((k) => d[k]).map((k) => (
                            <span key={k} className="text-sm">{PLATFORM_ICONS[k]}</span>
                          ))}
                        </div>
                        {avg && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {avg} / 10
                          </span>
                        )}
                      </div>
                    </div>

                    {/* EXPANDED */}
                    {isOpen && (
                      <div className="border-t border-gray-100 p-4">
                        {/* Platform tabs */}
                        <div className="flex gap-1 overflow-x-auto mb-3 pb-1">
                          {Object.keys(PLATFORM_ICONS).map((k) => (
                            <button key={k} onClick={(e) => { e.stopPropagation(); setActivePlatform(k); }}
                              className={`text-xs px-2.5 py-1 rounded-lg flex-shrink-0 transition font-medium ${activePlatform === k ? "bg-blue-500 text-white" : d[k] ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-gray-50 text-gray-300"}`}>
                              {PLATFORM_ICONS[k]} {k.replace("platform_", "")}
                            </button>
                          ))}
                        </div>

                        {/* Platform copy */}
                        <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[80px] mb-3">
                          {d[activePlatform] || <span className="text-gray-300 italic text-xs">No copy for this platform.</span>}
                        </div>

                        {/* CTAs */}
                        {(d.cta_1 || d.cta_2 || d.cta_3) && (
                          <div className="flex flex-col gap-1.5 mb-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">CTAs</p>
                            {[d.cta_1, d.cta_2, d.cta_3].filter(Boolean).map((c, i) => (
                              <span key={i} className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">{c}</span>
                            ))}
                          </div>
                        )}

                        {/* Image prompt */}
                        {d.image_prompt && (
                          <div className="bg-blue-50 rounded-xl p-3 mb-3">
                            <p className="text-xs font-semibold text-blue-500 mb-1">🎨 Image Prompt</p>
                            <p className="text-xs text-blue-700 leading-relaxed">{d.image_prompt}</p>
                          </div>
                        )}

                        {/* Video script */}
                        {(d.script_30sec || d.script_15sec) && (
                          <div className="bg-purple-50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-purple-500 mb-1">🎬 Video Script (30s)</p>
                            <p className="text-xs text-purple-700 leading-relaxed">{d.script_30sec || d.script_15sec}</p>
                          </div>
                        )}

                        {/* Scores */}
                        {avg && (
                          <div className="flex gap-2 mt-3">
                            {[["Clarity", d.clarity_score], ["Relatability", d.relatability_score], ["Conversion", d.conversion_score]].map(([l, v]) => (
                              <div key={l} className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-xs text-gray-400">{l}</p>
                                <p className="font-bold text-gray-700">{v}</p>
                              </div>
                            ))}
                            <div className="flex-1 bg-blue-50 rounded-lg p-2 text-center">
                              <p className="text-xs text-blue-400">Average</p>
                              <p className="font-bold text-blue-600">{avg}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* WINNER DNA */}
        {dna.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">🧬 Winner DNA Patterns</h2>
            <div className="grid gap-3">
              {dna.map((d) => (
                <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{d.title}</h3>
                      <div className="flex gap-1.5 flex-wrap mt-1">
                        {d.winning_pillar && <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PILLAR_STYLE[d.winning_pillar] || "bg-gray-50 border-gray-100 text-gray-500"}`}>{d.winning_pillar}</span>}
                        {d.winning_platform && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 border border-blue-100">{d.winning_platform}</span>}
                      </div>
                    </div>
                    {d.avg_score && (
                      <div className="text-right">
                        <p className="text-2xl font-black text-yellow-500">{Number(d.avg_score).toFixed(1)}</p>
                        <p className="text-xs text-gray-400">avg score</p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[["Hook Style", d.winning_hook_style], ["Emotional Trigger", d.emotional_trigger], ["CTA Style", d.winning_cta_style], ["Key Phrases", d.key_phrases]].filter(([, v]) => v).map(([l, v]) => (
                      <div key={l} className="bg-gray-50 rounded-lg p-2.5 text-xs">
                        <p className="text-gray-400 font-medium mb-0.5">{l}</p>
                        <p className="text-gray-700">{v}</p>
                      </div>
                    ))}
                  </div>
                  {d.pattern_notes && <p className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2 mt-2 leading-relaxed">{d.pattern_notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUTOMATION SCHEDULE */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">⚙️ Automation Schedule</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {[
              { day: "Sunday 6pm", name: "Market Research Scan", desc: "Scans trending topics, competitors, seasonal angles" },
              { day: "Monday 6am", name: "Brainstorm & Auto-Select", desc: "Picks best ideas using Winner DNA + market data" },
              { day: "Monday 8am", name: "Weekly Content Generation", desc: "Full week of drafts created, scored, auto-approved ≥7.5" },
              { day: "Tuesday 8am", name: "City Content Generation", desc: "Hyper-local posts for LA, NYC, Chicago, Houston, Austin" },
              { day: "Wednesday 9am", name: "HeyGen Video Generation", desc: "AI videos generated, scored, auto-posted if ≥7.5" },
              { day: "Daily 7am", name: "Content Drops", desc: "Approved posts go live across all platforms automatically" },
              { day: "Daily 10am", name: "Analytics Pull", desc: "Real engagement stats pulled, posts scored and labeled" },
              { day: "Every 2 days", name: "Winner DNA Extractor", desc: "Winning patterns feed next Monday's brainstorm" },
              { day: "Every 2 weeks Thu", name: "Recruitment Content", desc: "6 angles targeting cleaners — LinkedIn + TikTok primary" },
            ].map(({ day, name, desc }) => (
              <div key={name} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                <div className="w-36 flex-shrink-0">
                  <p className="text-xs font-bold text-blue-600">{day}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{name}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center py-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#0099FF" }}>
              <span className="text-white font-black text-sm">P</span>
            </div>
            <span className="font-bold text-gray-700">PureTask Content Engine</span>
          </div>
          <p className="text-xs text-gray-400">
            Fully automated · Read-only view ·{" "}
            <a href="https://www.puretask.co" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
              www.puretask.co
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
