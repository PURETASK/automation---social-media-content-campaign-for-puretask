# PureTask Content Engine — System Explainer
**Last Updated:** April 17, 2026  
**Repo:** PURETASK/automation---social-media-content-campaign-for-puretask

---

## What Is This System?

This is the PureTask automated content engine — a fully custom-built system that generates, grades, images, stores, and publishes social media content across 7 platforms at scale. It runs on Base44 and is backed up here on GitHub.

Everything in this repo is either a visual screen (Pages), a backend script (Functions), a database definition (Entities), a ruleset (Rules), or a log file (Logs).

---

## Pages (8) — The Visual App

These are the actual screens you see in the browser. Built in React, hosted on Base44.

**Live app URL:** https://pure-task-specialist-app-ea903abd.base44.app

| Page | What It Does |
|------|-------------|
| **ContentLibrary** | The main "one place" for all finished content. Gallery + list view, filters by pillar/audience/campaign/status, instant search, one-click copy for every platform, score breakdown per draft. This is where you go to find and grab any piece of finished content. |
| **ContentDashboard** | Full management view. Edit drafts, change status, view all platform copy, manage the full queue. More powerful than ContentLibrary but less optimized for quick browsing. |
| **PublishingHub** | The posting queue. Shows all Approved content ready to post. Filter, sort by score, and initiate posts to connected social platforms. |
| **Overview** | The home screen. KPI summary — total drafts, approved count, posted count, elite posts (9.0+), images generated, winner DNA patterns. Entry point to the system. |
| **BrainstormDashboard** | The ideas pipeline. Shows ContentIdea records — brainstormed angles that haven't been turned into full drafts yet. Used for planning next content batches. |
| **ArchivedContent** | Rejected and retired posts. Kept for reference — never deleted. Useful for understanding what didn't work and why. |
| **PostedContent** | Everything already published. Track record of what's gone live, on which platforms, and when. |
| **ImageGallery** | All generated images in one visual grid. Browse every image ever created for PureTask content, linked back to their source draft. |

---

## Functions (24) — The Backend Engine

These are server-side scripts that do the actual work. They run on Base44's backend (Deno runtime) and are callable via HTTP. They are NOT visible in the browser — they're the engine under the hood.

| Function | What It Does |
|----------|-------------|
| `contentEngine.ts` | Master orchestration function. Coordinates the full generation pipeline. |
| `generateDailyDrafts.ts` | Generates fresh content drafts daily based on winner DNA patterns and pillar gaps. |
| `generateDailyContentV2.ts` | V2 of daily generation with dual-pass scoring. |
| `generateDailyDrops.ts` | Generates the daily content drop batch. |
| `generateSpringCampaign.ts` | Generates spring-specific content across all 12 spring angles. |
| `generateSeniorsContent.ts` | Generates seniors and adult children targeted content. |
| `generateRecruitmentContent.ts` | Generates cleaner recruitment posts. |
| `generateCityContent.ts` | Generates city-specific local content (LA, NYC, Chicago, Phoenix). |
| `generateImages.ts` | Handles image generation for drafts using Base44's native AI image generator. |
| `permanentImageUploader.ts` | Uploads generated images to permanent CDN storage (no expiring URLs). |
| `postToSocials.ts` | Posts approved content to connected social media platforms via Ayrshare. |
| `postAllApproved.ts` | Batch posts all approved content in the queue with rate-limit handling. |
| `postApprovedDailyDrops.ts` | Posts the daily drop batch with platform-specific spacing. |
| `getDashboardData.ts` | Proxy function that fetches entity data with service-role permissions for dashboards. |
| `pullAnalytics.ts` | Pulls post performance data from connected social platforms and saves to PostPerformance entity. |
| `weeklyStrategyReport.ts` | Generates a weekly summary report of content performance, pillar distribution, and top performers. |
| `generateHeyGenVideo.ts` | Submits video scripts to HeyGen API for AI video generation. |
| `pollHeyGenVideos.ts` | Polls HeyGen API for completed video status and saves video URLs. |
| `generateKlingVideo.ts` | Alternative video generation via Kling AI. |
| `autoCommitAssets.ts` | Automatically commits entity schemas and sync logs to this GitHub repo. |
| `syncEntitySchemas.ts` | Syncs all 5 entity schema definitions to GitHub for backup. |
| `createDailyDrops.ts` | Creates the daily content drop records in the ContentDraft entity. |
| `dailyContentDropsApril16.ts` | April 16 daily drops function (campaign-specific). |
| `dailyContentDropsV2.ts` | V2 daily drops with improved pillar gap detection. |

---

## Entities (5) — The Database

Entities are the database tables. Each entity has a schema (a blueprint defining its fields) and stores actual records. The files in `/entities/` are the schema definitions — not the data itself, but the structure.

| Entity | What It Stores | Key Fields |
|--------|---------------|------------|
| **ContentDraft** | Every piece of content ever created | title, hook, pillar, audience, platform copy (7 platforms), scores (clarity/relatability/conversion), image_url, status, campaign_tag, week_tag |
| **ContentIdea** | Brainstormed angles before they become full drafts | idea_title, concept, pillar, audience, hook_options, predicted_score, status |
| **PostPerformance** | Analytics per post per platform | reach, impressions, likes, comments, shares, engagement_rate, performance_score, platform |
| **MarketResearch** | Research inputs used to inform content | title, source, summary, relevance_to_puretask, sentiment, urgency, suggested_pillar |
| **WinnerDNA** | Patterns extracted from top-performing posts | winning_hook_style, winning_pillar, winning_audience, emotional_trigger, key_phrases, avg_score |

**How data flows:**
MarketResearch → ContentIdea → ContentDraft → PostPerformance → WinnerDNA

Research informs ideas. Ideas become drafts. Drafts get posted. Posts generate performance data. Performance data extracts winner patterns. Winner patterns inform the next batch of ideas. The loop repeats.

---

## Rules (1) — The Brain

`rules/content-generation-guardrails.md`

This is the most important single file in the system. It tells the AI agent exactly how to write PureTask content. Without this file, generated content would be generic. With it, every post sounds like PureTask.

**What's inside:**
- Brand identity — who PureTask really is, the honest story
- Real verified facts — what's true about the platform (GPS, escrow, background checks, pricing tiers, cancellation policy)
- Banned phrases — what can NEVER be said ("cancel anytime", fake stats like "10,000+ clients")
- Messaging frameworks — 6 proven content frames to choose from
- Scoring rubric v5.0 — how every draft is graded (Clarity, Relatability, Conversion each out of 10)
- Image generation rules — what every image must show
- URL rule — https://www.puretask.co in every single piece of content, every time

**Scoring thresholds:**
- 7.5+ average = Auto-approved
- 5.0–7.4 = Draft (needs work)
- Below 5.0 = Rejected

---

## Logs (2) — The Paper Trail

| File | What It Contains |
|------|-----------------|
| `assets/sync-logs/github-sync-2026-04-17.md` | Full record of what happened in the April 17 session — 37 drafts created, which pillar gaps were filled, image URLs, system status |
| `COMMIT_SUMMARY.md` | Shorter "what changed in this push" summary — updated every sync |

---

## How The System Works End-to-End

```
1. RESEARCH
   MarketResearch entity collects trends, competitor intel, seasonal angles

2. BRAINSTORM
   ContentIdea entity: AI generates hook options, scores ideas, flags pillar gaps

3. GENERATE
   ContentDraft entity: Full drafts written with:
   - 7 platform versions (Facebook, Instagram, X, LinkedIn, TikTok, Pinterest, Threads)
   - 3 CTAs
   - Short + long captions
   - Hook
   - Image prompt → image generated → permanent CDN URL saved

4. SCORE (v5.0 rubric)
   Clarity + Relatability + Conversion each graded 1-10
   Avg ≥ 7.5 = Approved automatically

5. POST
   Approved drafts → postToSocials function → Ayrshare API → all platforms
   Spacing: 3+ hours between posts per platform

6. TRACK
   pullAnalytics function → PostPerformance entity
   Reach, impressions, engagement, clicks tracked per post per platform

7. LEARN
   Top performers → WinnerDNA entity
   Winning hook styles, pillars, audiences, emotional triggers extracted
   Next generation batch uses winner patterns as input
```

---

## Current System Status (April 17, 2026)

| Component | Status |
|-----------|--------|
| Content generation | 🟢 Operational |
| Image generation (Base44 native) | 🟢 Operational |
| GitHub auto-sync | 🟢 Running 2x daily |
| Content Library page | 🟢 Live |
| All dashboards | 🟢 Live |
| Posting automations | 🟡 Paused (pending social platform reconnection) |
| HeyGen video generation | 🟡 Paused (manually paused) |
| Performance analytics | 🟢 Running 2x daily |

---

## Content Coverage Status (April 17, 2026)

All major audience × pillar combinations now have at least 1 approved draft.

| Audience | Convenience | Trust | Transformation | Recruitment | Local | Proof |
|----------|------------|-------|---------------|-------------|-------|-------|
| Busy Homeowners | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Families | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Working Professionals | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Seniors | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Airbnb Hosts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cleaners / Gig Workers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Adult Children | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Total drafts in system:** 150+  
**Approved & ready to post:** 100+  
**Posted:** 30+  
**Elite (9.0+ score):** 40+

---

*This document is auto-maintained. Last synced: April 17, 2026 by PureTask Superagent.*
