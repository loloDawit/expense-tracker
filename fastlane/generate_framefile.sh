#!/bin/bash

SCREENSHOT_DIR="./screenshots/en-US"
FRAMEFILE_PATH="$SCREENSHOT_DIR/Framefile.json"

mkdir -p "$SCREENSHOT_DIR"

# Start JSON
cat > "$FRAMEFILE_PATH" <<EOF
{
  "default": {
    "show_complete_frame": true,
    "frame": "BLUE",
    "padding": 50,
    "title": {
      "color": "#000000",
      "size": 36
    },
    "subtitle": {
      "color": "#888888",
      "size": 24,
      "text": "Track and manage your expenses easily"
    }
  },
  "data": [
EOF

# Collect all framed PNG files
files=($(ls "$SCREENSHOT_DIR"/framed_*.png 2>/dev/null | sort))
total=${#files[@]}

# Loop through files and add JSON entries
for i in "${!files[@]}"; do
  file=$(basename "${files[$i]}")
  index=$((i + 1))

  echo "    {" >> "$FRAMEFILE_PATH"
  echo "      \"filter\": \"$file\"," >> "$FRAMEFILE_PATH"
  echo "      \"title\": \"Screenshot $index\"," >> "$FRAMEFILE_PATH"
  echo "      \"keyword\": \"screenshot_$index\"" >> "$FRAMEFILE_PATH"

  if [ "$index" -lt "$total" ]; then
    echo "    }," >> "$FRAMEFILE_PATH"
  else
    echo "    }" >> "$FRAMEFILE_PATH"
  fi
done

# Close JSON
echo "  ]" >> "$FRAMEFILE_PATH"
echo "}" >> "$FRAMEFILE_PATH"

echo "✅ Framefile.json generated with $total screenshots."
