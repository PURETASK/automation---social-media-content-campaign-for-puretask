import { useState, useEffect } from "react";
import { ContentDraft, PostPerformance, ContentIdea, MarketResearch, WinnerDNA } from "@/api/entities";

function Pill({ label, style }) {
  if (!label) return null;
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${style}`}>{label}</span>;
}

const PILLAR_STYLE = { Convenience:"bg-blue-50 text-blue-600", Trust:"bg-green-50 text-green-600", Transformation:"bg-violet-50 text-violet-600", Recruitment:"bg-orange-50 text-orange-600", Local:"bg-teal-50 text-teal-600", Proof:"bg-pink-50 text-pink-600" };
const STATUS_STYLE = { Draft:"bg-gray-100 text-gray-600", "Pending Approval":"bg-yellow-100 text-yellow-700", Approved:"bg-green-100 text-green-700", Rejected:"bg-red-100 text-red-600", Scheduled:"bg-blue-100 text-blue-700", Posted:"bg-purple-100 text-purple-700" };
const PLATFORM_ICONS = { platform_facebook:"👥", platform_instagram:"📸", platform_linkedin:"💼", platform_tiktok:"🎵", platform_x:"𝕏", platform_pinterest:"📌", platform_threads:"🧵", platform_youtube:"▶️" };
const ALL_PLATFORMS = Object.keys(PLATFORM_ICONS);

export default function Overview() {
  const [drafts, setDrafts] = useState([]);
  const [perfs, setPerfs] = useState([]);
  const [dna, setDna] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [activePlatform, setActivePlatform] = useState("platform_facebook");
  const [pillarFilter, setPillarFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    Promise.all([
      ContentDraft.list("-created_date"),
      PostPerformance.list("-posted_at"),
      WinnerDNA.list("-avg_score"),
    ]).then(([d, p, w]) => {
      setDrafts(Array.isArray(d) ? d : []);
      setPerfs(Array.isArray(p) ? p : []);
      setDna(Array.isArray(w) ? w : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const pillars = ["All","Convenience","Trust","Transformation","Recruitment","Local","Proof"];
  const statuses = ["All","Approved","Draft","Posted","Rejected"];

  const filtered = drafts.filter(d => {
    if (pillarFilter !== "All" && d.pillar !== pillarFilter) return false;
    if (statusFilter !== "All" && d.status !== statusFilter) return false;
    return true;
  });

  const totalApproved = drafts.filter(d => d.status === "Approved").length;
  const totalPosted = drafts.filter(d => d.status === "Posted").length;
  const totalDrafts = drafts.length;
  const pillarCounts = drafts.reduce((a, d) => { if (d.pillar) a[d.pillar] = (a[d.pillar]||0)+1; return a; }, {});
  const cityCounts = drafts.filter(d=>d.city).reduce((a,d)=>{ a[d.city]=(a[d.city]||0)+1; return a; },{});
  const heygenReady = drafts.filter(d=>d.heygen_status==="Completed").length;
  const heygenQueued = drafts.filter(d=>d.heygen_status==="Queued").length;
  const winners = drafts.filter(d=>d.is_winner).length;
  const recruitmentCount = drafts.filter(d=>d.pillar==="Recruitment").length;
  const cityCount = drafts.filter(d=>d.pillar==="Local").length;

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500 font-medium">Loading PureTask Content Engine...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO HEADER */}
      <div style={{background: "linear-gradient(135deg, #0099FF 0%, #0066CC 100%)"}} className="text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="font-black text-2xl" style={{color:"#0099FF"}}>P</span>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">PureTask Content Engine</h1>
              <p className="text-blue-100 text-sm mt-0.5">Fully Automated Social Media System · <a href="https://www.puretask.co" target="_blank" rel="noreferrer" className="underline text-white font-semibold">www.puretask.co</a></p>
            </div>
            <div className="ml-auto hidden md:flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
              <span className="text-green-300 text-lg">●</span>
              <span className="text-sm font-semibold">System Active</span>
            </div>
          </div>

          {/* Top stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              ["📝", totalDrafts, "Total Drafts"],
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

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* SYSTEM OVERVIEW CARDS */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">🤖 What This System Does</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "📅", title: "Monday — Full Week Generated", desc: "Every Monday at 6am: market research scanned, best ideas selected, full week of content drafted, scored, and auto-approved if ≥ 7.5/10. Zero manual work.", color: "bg-blue-50 border-blue-100" },
              { icon: "📲", title: "Daily — Content Posts Automatically", desc: "7am every day: approved posts go live across Facebook, Instagram, LinkedIn, Pinterest, Threads, and X. Platform copy is adapted for each — never copy-pasted.", color: "bg-green-50 border-green-100" },
              { icon: "🎬", title: "Wednesday — Videos Generated", desc: "HeyGen AI videos generated weekly from scripts. 9:16 vertical for TikTok/Reels. 16:9 for Facebook/LinkedIn. Auto-scored, auto-posted if quality passes.", color: "bg-purple-50 border-purple-100" },
              { icon: "📊", title: "Daily — Analytics Tracked", desc: "Performance data pulled from every platform daily. Posts scored as Winner / Good / Average / Underperformer. Winners feed the next week's brainstorm.", color: "bg-orange-50 border-orange-100" },
              { icon: "🧬", title: "Every 2 Days — Winner DNA Extracted", desc: "Winning hooks, emotional triggers, and formats get extracted and stored. The brainstorm engine replicates what works and avoids what doesn't.", color: "bg-pink-50 border-pink-100" },
              { icon: "🏙️", title: "Tuesday — City Content", desc: "Hyper-local content generated for LA, NYC, Chicago, Houston, Austin and more. City-specific CTAs, landmarks, and hashtags. Local content converts 40-60% better.", color: "bg-teal-50 border-teal-100" },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className={`rounded-2xl border p-5 ${color}`}>
                <p className="text-2xl mb-2">{icon}</p>
                <p className="font-bold text-gray-800 text-sm mb-1">{title}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PILLAR BREAKDOWN */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">🎯 Content Pillars</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { pillar: "Convenience", icon: "⚡", desc: "Book in 3 min. 6 hrs saved.", color: "bg-blue-50 border-blue-100 text-blue-700" },
              { pillar: "Trust", icon: "🔒", desc: "GPS, background checks, photo proof.", color: "bg-green-50 border-green-100 text-green-700" },
              { pillar: "Transformation", icon: "✨", desc: "Before & after. Real results.", color: "bg-violet-50 border-violet-100 text-violet-700" },
              { pillar: "Recruitment", icon: "💰", desc: "Keep 80-85%. Beat TaskRabbit.", color: "bg-orange-50 border-orange-100 text-orange-700" },
              { pillar: "Local", icon: "📍", desc: `${cityCount} city-specific posts live.`, color: "bg-teal-50 border-teal-100 text-teal-700" },
              { pillar: "Proof", icon: "⭐", desc: "4.9★ · 10K+ clients · 98% sat.", color: "bg-pink-50 border-pink-100 text-pink-700" },
            ].map(({ pillar, icon, desc, color }) => (
              <div key={pillar} className={`rounded-2xl border p-4 ${color}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="font-bold text-sm">{pillar}</span>
                  </div>
                  <span className="text-2xl font-black">{pillarCounts[pillar]||0}</span>
                </div>
                <p className="text-xs opacity-70">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CITY COVERAGE */}
        {Object.keys(cityCounts).length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">🏙️ City Coverage</h2>
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
              { icon:"👥", name:"Facebook", key:"platform_facebook", color:"bg-blue-50 text-blue-600 border-blue-100" },
              { icon:"📸", name:"Instagram", key:"platform_instagram", color:"bg-pink-50 text-pink-600 border-pink-100" },
              { icon:"💼", name:"LinkedIn", key:"platform_linkedin", color:"bg-sky-50 text-sky-700 border-sky-100" },
              { icon:"🎵", name:"TikTok", key:"platform_tiktok", color:"bg-gray-50 text-gray-700 border-gray-200" },
              { icon:"𝕏", name:"X / Twitter", key:"platform_x", color:"bg-gray-50 text-gray-800 border-gray-200" },
              { icon:"📌", name:"Pinterest", key:"platform_pinterest", color:"bg-red-50 text-red-600 border-red-100" },
              { icon:"🧵", name:"Threads", key:"platform_threads", color:"bg-gray-50 text-gray-700 border-gray-200" },
              { icon:"▶️", name:"YouTube", key:"platform_youtube", color:"bg-red-50 text-red-600 border-red-100" },
            ].map(({ icon, name, key, color }) => {
              const count = drafts.filter(d => d[key]).length;
              return (
                <div key={name} className={`rounded-2xl border p-4 ${color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{icon}</span>
                      <span className="font-semibold text-sm">{name}</span>
                    </div>
                    <span className="text-xl font-black">{count}</span>
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
            <h2 className="text-lg font-bold text-gray-800">📋 Content Library ({filtered.length} drafts)</h2>
            <div className="flex gap-2 flex-wrap">
              {statuses.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition ${statusFilter===s?"bg-blue-500 text-white":"bg-white border border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {pillars.map(p => (
              <button key={p} onClick={() => setPillarFilter(p)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${pillarFilter===p?"bg-gray-800 text-white":p==="All"?"bg-gray-100 text-gray-600":PILLAR_STYLE[p]||"bg-gray-100 text-gray-600"}`}>
                {p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(d => (
              <div key={d.id}
                onClick={() => { setSelected(selected?.id === d.id ? null : d); setActivePlatform("platform_facebook"); }}
                className={`bg-white rounded-2xl border p-4 cursor-pointer hover:shadow-md transition ${selected?.id===d.id?"border-blue-400 shadow-md":"border-gray-100"}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-gray-800 text-sm leading-tight">{d.is_winner?"🏆 ":""}{d.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_STYLE[d.status]||"bg-gray-100 text-gray-500"}`}>{d.status}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {d.pillar && <Pill label={d.pillar} style={PILLAR_STYLE[d.pillar]||"bg-gray-100 text-gray-500"}/>}
                  {d.audience && <Pill label={d.audience} style="bg-gray-50 text-gray-500"/>}
                  {d.city && <Pill label={"📍 "+d.city} style="bg-teal-50 text-teal-600"/>}
                  {d.heygen_status && d.heygen_status !== "None" && <Pill label={"🎬 "+d.heygen_status} style="bg-blue-50 text-blue-500"/>}
                </div>
                {d.hook && <p className="text-xs text-gray-500 italic line-clamp-2">"{d.hook}"</p>}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-0.5">
                    {ALL_PLATFORMS.filter(k=>d[k]).map(k=><span key={k} className="text-sm">{PLATFORM_ICONS[k]}</span>)}
                  </div>
                  {[d.clarity_score,d.relatability_score,d.conversion_score].every(s=>s!==null&&s!==undefined) && (
                    <span className="text-xs font-bold text-blue-600">
                      {(((d.clarity_score||0)+(d.relatability_score||0)+(d.conversion_score||0))/3).toFixed(1)} avg
                    </span>
                  )}
                </div>

                {/* EXPANDED VIEW */}
                {selected?.id === d.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-1 overflow-x-auto mb-3">
                      {ALL_PLATFORMS.map(k => (
                        <button key={k} onClick={e=>{e.stopPropagation();setActivePlatform(k);}}
                          className={`text-xs px-2 py-1 rounded-lg flex-shrink-0 transition ${activePlatform===k?"bg-blue-500 text-white":"bg-gray-100 text-gray-600"}`}>
                          {PLATFORM_ICONS[k]} {k.replace("platform_","").charAt(0).toUpperCase()+k.replace("platform_","").slice(1)}
                          {!d[k]&&<span className="ml-1 text-red-300">✗</span>}
                        </button>
                      ))}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[60px]">
                      {d[activePlatform] || <span className="text-gray-400 italic">No copy for this platform.</span>}
                    </div>
                    {(d.cta_1||d.cta_2||d.cta_3) && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {[d.cta_1,d.cta_2,d.cta_3].filter(Boolean).map((c,i)=>(
                          <span key={i} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-lg border border-green-100">{c}</span>
                        ))}
                      </div>
                    )}
                    {d.image_prompt && (
                      <div className="mt-3 bg-blue-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-blue-500 mb-1">🎨 Image Prompt</p>
                        <p className="text-xs text-blue-700 leading-relaxed">{d.image_prompt}</p>
                      </div>
                    )}
                    {(d.script_15sec||d.script_30sec) && (
                      <div className="mt-3 bg-purple-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-purple-500 mb-1">🎬 Video Script</p>
                        <p className="text-xs text-purple-700 leading-relaxed">{d.script_30sec||d.script_15sec}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* WINNER DNA */}
        {dna.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">🧬 Winner DNA Patterns</h2>
            <div className="grid gap-3">
              {dna.map(d => (
                <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{d.title}</h3>
                      <div className="flex gap-1.5 flex-wrap mt-1">
                        {d.winning_pillar && <Pill label={d.winning_pillar} style={PILLAR_STYLE[d.winning_pillar]||"bg-gray-100 text-gray-500"}/>}
                        {d.winning_platform && <Pill label={d.winning_platform} style="bg-blue-50 text-blue-500"/>}
                        {d.winning_format && <Pill label={d.winning_format} style="bg-purple-50 text-purple-500"/>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-yellow-500">{d.avg_score ? Number(d.avg_score).toFixed(1) : "—"}</p>
                      <p className="text-xs text-gray-400">avg score</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[["Hook Style",d.winning_hook_style],["Emotional Trigger",d.emotional_trigger],["CTA Style",d.winning_cta_style],["Key Phrases",d.key_phrases]].filter(([,v])=>v).map(([l,v])=>(
                      <div key={l} className="bg-gray-50 rounded-lg p-2.5"><p className="text-gray-400 font-medium mb-0.5">{l}</p><p className="text-gray-700">{v}</p></div>
                    ))}
                  </div>
                  {d.pattern_notes && <p className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2 mt-2 leading-relaxed">{d.pattern_notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUTOMATION STATUS */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">⚙️ Automation Schedule</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {[
              { day:"Sunday 6pm", name:"Market Research Scan", desc:"Scans trending topics, competitors, seasonal angles", status:"active" },
              { day:"Monday 6am", name:"Brainstorm & Auto-Select", desc:"Picks best ideas using Winner DNA + market data", status:"active" },
              { day:"Monday 8am", name:"Weekly Content Generation", desc:"Full week of drafts created, scored, auto-approved ≥7.5", status:"active" },
              { day:"Tuesday 8am", name:"City Content Generation", desc:"Hyper-local posts for LA, NYC, Chicago, Houston, Austin", status:"active" },
              { day:"Wednesday 9am", name:"HeyGen Video Generation", desc:"AI videos generated, scored, auto-posted to TikTok/Reels", status:"active" },
              { day:"Daily 7am", name:"Content Drops", desc:"Approved posts go live across all platforms automatically", status:"active" },
              { day:"Daily 10am", name:"Analytics Pull", desc:"Real stats pulled from every platform, posts scored", status:"active" },
              { day:"Every 2 days", name:"Winner DNA Extractor", desc:"Winning patterns extracted, feed next Monday's brainstorm", status:"active" },
              { day:"Every 2 weeks Thu", name:"Recruitment Content", desc:"6 angles targeting cleaners — LinkedIn + TikTok primary", status:"active" },
            ].map(({ day, name, desc, status }) => (
              <div key={name} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                <div className="w-36 flex-shrink-0">
                  <p className="text-xs font-bold text-blue-600">{day}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{name}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-green-400"/>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center py-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"#0099FF"}}>
              <span className="text-white font-black text-sm">P</span>
            </div>
            <span className="font-bold text-gray-700">PureTask Content Engine</span>
          </div>
          <p className="text-xs text-gray-400">Fully automated · Read-only view · <a href="https://www.puretask.co" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">www.puretask.co</a></p>
        </div>
      </div>
    </div>
  );
}
