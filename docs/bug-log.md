# PureTask Bug Log — Known Issues & Fixes
> Every bug found, what caused it, and what was done about it.

---

## FORMAT
Each entry: Date · Severity · Status · Root Cause · Fix Applied

---

## APRIL 12, 2026

### BUG-001 — createDailyDrops never posted anything
**Severity:** CRITICAL · **Status:** ✅ FIXED
**Symptom:** All 71 drafts showed `posted_platforms: ""` — zero posts published despite daily automation running.
**Root cause:** The old `createDailyDrops.ts` imported `@base44/core` (broken import) and only created DB records. It never called Ayrshare. The automation trigger fired but nothing actually posted.
**Fix:** Completely rewrote `createDailyDrops.ts` — now pulls Approved drafts with `image_url`, determines active platforms by day of week, calls Ayrshare API directly, updates `posted_platforms` and `status`.
**Files changed:** `functions/createDailyDrops.ts`

---

### BUG-002 — Images generated as afterthought, not at creation
**Severity:** CRITICAL · **Status:** ✅ FIXED
**Symptom:** Every generator created text-only drafts first, saved to DB, then waited for hourly automation to fill images. Drafts sat image-less for hours/days. Violated the rule "every post must have a visual."
**Root cause:** Image generation was a separate async pipeline. No generator called DALL-E at creation time.
**Fix:** Created shared `generateImageForDraft()` export in `generateImages.ts`. All generators now call this BEFORE saving to DB. Draft hits database with `image_url` already populated.
**Files changed:** `functions/generateImages.ts` (added export), all 4 generators + daily content v3.1

---

### BUG-003 — Score inflation — GPT grading its own work too generously
**Severity:** HIGH · **Status:** ✅ FIXED
**Symptom:** Hook "Experience the ease of booking a cleaner in 3 minutes!" scored 8.5 Relatability. By the actual rubric this is a 5-6 (feature statement, not emotional scenario). Low-quality content was slipping past the 7.5 threshold.
**Root cause:** GPT was both generating and self-scoring content. No independent audit.
**Fix:** Added `auditScore()` function to `generateDailyContentV2.ts`. Second GPT pass re-scores each draft with strict rubric instructions. Final score = `Math.min(self-score, audit-score)` — always takes the more conservative number.
**Files changed:** `functions/generateDailyContentV2.ts`

---

### BUG-004 — platform_tiktok = null on multiple Seniors drafts
**Severity:** HIGH · **Status:** ✅ FIXED
**Symptom:** At least 2 seniors drafts had `platform_tiktok: null`. TikTok copy was completely missing.
**Root cause:** Seniors system prompt said "Facebook primary" — GPT interpreted this as "skip TikTok." Schema didn't enforce TikTok as required.
**Fix:** All generators now enforce `platform_tiktok` as required field. If GPT returns null, a fallback is auto-generated from hook + URL + hashtags.
**Files changed:** All generators, `generateDailyContentV2.ts`

---

### BUG-005 — City spring drafts had no city visual in image_prompt
**Severity:** HIGH · **Status:** ✅ FIXED
**Symptom:** "Spring into a Fresh NYC Space" — `image_prompt` said "bright light, fresh flowers" with zero NYC reference. Would generate a non-city image, triggering -2 Relatability penalty.
**Root cause:** Spring generator used a generic image_prompt template. City-specific angles didn't override it with city visuals.
**Fix:** (1) `generateSpringCampaign.ts` now injects city landmark when `angle.city` is set. (2) `generateImageForDraft()` also enforces city visual at generation time. (3) `generateDailyContentV2.ts` checks and injects city into image_prompt if missing.
**Files changed:** `functions/generateSpringCampaign.ts`, `functions/generateImages.ts`, `functions/generateDailyContentV2.ts`

---

### BUG-006 — Facebook copy too thin (1 sentence)
**Severity:** MEDIUM · **Status:** ✅ FIXED
**Symptom:** Facebook captions like "Spring cleaning made easy for Airbnb hosts! 🌸✨ #tag https://url" — 1 sentence total. Platform rules require 3+ sentences for community-feel depth.
**Root cause:** Schema didn't specify minimum length. GPT defaulted to short.
**Fix:** All generator schemas now explicitly state "MIN 3 SENTENCES" in the `platform_facebook` field description.
**Files changed:** All generators

---

### BUG-007 — PostPerformance has zero real data
**Severity:** HIGH · **Status:** ⚠️ OPEN
**Symptom:** All 8 PostPerformance records are labeled "Baseline estimate." Real engagement data (reach, likes, shares) has never been pulled from Ayrshare.
**Root cause:** Daily Analytics Pull automation has run 0 times. `pullAnalytics.ts` checks for Ayrshare Business plan — if not upgraded, it creates placeholder records only.
**Impact:** Winner DNA flywheel is fed by fake numbers. Brainstorm engine is optimizing for estimated patterns, not real ones.
**Fix needed:** Upgrade Ayrshare to Business plan to unlock analytics API. OR: Nathan manually enters real stats from platform dashboards.
**Status:** Pending Ayrshare plan upgrade.

---

### BUG-008 — HeyGen queue has no priority logic
**Severity:** MEDIUM · **Status:** ⚠️ OPEN
**Symptom:** 17+ drafts have `heygen_status: "Queued"`. Wednesday automation generates `max_videos=3`. No logic determines which 3 get generated — random order.
**Root cause:** `generateHeyGenVideo.ts` pulls first N queued drafts with no sorting.
**Fix needed:** Add priority sort: Spring 2026 > Seniors Campaign > City > Recruitment > other.
**Status:** Pending update to `generateHeyGenVideo.ts`.

---

## HISTORICAL BUGS (pre-April 12)

### BUG-H001 — Wrong website URL in early drafts
**Fixed:** April 10 — All drafts reset to "Pending" and regenerated with `https://www.puretask.co`

### BUG-H002 — Image pipeline stored URL in editor_notes not image_url
**Fixed:** April 12 — `generateImages.ts` v2.0 corrected field mapping

### BUG-H003 — Image pipeline only queried "Pending Approval" status
**Fixed:** April 12 — Now queries all non-rejected drafts

### BUG-H004 — Wrong SDK import (@base44/core instead of @base44/sdk)
**Fixed:** April 12 — All functions use `npm:@base44/sdk@0.8.23`
