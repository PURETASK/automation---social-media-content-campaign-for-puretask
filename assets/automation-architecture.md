# PureTask Automation Architecture — Full System Map
# Last Updated: 2026-04-12

---

## SYSTEM OVERVIEW

The PureTask Content Engine is a fully autonomous AI-powered social media system running on Base44. 
It generates, scores, approves, images, and posts content across 7 platforms with zero manual intervention.

Nathan delegates ALL content decisions to the AI. Hard blocks remain only for: legal, financial, reputation, and customer support issues.

---

## FULL AUTOMATION SCHEDULE

| ID | Name | Schedule | What I Do |
|----|------|----------|-----------|
| 69d5f275b4eb4589b8b1ff6c | Weekly Market Research Scan | Sunday 6pm PT | Scan trending topics, competitor moves, seasonal angles, Reddit/TikTok signals |
| 69d5f283b4eb4589b8b1ff6f | Weekly Brainstorm & Auto-Select | Monday 6am PT | Pick best ideas using Winner DNA + market data + pillar gaps |
| 69d5ea25beaeb910ea903ac8 | Weekly Content Generation | Monday 8am PT | Generate full week of drafts — auto-approve ≥7.5, draft 5-7.4, reject <5 |
| 69d5ea2bbeaeb910ea903ac9 | Daily Content Drops | Daily 7am PT | Post approved content to all platforms via Ayrshare |
| 69d5ec4be8e2da1dc59c4cfd | 48hr Performance Analyzer | Every 12 hours | Pull stats, score posts, label Winner/Good/Average/Underperformer |
| 69d5f28eb4eb4589b8b1ff72 | Winner DNA Extractor | Every 2 days 8pm PT | Extract winning hooks/formats/triggers into WinnerDNA entity |
| 69d679fb06effaad79dc388a | Auto-Update Posted Drafts GitHub | Entity trigger (status=Posted) | Push updated posted.md to GitHub when draft status changes to Posted |
| 69d679fb06effaad79dc3888 | Auto-Commit Assets to GitHub | Daily 6am PT | Commit all updated sandbox files to GitHub repo |
| 69d679fb06effaad79dc3889 | Weekly Strategy Changelog | Monday 5pm PT | Generate and push weekly strategy report to GitHub |
| 69dae0c83e06a07ea5224230 | Weekly HeyGen Video Generation | Wednesday 9am PT | Generate HeyGen AI videos from queued scripts, score, auto-post if ≥7.5 |
| 69db0f9fcb3c179c17fe42d0 | Weekly City Content Generation | Tuesday 8am PT | Generate hyper-local content for LA, NYC, Chicago, Houston, Phoenix |
| 69db0fa6cb3c179c17fe42d3 | Bi-Weekly Recruitment Content | Every 2 weeks Thu 8am PT | Generate 6 recruitment angles targeting professional cleaners |
| 69db0fadcb3c179c17fe42d4 | Daily Analytics Pull | Daily 10am PT | Pull real engagement stats from all Ayrshare-connected platforms |
| 69db22e2816014b347ade202 | Hourly Image Generation | Every hour | Fill all drafts missing image_url — batch_size=4, DALL-E 3 HD |
| 69db22e2816014b347ade203 | Weekly Seniors Content | Friday 8am PT | Generate 8 seniors angles (2 segments: 65+ self-booking + adult children) |
| 69db22e2816014b347ade204 | Spring 2026 Campaign Daily | Daily 7:30am PT (ends Apr 30) | Generate 9 spring angles daily — capitalizing on 340% search volume spike |

---

## CONTENT PIPELINE FLOW

```
SUNDAY 6pm    → Market Research Scan
                ↓
MONDAY 6am    → Brainstorm & Auto-Select (uses Winner DNA + research)
                ↓
MONDAY 8am    → Content Generation (full week batch)
                ↓ (all day)
HOURLY        → Image Generation (fills missing image_url — DALL-E 3)
                ↓
DAILY 7am     → Content Drops (posts Approved + has image_url drafts)
                ↓
DAILY 10am    → Analytics Pull (real stats from Ayrshare)
                ↓
EVERY 12hrs   → Performance Analyzer (scores posts, labels winners)
                ↓
EVERY 2 DAYS  → Winner DNA Extractor (feeds next Monday's brainstorm)
                ↓ (loop)
```

**Additional parallel pipelines:**
- Tuesday 8am → City Content (LA, NYC, Chicago, Houston, Phoenix)
- Wednesday 9am → HeyGen Video Generation
- Thursday (bi-weekly) → Recruitment Content
- Friday 8am → Seniors Content
- Daily 7:30am → Spring Campaign (through April 30)

---

## BACKEND FUNCTIONS

| Function | Purpose | Trigger |
|----------|---------|---------|
| generateDailyContent.ts | Core content generation engine | Weekly + daily automations |
| generateDailyContentV2.ts | V2 with improved scoring | Backup/manual |
| generateImages.ts | DALL-E 3 image generation — v2.0 fixed | Hourly automation |
| generateCityContent.ts | City-specific hyper-local content | Tuesday automation |
| generateRecruitmentContent.ts | Cleaner recruitment content | Bi-weekly automation |
| generateSeniorsContent.ts | Seniors audience content (8 angles) | Friday automation |
| generateSpringCampaign.ts | Spring 2026 campaign (9 angles) | Daily through Apr 30 |
| generateHeyGenVideo.ts | HeyGen AI video generation | Wednesday automation |
| postToSocials.ts | Ayrshare multi-platform posting | Daily drops |
| pullAnalytics.ts | Performance data from Ayrshare | Daily analytics |
| weeklyStrategyReport.ts | Strategy changelog + GitHub push | Monday reports |
| autoCommitAssets.ts | GitHub asset sync | Daily 6am |
| syncEntitySchemas.ts | Entity schema sync to GitHub | Auto |
| contentEngine.ts | Core engine orchestration | Internal |
| batchCreateDrafts.ts | Bulk draft creation | Manual |

---

## ENTITY DATA MODEL

### ContentDraft
The core entity. Every piece of content lives here.
Key fields: title, pillar, audience, hook, primary_caption, platform_x/instagram/facebook/linkedin/tiktok/pinterest/threads/youtube, image_url, image_prompt, script_15sec/30sec/45sec, clarity_score, relatability_score, conversion_score, status, heygen_status, posted_platforms, city, campaign_tag, week_tag, is_winner

**Status flow:** Draft → Approved → Posted (or Rejected)

### ContentIdea
Brainstorm ideas before they become drafts.
Key fields: idea_title, concept, pillar, audience, hook_options, predicted_score, winner_pattern_match, pillar_gap_bonus, trend_relevance_score, best_platform, status, converted_draft_id

### MarketResearch
Market intelligence, competitor analysis, trend data.
Key fields: title, research_type, source, summary, relevance_to_puretask, suggested_pillar, suggested_audience, urgency, actionable, used_in_brainstorm

### PostPerformance
Real platform analytics per post per platform.
Key fields: content_draft_id, platform, reach, impressions, likes, comments, shares, saves, clicks, engagement_rate, performance_score, performance_label (Winner/Good/Average/Underperformer)

### WinnerDNA
Extracted patterns from top-performing content.
Key fields: winning_hook_style, winning_pillar, winning_audience, winning_format, winning_platform, emotional_trigger, key_phrases, avg_score, pattern_notes

---

## SCORING SYSTEM — v3.0

Every draft scored on 3 dimensions (1-10 each):
- **Clarity:** Does a stranger instantly understand what PureTask is and what to do?
- **Relatability:** Would someone stop scrolling and say "that's literally me"?
- **Conversion:** Does this make someone click, book, or share RIGHT NOW?

**Auto-penalties applied before avg:**
- No image_url → -3 Conversion
- Missing https://www.puretask.co → -2 Clarity
- City post, no city visual → -2 Relatability
- Generic hook → -2 Relatability
- Copy-pasted across platforms → -2 Clarity
- Missing stats when available → -1 Conversion

**Thresholds:**
- ≥ 7.5 avg → Auto-Approved + enters posting queue
- 5.0–7.4 → Saved as Draft for next cycle rewrite
- < 5.0 → Auto-Rejected, reason logged in editor_notes

---

## CONNECTED PLATFORMS (via Ayrshare)

| Platform | Account | Status |
|----------|---------|--------|
| Facebook | PureTask Page | ✅ Connected |
| Instagram | @PureTask | ✅ Connected |
| LinkedIn | Nathan Chiaratti | ✅ Connected |
| Pinterest | PureTask | ✅ Connected (new account) |
| TikTok | @PureTask | ✅ Connected (new account) |
| YouTube | PureTask | ✅ Connected (new account) |
| Threads | @real.addison.carter | ✅ Connected |

**Ayrshare plan note:** Current plan = immediate posts only (no scheduling). Business plan upgrade = scheduled posting + unlimited hashtags.
**Instagram:** 5 hashtag max enforced at API level — always trim before sending.

---

## AUTOPILOT DECISION MATRIX

| Action | Authority |
|--------|-----------|
| Ideation / drafting / rewriting | AI — fully autonomous |
| Scoring + auto-approval (≥7.5) | AI — autonomous |
| Image generation | AI — autonomous |
| Scheduling + platform selection | AI — autonomous |
| Posting via Ayrshare | AI — autonomous |
| HeyGen video generation | AI — autonomous |
| Responding to negative comments | ❌ Nathan only |
| DM sales conversations | ❌ Nathan only |
| Ad budget / paid promotion | ❌ Nathan only |
| Customer support claims | ❌ Nathan only |
| Refunds / account actions | ❌ Nathan only |

---

## BRAND CONSTANTS — NEVER CHANGE

- **URL:** https://www.puretask.co (always full format, every post, every platform)
- **Colors:** #0099FF (blue), #FFFFFF (white), #1A1A2E (dark text)
- **Stats:** 10K+ clients | 4.9★ | 98% satisfaction | 2,400+ cleaners | 50+ cities | 6hrs saved
- **Voice:** Direct, confident, warm. No fluff. No hype. No fake urgency.
- **Never:** Corporate, generic, cluttered, dark/moody, fake scarcity