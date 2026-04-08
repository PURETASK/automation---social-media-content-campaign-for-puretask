---
name: metrics-tracking
description: Define, track, and analyze PureTask content marketing metrics. Use when reviewing post performance, identifying top pillars/audiences/platforms, running weekly content reviews, spotting trends, or calculating winner DNA patterns.
---

# PureTask Content Metrics Framework

Track and analyze content performance across all platforms with frameworks for goal setting and optimization.

## Key Metrics to Track Per Post

| Metric | What it Tells Us |
|--------|-----------------|
| **Reach** | How many unique accounts saw it |
| **Impressions** | Total views (incl. repeat) |
| **Engagement Rate** | (likes+comments+shares+saves) / reach × 100 |
| **Saves** | High-intent signal — content worth revisiting |
| **Shares** | Virality signal |
| **Comments** | Conversation / resonance signal |
| **Clicks** | Traffic intent |
| **Video Completion Rate** | For TikTok/Reels — did they watch it all? |
| **Follower Growth** | Did this post drive follows? |
| **Performance Score** | Composite 0–10 score (stored in PostPerformance entity) |

## Performance Benchmarks by Platform

| Platform | Avg Eng Rate | Good | Excellent |
|----------|-------------|------|-----------|
| TikTok | 3–5% | 6%+ | 8%+ |
| Instagram | 1–3% | 4%+ | 6%+ |
| Facebook | 0.5–1% | 2%+ | 4%+ |
| LinkedIn | 1–2% | 3%+ | 5%+ |
| Threads | 2–4% | 5%+ | 7%+ |
| Pinterest | 0.3–1% | 1.5%+ | 3%+ |

## Performance Score Formula (0–10)

```
score = (
  (engagement_rate / benchmark_max) × 4  # 40% weight
  + (reach_normalized) × 2               # 20% weight
  + (saves_rate) × 2                     # 20% weight
  + (comments_rate) × 1                  # 10% weight
  + (video_completion if video) × 1      # 10% weight
)
```

**Labels**:
- 8.5–10.0 = 🏆 Winner
- 7.0–8.4 = ✅ Strong
- 5.5–6.9 = 📊 Average
- 4.0–5.4 = ⚠️ Below Average
- 0–3.9 = ❌ Poor

## Weekly Content Review Checklist

Every week, analyze:
1. **Top 3 posts by performance score** → Extract patterns (pillar, audience, hook style, platform)
2. **Bottom 3 posts** → What failed? Wrong audience? Weak hook? Wrong platform?
3. **Best performing pillar this week** → Double down next week
4. **Best performing platform** → Shift content calendar toward it
5. **Any new Winner DNA** → Add to WinnerDNA entity

## Winner DNA Extraction Criteria

A post qualifies as a "Winner" (performance_score ≥ 8.5) and should be stored in WinnerDNA when:
- Reach is above platform average
- Engagement rate is in "Excellent" range
- It generated notable saves or shares
- Multiple comments of the same theme (signal of resonance)

Extract and store:
- Hook style used (question, POV, statistic, unpopular opinion, etc.)
- Pillar (Trust, Convenience, Transformation, Recruitment, Local, Proof)
- Audience (Homeowners, Airbnb, Professionals, Families, Seniors, Cleaners)
- Platform
- CTA style
- Emotional trigger (fear, aspiration, relief, pride, curiosity)
- Key phrases that resonated

## Pillar Performance Tracking

Monitor which content pillars consistently outperform. Current baseline:
1. Trust — highest engagement across all platforms
2. Transformation — strong visual/visual content (Instagram, Pinterest)
3. Proof — strong on Facebook, LinkedIn
4. Convenience — strong on TikTok, Threads
5. Recruitment — best on LinkedIn, TikTok
6. Local — strong for geo-targeted reach

## Entities Used

- **PostPerformance**: stores per-post metrics
- **ContentDraft**: links to the original draft (content_draft_id)
- **WinnerDNA**: stores extracted patterns from winners
- **ContentIdea**: winner_pattern_match field used for future ideation

## Monthly Reporting Template

Pull from PostPerformance entity:
1. Total posts published (count)
2. Total reach (sum)
3. Average engagement rate (avg)
4. Winners identified (count where performance_score ≥ 8.5)
5. Top pillar (group by pillar, avg score)
6. Top platform (group by platform, avg eng rate)
7. Top audience (group by audience, avg score)
8. Most reused hook style (from WinnerDNA)
