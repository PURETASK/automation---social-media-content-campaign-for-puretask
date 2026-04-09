# Kling Video Generation Skill

## Purpose
Generate short-form video content for PureTask using the Kling AI API.
Takes a content draft's video_prompt and scripts and produces 9:16 and 16:9 video assets.

## Inputs (environment variables or arguments)
- DRAFT_ID — ContentDraft entity ID to generate video for
- PROMPT — Direct text prompt (alternative to DRAFT_ID)
- DURATION — "5" or "10" seconds (default: "5")
- ASPECT_RATIO — "9:16" (TikTok/Reels default) or "16:9" (YouTube Shorts)
- IMAGE_URL — Optional: starting frame image URL for image-to-video
- MODE — "std" (standard, cheaper) or "pro" (higher quality)

## Outputs
- Video URL written back to ContentDraft.platform_tiktok (9:16)
- Status logged to console

## Usage
```bash
DRAFT_ID=<id> bash .agents/skills/kling-video-gen/scripts/run.sh
# or
PROMPT="A cleaner arriving at a modern home" ASPECT_RATIO="9:16" bash .agents/skills/kling-video-gen/scripts/run.sh
```
