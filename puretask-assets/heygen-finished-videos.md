# PureTask HeyGen Finished Videos

> All videos generated via Video Agent API (`/v1/video_agent/generate`) unless noted.
> Method key: `VA` = Video Agent (good) | `v2` = old /v2/generate (bad — do not reuse)

---

## ✅ Batch 2 — Video Agent (Current, Correct Method)

| Title | Video ID | Method | Status | Draft ID |
|-------|----------|--------|--------|----------|
| Family Saturdays | e25fb8d9ee244d209623ae950a0eff99 | VA | ✅ Completed | 69d882c9f61f420c9e28256a |
| Trust: Who's Coming Into Your Home | 7bf0fb61af364df59d3a14ce08c9202e | VA | ✅ Completed | 69d882c9f61f420c9e282568 |
| Cleaner Recruitment: Keep What You Earn | 4c775a61bb31483486dda5c497aa56e0 | VA | ✅ Completed | 69d882c9f61f420c9e28256e |

---

## ⚠️ Batch 1 — Old /v2 Method (Do Not Repost — Low Quality)

These were generated with the old raw VO endpoint. White background, no scenes, no B-roll.
Nathan confirmed these look "horrible." Keep for reference only — replaced by Batch 2.

| Title | Video ID | Method | Notes |
|-------|----------|--------|-------|
| Family Saturdays | 8d11038301fe41099634c29d547f9a64 | v2 | ❌ Replaced by Batch 2 |
| Weekend Reclaimed | 12150dac827649ae9c6ed52c34069899 | v2 | ❌ Needs VA regeneration |
| Trust Vetting | 33fdc764513b47ee953f14d5f25eb67d | v2 | ❌ Replaced by Batch 2 |
| Recruitment | f2a58550a7bb48059b977cb0f4936a46 | v2 | ❌ Replaced by Batch 2 |
| Social Proof | 077600b5b2e4426185788b32db148a45 | v2 | ❌ Needs VA regeneration |
| Spring Urgency | 7156fc1572c548c0a36e661c04adccd6 | v2 | ❌ Needs VA regeneration |

---

## 🔄 Next Up — To Regenerate via Video Agent

Priority order for next Wednesday automation run:

1. **Weekend Reclaimed** — VO-only, 9:16, TikTok/Reels viral push
2. **Social Proof Wall** — Motion graphic stats reveal, 9:16, all platforms
3. **Spring Urgency** — Fast cut, urgency, 9:16, TikTok/Reels (TIME SENSITIVE — before April 30)

---

## System Notes

- All future video generation MUST use `/v1/video_agent/generate`
- `generateHeyGenVideo.ts` has been updated to Video Agent only (v3.0)
- Wednesday 9am automation will use Video Agent going forward
- Avatar: `Abigail_expressive_2024112501` (Trust + Recruitment pillars)
- Voice: `PXNEIUJiwgmsriDe9m6P` (addison carter - Voice 1)
- Config accepted fields: `avatar_id`, `voice_id` only — aspect ratio goes in the prompt text
