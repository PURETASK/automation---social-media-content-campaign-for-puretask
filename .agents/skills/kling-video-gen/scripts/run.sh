#!/bin/bash
# PureTask Kling Video Generation Skill
# Generates short-form video from text or image+text prompts via Kling AI

set -e
source /app/.agents/.env

# ─── CONFIG ──────────────────────────────────────────────────────────────────
KLING_ACCESS_KEY="${KLING_ACCESS_KEY}"
KLING_SECRET_KEY="${KLING_SECRET_KEY}"
BASE44_API_URL="https://api.base44.com/api/apps/69d5e4bdf3e0e9aab2818c8a/entities"

DRAFT_ID="${DRAFT_ID:-}"
PROMPT="${PROMPT:-}"
DURATION="${DURATION:-5}"
ASPECT_RATIO="${ASPECT_RATIO:-9:16}"
IMAGE_URL="${IMAGE_URL:-}"
MODE="${MODE:-std}"
MODEL="${MODEL:-kling-v1}"

# ─── JWT GENERATOR ───────────────────────────────────────────────────────────
generate_jwt() {
  python3 - <<'PYEOF'
import hmac, hashlib, base64, time, json, os

access_key = os.environ['KLING_ACCESS_KEY']
secret_key = os.environ['KLING_SECRET_KEY']

def b64u(data):
    if isinstance(data, str): data = data.encode()
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

now = int(time.time())
h = b64u(json.dumps({'alg':'HS256','typ':'JWT'}, separators=(',',':')))
p = b64u(json.dumps({'iss': access_key, 'exp': now+1800, 'nbf': now-5}, separators=(',',':')))
sig = hmac.new(secret_key.encode(), f'{h}.{p}'.encode(), hashlib.sha256).digest()
print(f'{h}.{p}.{b64u(sig)}')
PYEOF
}

# ─── FETCH DRAFT FROM BASE44 ─────────────────────────────────────────────────
fetch_draft() {
  local draft_id="$1"
  curl -s "https://api.base44.com/api/apps/69d5e4bdf3e0e9aab2818c8a/entities/ContentDraft/${draft_id}" \
    -H "api-key: ${BASE44_API_KEY}" \
    -H "Content-Type: application/json"
}

# ─── UPDATE DRAFT IN BASE44 ──────────────────────────────────────────────────
update_draft() {
  local draft_id="$1"
  local payload="$2"
  curl -s -X PUT \
    "https://api.base44.com/api/apps/69d5e4bdf3e0e9aab2818c8a/entities/ContentDraft/${draft_id}" \
    -H "api-key: ${BASE44_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$payload"
}

# ─── SUBMIT VIDEO JOB ────────────────────────────────────────────────────────
submit_video_job() {
  local jwt="$1"
  local prompt="$2"
  local image_url="$3"

  if [ -n "$image_url" ]; then
    echo "📸 Mode: Image-to-Video (using reference frame)" >&2
    ENDPOINT="https://api.klingai.com/v1/videos/image2video"
    PAYLOAD=$(python3 -c "
import json
payload = {
    'model_name': '${MODEL}',
    'image': '${image_url}',
    'prompt': '''${prompt}''',
    'negative_prompt': 'blurry, dark, messy, cluttered, distorted, low quality',
    'cfg_scale': 0.5,
    'mode': '${MODE}',
    'duration': '${DURATION}'
}
print(json.dumps(payload))
")
  else
    echo "🎬 Mode: Text-to-Video" >&2
    ENDPOINT="https://api.klingai.com/v1/videos/text2video"
    PAYLOAD=$(python3 -c "
import json
payload = {
    'model_name': '${MODEL}',
    'prompt': '''${prompt}''',
    'negative_prompt': 'blurry, dark, messy, cluttered, distorted, low quality',
    'cfg_scale': 0.5,
    'mode': '${MODE}',
    'aspect_ratio': '${ASPECT_RATIO}',
    'duration': '${DURATION}'
}
print(json.dumps(payload))
")
  fi

  curl -s --max-time 30 \
    "$ENDPOINT" \
    -X POST \
    -H "Authorization: Bearer $jwt" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD"
}

# ─── POLL FOR COMPLETION ─────────────────────────────────────────────────────
poll_video_status() {
  local jwt="$1"
  local task_id="$2"
  local endpoint_type="${3:-text2video}"  # text2video or image2video

  local max_attempts=60  # 5 min max (5sec intervals)
  local attempt=0

  echo "⏳ Polling task $task_id..." >&2

  while [ $attempt -lt $max_attempts ]; do
    RESPONSE=$(curl -s --max-time 15 \
      "https://api.klingai.com/v1/videos/${endpoint_type}/${task_id}" \
      -H "Authorization: Bearer $jwt" \
      -H "Content-Type: application/json")

    STATUS=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('data',{}).get('task_status','unknown'))" 2>/dev/null)

    echo "   Status: $STATUS (attempt $((attempt+1))/$max_attempts)" >&2

    if [ "$STATUS" = "succeed" ]; then
      VIDEO_URL=$(echo "$RESPONSE" | python3 -c "
import json,sys
d=json.load(sys.stdin)
works = d.get('data',{}).get('task_result',{}).get('videos',[])
if works: print(works[0].get('url',''))
" 2>/dev/null)
      echo "$VIDEO_URL"
      return 0
    elif [ "$STATUS" = "failed" ]; then
      echo "❌ Video generation failed" >&2
      echo "$RESPONSE" >&2
      return 1
    fi

    sleep 5
    attempt=$((attempt+1))
  done

  echo "⏰ Timeout after $max_attempts attempts" >&2
  return 1
}

# ─── MAIN ────────────────────────────────────────────────────────────────────
main() {
  echo "🎬 PureTask Kling Video Generator"
  echo "=================================="

  # Determine prompt source
  if [ -n "$DRAFT_ID" ]; then
    echo "📄 Fetching draft: $DRAFT_ID"
    DRAFT=$(fetch_draft "$DRAFT_ID")
    PROMPT=$(echo "$DRAFT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('video_prompt') or d.get('script_15sec') or d.get('hook','Clean modern home, PureTask cleaner, trust and reliability'))" 2>/dev/null)
    DRAFT_TITLE=$(echo "$DRAFT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('title',''))" 2>/dev/null)
    # Get image URL from draft if not explicitly provided
    if [ -z "$IMAGE_URL" ]; then
      IMAGE_URL=$(echo "$DRAFT" | python3 -c "import json,sys; d=json.load(sys.stdin); p=d.get('image_prompt',''); print('')" 2>/dev/null)
    fi
    echo "📝 Title: $DRAFT_TITLE"
  fi

  if [ -z "$PROMPT" ]; then
    PROMPT="A professional cleaner arriving at a bright modern home. Clean white aesthetic, trust and reliability. PureTask brand feel. Cinematic, warm lighting."
  fi

  echo "📝 Prompt: ${PROMPT:0:100}..."
  echo "📐 Aspect Ratio: $ASPECT_RATIO"
  echo "⏱️  Duration: ${DURATION}s"
  echo "🎮 Mode: $MODE"
  if [ -n "$IMAGE_URL" ]; then
    echo "🖼️  Reference image: ${IMAGE_URL:0:60}..."
  fi
  echo ""

  # Generate JWT
  JWT=$(generate_jwt)
  echo "🔑 JWT generated"

  # Determine endpoint type
  if [ -n "$IMAGE_URL" ]; then
    ENDPOINT_TYPE="image2video"
  else
    ENDPOINT_TYPE="text2video"
  fi

  # Submit job
  echo "🚀 Submitting video job to Kling..."
  SUBMIT_RESPONSE=$(submit_video_job "$JWT" "$PROMPT" "$IMAGE_URL")

  CODE=$(echo "$SUBMIT_RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('code','?'))" 2>/dev/null)
  TASK_ID=$(echo "$SUBMIT_RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('data',{}).get('task_id',''))" 2>/dev/null)

  echo "📡 Response code: $CODE"
  echo "🆔 Task ID: $TASK_ID"
  echo ""

  if [ "$CODE" != "0" ] || [ -z "$TASK_ID" ]; then
    MSG=$(echo "$SUBMIT_RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('message','Unknown error'))" 2>/dev/null)
    echo "❌ Failed to submit: $MSG"
    echo "Full response: $SUBMIT_RESPONSE"
    exit 1
  fi

  # Poll for completion
  VIDEO_URL=$(poll_video_status "$JWT" "$TASK_ID" "$ENDPOINT_TYPE")

  if [ -z "$VIDEO_URL" ]; then
    echo "❌ No video URL returned"
    exit 1
  fi

  echo ""
  echo "✅ Video ready!"
  echo "🎥 URL: $VIDEO_URL"

  # Write back to ContentDraft if DRAFT_ID provided
  if [ -n "$DRAFT_ID" ]; then
    echo ""
    echo "💾 Saving to ContentDraft..."
    if [ "$ASPECT_RATIO" = "9:16" ]; then
      FIELD="platform_tiktok"
    else
      FIELD="platform_instagram"
    fi

    # Get existing caption to merge
    EXISTING=$(echo "$DRAFT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('${FIELD}',''))" 2>/dev/null)
    NEW_CONTENT="VIDEO: $VIDEO_URL\n\n$EXISTING"

    UPDATE_PAYLOAD=$(python3 -c "
import json
payload = {
    'editor_notes': 'Kling video generated: ${VIDEO_URL}',
    '${FIELD}': 'VIDEO: ${VIDEO_URL}'
}
print(json.dumps(payload))
")
    update_draft "$DRAFT_ID" "$UPDATE_PAYLOAD"
    echo "✅ Draft updated"
  fi

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "RESULT: $VIDEO_URL"
  echo "TASK_ID: $TASK_ID"
  echo "ASPECT_RATIO: $ASPECT_RATIO"
  echo "DURATION: ${DURATION}s"
}

main
