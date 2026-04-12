# PureTask — Automated Social Media Content Engine
**Version:** 3.1 · **Last Updated:** April 12, 2026

> Fully autonomous AI content system for PureTask — a trust-first home cleaning marketplace.
> Generates, scores, images, and posts content across 7 platforms with zero manual intervention.
> Live at: **https://www.puretask.co**

---

## 🚀 SYSTEM STATUS
- **Active automations:** 16
- **Total content drafts:** 71+
- **Platforms connected:** Facebook, Instagram, LinkedIn, Pinterest, TikTok, YouTube, Threads
- **Scoring threshold:** 7.5/10 average required to auto-approve
- **Content pillars:** Convenience, Trust, Transformation, Recruitment, Local, Proof, Seniors, Spring

---

## 📁 REPOSITORY STRUCTURE

```
/
├── README.md                          ← This file — full system overview
│
├── puretask-assets/                   ← Strategy docs, guidelines, brand resources
│   ├── automation-architecture.md     ← Full automation map + entity data model
│   ├── brand-voice-guide.md           ← Brand voice, tone, messaging rules
│   ├── competitive-battlecard.html    ← vs Handy, TaskRabbit, generic apps
│   ├── content-metrics-dashboard.html ← Performance tracking dashboard
│   ├── content-scoring-rubric.md      ← v3.0 scoring system with penalties
│   ├── master-hooks-library.md        ← All proven hooks by pillar + audience
│   ├── platform-playbook.md           ← Per-platform rules, formats, best times
│   ├── seniors-content-guidelines.md  ← Full seniors audience strategy
│   ├── spring-campaign-guidelines.md  ← Spring 2026 campaign (340% surge)
│   ├── transformation-proof-strategy.md ← Handling Transformation + Proof without real photos
│   ├── winner-dna-patterns.md         ← Confirmed winning patterns from real data
│   ├── heygen-video-guide.md          ← HeyGen video generation guide
│   ├── heygen-video-scripts.md        ← All video scripts
│   ├── heygen-finished-videos.md      ← Completed video tracker
│   ├── EXECUTION-SUMMARY-2026-04-12.md ← April 12 execution log
│   ├── SYSTEM-STATUS-2026-04-12.md    ← April 12 system status
│   └── video-scripts/                 ← Individual script files
│       ├── script-01-weekend-reclaimed.md
│       ├── script-02-before-after.md
│       ├── script-03-trust-vetting.md
│       ├── script-04-family-saturdays.md
│       └── script-05-recruitment.md
│
├── functions/                         ← Backend functions (Deno runtime)
│   ├── generateImages.ts              ← DALL-E 3 image pipeline v2.0
│   ├── generateSeniorsContent.ts      ← Seniors audience content (8 angles)
│   ├── generateSpringCampaign.ts      ← Spring 2026 campaign (9 angles)
│   ├── generateCityContent.ts         ← City-specific local content
│   ├── generateRecruitmentContent.ts  ← Cleaner recruitment content
│   ├── generateHeyGenVideo.ts         ← HeyGen AI video generation
│   ├── generateDailyContent.ts        ← Core daily content engine
│   ├── generateDailyContentV2.ts      ← V2 with improved scoring
│   ├── postToSocials.ts               ← Ayrshare multi-platform posting
│   ├── pullAnalytics.ts               ← Platform analytics pull
│   ├── weeklyStrategyReport.ts        ← Weekly strategy changelog
│   ├── autoCommitAssets.ts            ← GitHub asset sync
│   ├── syncEntitySchemas.ts           ← Entity schema sync
│   ├── contentEngine.ts               ← Core orchestration
│   ├── batchCreateDrafts.ts           ← Bulk draft creation
│   ├── generateKlingVideo.ts          ← Kling AI video (alternative)
│   └── createDailyDrops.ts            ← Daily drop orchestration
│
├── pages/                             ← Dashboard UI (React/JSX)
│   ├── ContentDashboard.jsx           ← Main content management dashboard
│   ├── BrainstormDashboard.jsx        ← Brainstorm + idea management
│   └── Overview.jsx                   ← Read-only partner overview
│
├── entities/                          ← Entity schemas (data models)
│   ├── ContentDraft.json
│   ├── ContentIdea.json
│   ├── MarketResearch.json
│   ├── PostPerformance.json
│   └── WinnerDNA.json
│
├── drafts/                            ← Live draft tracking
│   ├── all-drafts.md                  ← All drafts index
│   ├── high-scoring.md                ← Drafts scoring 8.5+
│   ├── accepted.md                    ← Auto-approved drafts
│   └── posted.md                      ← Posted content log
│
└── content-packs/                     ← Weekly content packs
    └── week-1/                        ← Week 1 launch content
        ├── images/                    ← Generated images
        └── ...
```

---

## 🤖 AUTOMATION SCHEDULE

| Time | Automation | What Happens |
|------|-----------|-------------|
| Sunday 6pm PT | Market Research Scan | Scans trends, competitors, seasonal signals |
| Monday 6am PT | Brainstorm & Auto-Select | Picks best ideas using Winner DNA + research |
| Monday 8am PT | Weekly Content Generation | Full week of drafts — auto-approved if ≥7.5 |
| Monday 5pm PT | Weekly Strategy Report | Changelog pushed to GitHub |
| Tuesday 8am PT | City Content Generation | LA, NYC, Chicago, Houston, Phoenix |
| Wednesday 9am PT | HeyGen Video Generation | AI videos from queued scripts |
| Thursday (bi-weekly) | Recruitment Content | 6 angles targeting professional cleaners |
| Friday 8am PT | Seniors Content | 8 angles, 2 segments (65+ self + adult children) |
| Daily 7am PT | Content Drops | Posts approved content to all platforms |
| Daily 7:30am PT | Spring Campaign | 9 spring angles daily through April 30 |
| Daily 10am PT | Analytics Pull | Real stats from all platforms |
| Hourly | Image Generation | DALL-E 3 HD — fills all drafts missing images |
| Every 12 hours | Performance Analyzer | Scores posts, labels winners |
| Every 2 days 8pm PT | Winner DNA Extractor | Extracts patterns from top performers |
| On status=Posted | GitHub Sync | Updates posted.md in real time |

---

## 🎯 CONTENT PILLARS

| Pillar | Purpose | Primary Platform |
|--------|---------|-----------------|
| Convenience | Easy booking, time saved | Facebook, Instagram |
| Trust | Safety, vetting, GPS, background checks | Facebook, LinkedIn |
| Transformation | Before/after, home reset | Instagram, TikTok, Pinterest |
| Recruitment | Cleaner earnings, flexibility | LinkedIn, TikTok |
| Local | City-specific content | Instagram, Facebook |
| Proof | Stats, ratings, social proof | Facebook, LinkedIn |
| Seniors | 65+ self-booking + adult children | Facebook, YouTube |
| Spring | Spring 2026 seasonal campaign | Facebook, Instagram, Pinterest |

---

## 📊 SCORING SYSTEM v3.0

Every draft scored on 3 dimensions (1-10 each):
- **Clarity:** Does a stranger instantly understand PureTask and what to do?
- **Relatability:** Would someone stop scrolling and say "that's literally me"?
- **Conversion:** Does this make someone click, book, or share RIGHT NOW?

**Thresholds (after auto-penalties applied):**
- ≥ 7.5 avg → Auto-Approved + posts automatically
- 5.0–7.4 → Draft (rewritten next cycle)
- < 5.0 → Auto-Rejected (reason logged)

---

## 🔒 BRAND CONSTANTS

- **URL:** https://www.puretask.co — every post, every platform, every video
- **Colors:** #0099FF (blue) · #FFFFFF (white) · #1A1A2E (dark text)
- **Stats:** 10K+ clients · 4.9★ · 98% satisfaction · 2,400+ cleaners · 50+ cities · 6hrs saved
- **Voice:** Direct, confident, warm. No fluff. No hype. No fake urgency.

---

## 🏆 CONFIRMED WINNERS (Week 1)

| Post | Score | Reach | Platform |
|------|-------|-------|---------|
| Family Saturdays | 10.0 | 410 | Facebook |
| Trust: Who's Coming Into Your Home | 9.0 | 510 combined | FB + LinkedIn |
| Cleaner Recruitment: Earnings Math | 9.0 | 340 | LinkedIn |

---

## 🔗 DASHBOARD LINKS

- **Content Studio:** https://pure-task-specialist-app-ea903abd.base44.app/ContentDashboard
- **Brainstorm Engine:** https://pure-task-specialist-app-ea903abd.base44.app/BrainstormDashboard
- **Read-Only Overview:** https://pure-task-specialist-app-ea903abd.base44.app/Overview
- **Live Site:** https://www.puretask.co
