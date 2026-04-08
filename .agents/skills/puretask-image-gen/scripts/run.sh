#!/bin/bash
# PureTask Image Generation Script
# Usage: run.sh "<image_prompt>" "<draft_title>" "<size>"
# Sizes: landscape (1792x1024), square (1024x1024), portrait (1024x1792)

source /app/.agents/.env

PROMPT="$1"
TITLE="$2"
SIZE="${3:-1792x1024}"

BRAND_PREFIX="Professional lifestyle photography for a home cleaning marketplace. Clean minimal aesthetic. White and light gray tones. Bright natural lighting. Aspirational, magazine-quality. No text overlays. No clutter. Warm tones. Modern home interiors."

FULL_PROMPT="$BRAND_PREFIX $PROMPT"

echo "Generating image for: $TITLE"
echo "Size: $SIZE"

RESPONSE=$(curl -s https://api.openai.com/v1/images/generations \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"dall-e-3\",
    \"prompt\": $(echo "$FULL_PROMPT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))'),
    \"n\": 1,
    \"size\": \"$SIZE\",
    \"quality\": \"hd\",
    \"style\": \"natural\"
  }")

URL=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['url'])" 2>/dev/null)

if [ -z "$URL" ]; then
  echo "ERROR: $(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',{}).get('message','Unknown error'))")"
  exit 1
fi

# Save filename
SAFE_TITLE=$(echo "$TITLE" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]//g')
OUTFILE="/app/puretask-assets/images/${SAFE_TITLE}.png"
mkdir -p /app/puretask-assets/images

curl -s "$URL" -o "$OUTFILE"
echo "✅ Saved: $OUTFILE"
echo "FILE:$OUTFILE"
