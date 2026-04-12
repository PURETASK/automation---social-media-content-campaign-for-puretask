# PureTask Content Engine — Start Here
> The fastest way to understand this entire system in 5 minutes.

---

## WHAT THIS IS

An autonomous AI content machine that generates, scores, images, and posts social media content for PureTask (https://www.puretask.co) across 7 platforms with zero manual intervention.

**Built on:** Base44 · GPT-4o · DALL-E 3 · HeyGen · Ayrshare
**Managed by:** AI agent (full autopilot — Nathan delegates all content decisions)

---

## NAVIGATE THIS REPO

```
docs/               ← YOU ARE HERE — start with these
brand/              ← Brand rules, voice, stats, colors — read before touching anything
strategy/           ← Content pillars, audience guides, campaign strategies
system/             ← How the automation works — architecture, scoring, pipeline
functions/          ← Backend code (Deno/TypeScript) — the actual engine
pages/              ← Dashboard UI (React) — what Nathan sees
entities/           ← Database schemas — data model
drafts/             ← Live content tracking — all drafts, posted, high-scoring
content-packs/      ← Weekly content packs — ready-to-use content batches
performance/        ← Analytics, winner DNA, performance reports
videos/             ← HeyGen video scripts, guides, finished video tracker
weekly-reports/     ← Strategy changelogs — what changed each week
```

---

## THE SYSTEM IN ONE PARAGRAPH

Every Sunday the AI scans market trends. Monday it brainstorms ideas using Winner DNA patterns + research data, then generates a full week of content with GPT-4o. Every draft gets scored on a strict 3-dimension rubric (Clarity / Relatability / Conversion) — if it hits 7.5+ it's auto-approved. The moment a draft is approved, DALL-E 3 generates a branded image for it inline. Every morning at 7am the posting pipeline picks the top approved drafts and pushes them live to Facebook, Instagram, LinkedIn, Pinterest, and X via Ayrshare. Analytics come back, the best performers get extracted into Winner DNA, and that feeds next Monday's brainstorm. The flywheel runs itself.

---

## KEY NUMBERS

| Metric | Value |
|--------|-------|
| Total drafts | 71+ |
| Platforms | Facebook, Instagram, LinkedIn, Pinterest, TikTok, YouTube, X, Threads |
| Auto-approve threshold | 7.5/10 average |
| Active automations | 16 |
| Content pillars | 8 (Convenience, Trust, Transformation, Recruitment, Local, Proof, Seniors, Spring) |
| Brand URL | https://www.puretask.co |

---

## QUICK LINKS

| What you want | Where to go |
|--------------|------------|
| Brand colors, voice, stats | [brand/brand-voice-guide.md](../brand/brand-voice-guide.md) |
| How scoring works | [system/scoring-rubric.md](../system/scoring-rubric.md) |
| Full automation map | [system/automation-architecture.md](../system/automation-architecture.md) |
| Platform rules per channel | [strategy/platform-playbook.md](../strategy/platform-playbook.md) |
| What's winning | [performance/winner-dna-patterns.md](../performance/winner-dna-patterns.md) |
| Seniors campaign | [strategy/seniors-content-guide.md](../strategy/seniors-content-guide.md) |
| Spring campaign | [strategy/spring-campaign-guide.md](../strategy/spring-campaign-guide.md) |
| Current system status | [docs/system-status.md](./system-status.md) |
| Known bugs / fixes | [docs/bug-log.md](./bug-log.md) |
| All backend functions | [functions/](../functions/) |

---

## THE ONE RULE

**Every post. Every platform. Every time.**
`https://www.puretask.co`
