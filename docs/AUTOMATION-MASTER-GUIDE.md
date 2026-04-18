# PureTask Automation Master Guide
**Last Updated:** April 17, 2026
**Total Automations:** 16 active | 3 paused
**Purpose:** Complete reference for every automation in the PureTask content engine — what it is, how it works, why it exists, and its current status.

---

## TABLE OF CONTENTS

1. [How Automations Work (The Big Picture)](#how-automations-work)
2. [Content Generation — The Factories](#content-generation)
3. [Publishing — The Distributor](#publishing)
4. [Analytics — The Scorekeepers](#analytics)
5. [GitHub — The Backup System](#github)
6. [Video — The Video Pipeline](#video)
7. [Brainstorm — The Idea Engine](#brainstorm)
8. [Automation Status Summary](#status-summary)
9. [Credit Cost Reference](#credits)

---

## HOW AUTOMATIONS WORK (THE BIG PICTURE)

Every automation on PureTask triggers **me (the AI agent)** on a schedule. I don't just run a script — I read our rules, check our data, write the copy, score it, generate images, and save everything to the database. Think of each automation as a standing instruction: "Hey, at this time, do this job."

The system runs in a **generate → score → approve → post → analyze** loop:

```
GENERATE (content factories)
    ↓
SCORE (v5.0 rubric — 7.5 threshold)
    ↓
APPROVE (auto-save if ≥7.5, or flag for review)
    ↓
POST (auto-poster distributes to all platforms)
    ↓
ANALYZE (performance pulled + scored)
    ↓
LEARN (winner patterns stored in WinnerDNA)
    ↓
(loop repeats, informed by what worked)
```

When I'm not generating, the other automations are maintaining the system — syncing to GitHub, pulling analytics, brainstorming new ideas, and processing videos.

---

## CONTENT GENERATION — THE FACTORIES

These are the core automations. They run on a schedule and produce fully-written, fully-imaged content drafts saved directly to the `ContentDraft` database.

---

### 1. Spring Cleaning 2026 — Daily Generator
**Status:** 🟢 ACTIVE
**Schedule:** Every 12 hours, starting at 1:00 PM PT — runs through June 17, 2026
**Campaign:** SpringCleaning-2026

**What it does:**
Every 12 hours I pick up the Spring Cleaning master brief (`campaigns/master-brief-spring-cleaning-2026.md`) and generate the next post in the 60-day campaign calendar. I figure out exactly what day and session we're on by counting how many SpringCleaning-2026 drafts already exist.

**Step by step:**
1. Count existing drafts tagged `SpringCleaning-2026` → determine day/session number
2. Find today's assigned post type and detail from the 60-day schedule
3. Write the complete post: hook, primary caption, short caption, long caption
4. Write 7 platform-specific versions: Facebook, Instagram, X, LinkedIn, Pinterest, Threads, TikTok/YouTube
5. Generate **3 images**: hero (vertical), square 1:1 (Instagram), landscape 16:9 (LinkedIn/YouTube)
6. Write 3 CTA variants
7. For video-type posts: write 15, 30, or 45-second scripts
8. Score using the v5.0 rubric (Clarity + Relatability + Conversion)
9. Save to `ContentDraft` with full metadata — auto-approve if score ≥ 7.5
10. Report results to Nathan

**Why we have it:**
The Spring Cleaning campaign covers 52 unique post types across the full spring season. Doing this manually would take 3–4 hours per post. This automation runs it on autopilot — 2 posts per day, every day, through mid-June.

**Campaign scope:** 60 days | 2 sessions/day | 7 platforms per post | 3 images per post

---

### 2. Recruitment 2026 — Daily Generator
**Status:** 🟢 ACTIVE
**Schedule:** Every 12 hours, starting at 3:00 PM PT — runs through May 16, 2026
**Campaign:** Recruitment-2026

**What it does:**
Same pipeline as Spring Cleaning, but draws from the Recruitment master brief. Focused entirely on attracting professional cleaners to the PureTask platform with content targeting gig workers, independent cleaners, and TaskRabbit/Handy switchers.

**Step by step:**
Identical to the Spring generator, but uses:
- `campaigns/master-brief-recruitment-2026.md` as the source
- Recruitment-specific image guidelines (earnings comparisons, cleaner-forward imagery)
- Cleaner-focused CTAs ("Apply to Be a PureTask Cleaner", "See Earnings Breakdown")

**Why we have it:**
PureTask can't operate without quality cleaners. Recruitment content is as important as client acquisition — maybe more so at launch. This automation keeps a steady stream of cleaner-targeted posts flowing without manual effort, running in parallel to the Spring campaign.

**Campaign scope:** 28 days | 2 sessions/day | 7 platforms per post | 3 images per post

---

### 3. Daily Content Drops — Auto Generator
**Status:** 🟢 ACTIVE
**Schedule:** Every day at 7:00 AM PT

**What it does:**
Each morning I run a full content pipeline:
1. Analyze current WinnerDNA patterns to see what's performing best
2. Identify which content pillars are underrepresented in recent posts
3. Generate 3 high-quality drafts filling the gaps — using proven winner formats
4. Score them (v5.0), auto-approve if ≥ 7.5
5. Generate branded images for each approved draft
6. Report the results

**Why we have it:**
The campaign generators (Spring + Recruitment) cover their specific angles, but the Daily Drops automation handles general evergreen content — Proof posts, Transformation stories, local city angles, Trust frameworks. It fills the content calendar gaps and adapts based on what's actually working.

---

### 4. Weekly Strategy Report
**Status:** 🟢 ACTIVE
**Schedule:** Every Monday at 8:00 AM PT

**What it does:**
Once a week I produce a full performance summary:
- Top 5 performing posts from the last 7 days
- Pillar breakdown: which content themes drove the most engagement
- Platform breakdown: which platforms performed best
- Audience breakdown: which segments converted
- WinnerDNA patterns detected from the week
- Recommended angles for the coming week
- Credit usage summary

**Why we have it:**
This is the weekly strategy meeting, automated. Instead of manually combing through PostPerformance data every Monday, this report lands in chat and gives a complete picture of what worked, what didn't, and where to focus next.

---

### 5. 48hr Post Performance Analyzer
**Status:** 🟢 ACTIVE
**Schedule:** Every day at 6:00 AM PT

**What it does:**
48 hours after a post goes live, it's had enough time to accumulate meaningful engagement data. Every morning at 6 AM I:
1. Find all posts that were published ~48 hours ago
2. Pull their performance data (engagement rate, reach, saves, clicks)
3. Score each post (Excellent / Strong / Average / Weak)
4. Flag high performers for promotion to WinnerDNA
5. Update the `PostPerformance` entity with scores and labels
6. Mark analyzed = true so they're not reprocessed

**Why we have it:**
Without this, performance data just sits in the database unsorted. This automation turns raw numbers into actionable intelligence — identifying our best-performing content patterns so future posts can replicate what works.

---

### 6. Weekly Brainstorm + Auto-Select
**Status:** 🟢 ACTIVE
**Schedule:** Every Sunday at 9:00 AM PT

**What it does:**
Every Sunday I run a structured brainstorm session:
1. Pull the last 7 days of WinnerDNA to understand what's working
2. Review current MarketResearch records for new angles
3. Generate 10 content ideas across different pillars and audiences
4. Score each idea on: pillar gap bonus, trend relevance, winner pattern match, seasonal relevance, platform scores
5. Auto-select the top 3 ideas to convert into ContentDraft records
6. Save the full slate to `ContentIdea` entity for Nathan to review
7. Report the selections

**Why we have it:**
The brain of the operation. Every great content week starts with great ideas. This automation ensures we always have a research-backed, data-informed batch of ideas entering the pipeline every Monday morning — without me or Nathan having to manually come up with angles.

---

## PUBLISHING — THE DISTRIBUTOR

---

### 7. Auto-Post Approved Content
**Status:** 🟢 ACTIVE
**Schedule:** Every day at 9:00 AM, 12:00 PM, 3:00 PM, and 6:00 PM PT

**What it does:**
Four times a day I check the `ContentDraft` database for posts with:
- `status = Approved`
- Not yet posted to a given platform
- `scheduled_date` matching today or overdue

For each post, I distribute it to the appropriate platforms via Ayrshare, then update `posted_platforms` on the draft. Posts are spaced at least 3 hours apart per platform to respect rate limits.

**Posting schedule by platform:**
- Facebook: 9am, 12pm, 3pm
- Instagram: 8am, 8pm
- LinkedIn: 9am, 10am, 3pm
- X (Twitter): 8am, 11am, 2pm
- Pinterest: 9pm, 10pm, 11pm
- Threads: 7am, 10am, 1pm

**Why we have it:**
Content is worthless until it's posted. This is the distribution arm of the engine — it takes everything the generators produce and gets it live across all platforms, on the optimal schedule, without manual intervention.

---

### 8. Daily Analytics Pull
**Status:** 🟢 ACTIVE
**Schedule:** Every day at 11:00 PM PT

**What it does:**
At the end of each day I pull engagement metrics from all connected platforms:
- Reach, impressions, likes, comments, shares, saves, clicks
- Video completion rates (for TikTok/Reels/YouTube Shorts)
- Follower growth delta
- Engagement rate calculation

All data is stored in the `PostPerformance` entity, tagged with the platform, pillar, audience, and hook so we can slice it in every direction.

**Why we have it:**
You can't improve what you don't measure. The daily analytics pull feeds every other intelligent system in the pipeline — the performance analyzer, the weekly report, the brainstorm engine, and the WinnerDNA tracker all depend on this data being accurate and current.

---

## GITHUB — THE BACKUP SYSTEM

---

### 9. GitHub Sync — Twice Daily
**Status:** 🟢 ACTIVE | 11 successful runs
**Schedule:** Every day at 9:00 AM and 9:00 PM PT

**What it does:**
Twice a day I commit the latest system state to the GitHub repository:
- Posted drafts tracker (`posted-drafts-tracker.md`)
- Entity count snapshots (how many drafts, ideas, performance records exist)
- System status summary
- Any new functions, pages, or rule files

**Why we have it:**
Two reasons: backup and visibility. If anything ever breaks or needs to be audited, GitHub is the source of truth for everything the system has done. It's also the handoff layer if a developer ever needs to review or extend the codebase. Originally ran every 20 minutes (burning 12 credits/day) — now twice daily uses ~0.4 credits/day.

**Repository:** `PURETASK/automation---social-media-content-campaign-for-puretask`

---

## VIDEO — THE VIDEO PIPELINE

These automations are currently **paused** while we confirm HeyGen API credits and usage. They're ready to re-activate when needed.

---

### 10. HeyGen Video Generation — Every Wednesday 9am
**Status:** ⏸️ PAUSED (0 total runs)
**Schedule (when active):** Every Wednesday at 9:00 AM PT

**What it does:**
Once a week I pick up to 5 Approved drafts that have video scripts but no generated video yet (`heygen_status = null` or `Queued`). I submit them to the HeyGen Video Agent API, poll for completion, upload the finished video to permanent CDN storage, and update `video_cdn_url` on each draft.

**Why we have it:**
Video content (Reels, TikTok, YouTube Shorts) dramatically outperforms static posts for reach and new follower acquisition. HeyGen allows us to produce talking-head and narrated videos from our existing scripts without any filming. Once a video is generated, the auto-poster picks it up automatically.

**Current status:** Paused while platform core fixes are in progress. Our HeyGen account has 829 API credits ready to use.

---

### 11. HeyGen Video Status Poller
**Status:** ⏸️ PAUSED (3 successful runs)
**Schedule (when active):** Every 15 minutes

**What it does:**
A companion to the Wednesday generator. Once a video has been submitted to HeyGen, rendering takes anywhere from 5–30 minutes. This poller checks all drafts with `heygen_status = Processing`, hits the HeyGen API to check completion, and when done:
- Downloads the video URL
- Uploads to permanent CDN
- Updates `video_cdn_url` on the draft
- Marks `heygen_status = Completed` (or `Failed` if it errored)

**Why we have it:**
HeyGen rendering is async — you submit, wait, then retrieve. Without a poller, we'd have to manually check. This closes the loop automatically so videos are ready without any human in the loop.

**Note:** Paused alongside the generator to avoid burning credits on an incomplete pipeline.

---

## AUTOMATION STATUS SUMMARY

| # | Automation | Status | Frequency | Credit Cost/Day |
|---|-----------|--------|-----------|-----------------|
| 1 | Spring Cleaning 2026 — Daily Generator | 🟢 Active | 2x/day | ~0.4 |
| 2 | Recruitment 2026 — Daily Generator | 🟢 Active | 2x/day | ~0.4 |
| 3 | Daily Content Drops — Auto Generator | 🟢 Active | Daily 7am | ~0.2 |
| 4 | Weekly Strategy Report | 🟢 Active | Weekly Monday | ~0.05 |
| 5 | 48hr Post Performance Analyzer | 🟢 Active | Daily 6am | ~0.1 |
| 6 | Weekly Brainstorm + Auto-Select | 🟢 Active | Weekly Sunday | ~0.05 |
| 7 | Auto-Post Approved Content | 🟢 Active | 4x/day | ~0.4 |
| 8 | Daily Analytics Pull | 🟢 Active | Daily 11pm | ~0.1 |
| 9 | GitHub Sync — Twice Daily | 🟢 Active | 2x/day | ~0.2 |
| 10 | HeyGen Video Generation | ⏸️ Paused | Weekly Wed | — |
| 11 | HeyGen Video Status Poller | ⏸️ Paused | Every 15min | — |
| + | Additional platform automations | 🟢 Active | Various | ~0.5 |

**Estimated daily automation credit cost: ~2.4 credits/day**
**Monthly automation credit budget used: ~2,141 / 20,000 (10.7%)**

---

## CREDIT COST REFERENCE

**How credits work:**
- Every automation run costs credits based on complexity
- Message automations (generating content, analyzing data) cost ~0.1–0.3 credits each
- The old 20-minute GitHub sync was burning 72 runs/day = ~12 credits/day — replaced with twice-daily
- Image generation per run: each `generate_image` call is counted separately from message credits

**Credit budget guidelines:**
- Daily safe spend: under 3 integration credits/day keeps us under 90/month
- At current 2.4/day we have ~7,800+ credits runway remaining this month
- HeyGen video generation: 5 videos/week = ~5 HeyGen API credits consumed from the 829-credit balance

---

## IMPORTANT NOTES FOR OPERATING THIS SYSTEM

**1. The 7.5 scoring rule is absolute.**
Any draft scoring below 7.5 is saved as "Draft" status, not Approved. It will NOT be posted automatically. This is a hard block — not a suggestion.

**2. Images are mandatory.**
The auto-poster will not post any draft without an `image_url`. If image generation fails during content creation, the draft is re-queued — it does not post without a visual.

**3. No fake stats. Ever.**
Our content guardrails prohibit any placeholder statistics. The system uses only verified real facts from puretask.co. Stats like "10,000 happy clients" or "4.9★ rating" are archived and locked until they are actually true.

**4. The URL is always https://www.puretask.co**
Not puretask.com. Not www.puretask.com. Not puretask.co without the https://www. This is enforced in every automation prompt.

**5. Cancellation policy is specific.**
"Cancel anytime" is false and blocked. All content uses the accurate framing: "Free cancellation with 48+ hours notice" or "2 grace cancellations for real life moments."

**6. Pausing vs. archiving.**
Paused automations (HeyGen) are preserved — all their configuration is intact and they can be re-activated in one click. Archived automations are soft-deleted. Don't archive anything unless we're fully done with it.

---

*This document is auto-maintained. Run the GitHub Sync automation to push the latest version to the repository.*
