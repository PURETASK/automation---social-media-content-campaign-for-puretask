# HeyGen Video Creation Guide — PureTask
## Version 1.0 | Last Updated: 2026-04-11

> This is the master operating guide for generating all PureTask videos via HeyGen.
> Every video created must follow this guide exactly. No exceptions.

---

## 🔑 API Credentials
- **API Key:** stored as `HEYGEN_API_KEY` in .env
- **API Base:** `https://api.heygen.com/v2`
- **Endpoint for video generation:** `POST /video/generate`
- **Endpoint for status check:** `GET /video/status/{video_id}`

---

## 🎭 Recommended Avatars for PureTask

### Primary — Female (Trust / Homeowner Content)
| Avatar Name | ID | Use Case |
|-------------|-----|---------|
| Abigail (Upper Body) | `Abigail_expressive_2024112501` | Testimonials, convenience posts |
| Adriana Business Front | `Adriana_Business_Front_public` | LinkedIn, professional content |
| Adriana BizTalk Front | `Adriana_BizTalk_Front_public` | Trust/authority content |

### Primary — Male (Recruitment / Authority Content)
| Avatar Name | ID | Use Case |
|-------------|-----|---------|
| Aditya in Blue blazer | `Aditya_public_1` | LinkedIn, recruiting |
| Adrian in Blue Suit | `Adrian_public_2_20240312` | Professional explainers |
| Albert in Blue blazer | `Albert_public_2` | LinkedIn B2B content |

### No-Avatar (B-roll + VO style)
- Use for TikTok, Instagram Reels, before/after content
- Explicitly say `"no avatar, voice-over only"` in prompt

---

## 🎙️ Recommended Voices for PureTask

| Voice | ID | Tone | Best For |
|-------|----|------|---------|
| addison carter - Voice 1 | `PXNEIUJiwgmsriDe9m6P` | Warm, relatable | IG Reels, TikTok, family content |
| Allison | `f8c69e517f424cafaecde32dde57096b` | Clean, professional | Facebook, LinkedIn |
| Hope | `42d00d4aac5441279d8536cd6b52c53c` | Friendly, upbeat | Convenience/booking demos |
| Archer | `453c20e1525a429080e2ad9e4b26f2cd` | Confident, direct | Recruitment content |
| Mark | `5d8c378ba8c3434586081a52ac368738` | Authoritative | Trust/safety content |

**Default voice for PureTask:** `addison carter - Voice 1` unless content type calls for something different.

---

## 📐 Format Rules by Platform

| Platform | Aspect Ratio | Duration | Avatar? | Style |
|----------|-------------|----------|---------|-------|
| TikTok | 9:16 (vertical) | 15–30 sec | Optional | Fast hook, POV, bold text overlays |
| Instagram Reels | 9:16 (vertical) | 15–30 sec | Optional | Emotional, visual-first |
| Facebook | 16:9 (landscape) | 30–60 sec | Yes preferred | Practical, community feel |
| LinkedIn | 16:9 (landscape) | 30–60 sec | Yes preferred | Professional, story-driven |
| YouTube Shorts | 9:16 (vertical) | 30–60 sec | Optional | Problem → solution → payoff |
| Pinterest | 2:3 (portrait) | 6–15 sec | No | Aspirational, lifestyle |

---

## 🎨 Brand Visual Rules (LOCKED — Never Deviate)

```
Primary color:    #0099FF (PureTask Blue)
Background:       #FFFFFF (White) or #F5F7FA (Light Gray)
Text color:       #1A1A2E (Near black for headings)
Accent:           #0099FF → #00D4FF (blue gradient)
Font style:       Bold, clean sans-serif (Inter, Poppins, or similar)
Logo placement:   Bottom right corner or intro/outro card
URL display:      https://www.puretask.co — must appear in EVERY video
```

**Visual style:** Minimal, airy, premium. White-dominant. Real lifestyle aesthetic.
**Never use:** Cluttered layouts, dark moody tones, stock imagery that feels fake or staged.

---

## 🏗️ The PureTask Video Prompt Template

Every HeyGen video prompt MUST use this structure. Fill in every section.

```
Create a [DURATION] [ASPECT RATIO] video for [AUDIENCE] about [TOPIC/GOAL].

CONTENT PILLAR: [Convenience / Trust / Transformation / Recruitment / Local / Proof]
PLATFORM: [TikTok / Instagram / Facebook / LinkedIn / YouTube Shorts]
CAMPAIGN: [campaign_tag]

GOAL:
- Viewer understands: [key takeaway in one sentence]
- Viewer feels: [specific emotion — relief, trust, FOMO, motivation]
- Viewer does: [exact CTA action]

PRESENTER:
- [Avatar name + ID] OR [No avatar, voice-over only]
- Voice: [voice name + ID]
- Tone: [warm / confident / direct / energetic / authoritative]

SCRIPT:
[Full spoken script written in natural, conversational language.
Every sentence should sound like a human talking, not reading.
Must end with: "Visit https://www.puretask.co to book yours today."]

VISUAL DIRECTION:
- Style: [minimal modern / bold vibrant / clean SaaS / lifestyle authentic]
- Colors: #0099FF (blue), #FFFFFF (white), #1A1A2E (dark text)
- Brand feel: Clean, trustworthy, premium
- Text overlays: [list key stats or phrases to display on screen]
- Logo: PureTask logo bottom right on all scenes

MEDIA RULES:
- Motion graphics for: [stats, feature callouts, booking steps, tier badges]
- Stock footage for: [home interiors, cleaners working, families relaxing]
- AI-generated visuals for: [abstract trust concepts, before/after scenarios]
- NO cheesy stock photos, NO cluttered frames, NO dark moody scenes

SCENE BREAKDOWN:
Scene 1 — Hook (0:00–0:05)
Visual: [describe exactly what viewer sees]
VO: "[exact spoken words]"
Text overlay: [any on-screen text]

Scene 2 — Problem (0:05–0:12)
Visual: [describe]
VO: "[exact words]"
Text overlay: [if any]

Scene 3 — Solution (0:12–0:25)
Visual: [describe]
VO: "[exact words]"
Text overlay: [key feature callouts]

Scene 4 — Proof (0:25–0:35)
Visual: [describe]
VO: "[exact words]"
Text overlay: [stats: 4.9★, 10K+ clients, 98% satisfaction]

Scene 5 — CTA (0:35–0:45)
Visual: [branded end card, logo prominent]
VO: "Visit https://www.puretask.co to book yours today."
Text overlay: https://www.puretask.co

OUTPUT CONSTRAINTS:
- Add subtitles/captions: YES (always)
- Transitions: clean cuts or smooth fades (no flashy wipes)
- Pacing: [fast / moderate / calm]
- Intro card: YES — PureTask logo + pillar tagline
- Outro card: YES — Logo + https://www.puretask.co + CTA text
- Background music: subtle, upbeat, non-distracting
```

---

## ✅ Quality Checklist (Every Video — ALL Must Pass)

- [ ] Duration matches platform target
- [ ] Aspect ratio matches platform
- [ ] `https://www.puretask.co` appears visually in video
- [ ] Correct avatar or voice-over only stated
- [ ] Full script written (not just topic summary)
- [ ] PureTask blue (#0099FF) used in visuals
- [ ] Real brand stats used (4.9★, 10K+, 98%, 2,400+, 6hrs, 80–85%)
- [ ] Subtitles/captions enabled
- [ ] Intro + outro cards included
- [ ] Scene breakdown written scene-by-scene
- [ ] Media types assigned (motion graphics / stock / AI visuals)
- [ ] Hook grabs within first 2 seconds
- [ ] CTA is specific (not "learn more" — "Book in 3 minutes")
- [ ] No hype words, no fake urgency, no financial guarantees
- [ ] Tied to one of the 6 content pillars

---

## 🔁 Video Generation API Workflow

### Step 1 — Generate Video
```bash
POST https://api.heygen.com/v2/video/generate
X-Api-Key: $HEYGEN_API_KEY
Content-Type: application/json

{
  "video_inputs": [
    {
      "character": {
        "type": "avatar",
        "avatar_id": "Abigail_expressive_2024112501",
        "avatar_style": "normal"
      },
      "voice": {
        "type": "text",
        "voice_id": "PXNEIUJiwgmsriDe9m6P",
        "input_text": "[SCRIPT TEXT HERE]",
        "speed": 1.0
      },
      "background": {
        "type": "color",
        "value": "#FFFFFF"
      }
    }
  ],
  "aspect_ratio": "9:16",
  "test": false
}
```

### Step 2 — Poll for Status
```bash
GET https://api.heygen.com/v2/video/status/{video_id}
X-Api-Key: $HEYGEN_API_KEY
```
Response statuses: `pending` → `processing` → `completed` | `failed`

### Step 3 — Download + Store
- Extract `video_url` from completed response
- Upload to CDN via `upload_file` tool
- Store CDN URL in ContentDraft `video_prompt` field
- Update ContentDraft status and log to GitHub `/videos/finished-videos.md`

---

## 📊 Scoring — Video Quality Threshold

Videos follow the same v3.0 scoring rubric as written content:
- Avg ≥ 7.5 → Auto-approved, posted to platform
- Avg 5.0–7.4 → Regenerate with revised prompt
- Avg < 5.0 → Reject, log reason, start fresh

Additional video-specific penalties:
- No URL visible in video → -2 Clarity
- No subtitles → -2 Conversion
- Hook takes longer than 3 seconds → -2 Relatability
- No CTA in final scene → -3 Conversion
- Wrong aspect ratio for platform → Auto-reject

---

## 🗂️ Content Pillar → Video Format Map

| Pillar | Best Format | Duration | Platform Priority |
|--------|------------|----------|------------------|
| Convenience | POV booking demo, screen record | 15–30s | TikTok, IG Reels |
| Trust | Avatar explainer with checklist overlay | 30–45s | Facebook, LinkedIn |
| Transformation | Before/after B-roll + VO | 15–30s | TikTok, IG, Pinterest |
| Recruitment | Direct-to-camera avatar | 30–60s | LinkedIn, Facebook |
| Local | City-tagged lifestyle B-roll | 15–30s | IG, Facebook, TikTok |
| Proof | Stats infographic + VO | 20–30s | LinkedIn, Facebook |

---

## 🔗 GitHub File References
- This guide: `/system/heygen-video-guide.md`
- All video scripts + prompts: `/videos/scripts/`
- Finished video log: `/videos/finished-videos.md`
