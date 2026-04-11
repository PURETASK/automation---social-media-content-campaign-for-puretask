# PureTask — Finished HeyGen Videos
## Live video log — auto-updated when a video is generated and approved
## Last Updated: 2026-04-11

---

## Status Legend
| Icon | Status |
|------|--------|
| ✅ | Live — posted to platform |
| 🎬 | Generated — awaiting approval/posting |
| ⏳ | In queue — script ready, not yet generated |
| ❌ | Failed — regeneration needed |

---

## Finished Video Log

*No videos generated yet. Queue is loaded and ready.*
*Run the HeyGen generation skill or call the API to produce the first batch.*

| # | Video ID | Title | Pillar | Platform | Duration | HeyGen Video ID | CDN URL | Status | Posted Date |
|---|----------|-------|--------|----------|----------|-----------------|---------|--------|-------------|
| — | — | — | — | — | — | — | — | — | — |

---

## How This Log Gets Updated

1. HeyGen API call is made with the script from `/videos/scripts/`
2. Video ID is returned → polled until `completed`
3. `video_url` extracted from HeyGen response
4. File uploaded to CDN via `upload_file` tool
5. CDN URL stored in `ContentDraft.video_prompt` field in database
6. This log updated with all details
7. Video posted to platform via Ayrshare with video URL
8. Draft status updated to `Posted` → triggers GitHub sync

---

## Generation Stats

| Metric | Value |
|--------|-------|
| Total videos generated | 0 |
| Total videos posted | 0 |
| Avg generation time | — |
| Most used avatar | — |
| Most used voice | — |
| Top performing pillar | — |

---

## Notes
- All videos must include `https://www.puretask.co` visually
- Subtitles required on every video
- Aspect ratio must match target platform before generating
- Videos scoring < 7.5 on quality rubric must be regenerated
- City videos require city-specific B-roll or landmark reference
