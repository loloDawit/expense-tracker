#!/bin/bash

set -e

echo "🚀 Running fastlane frameit..."
if fastlane frameit --verbose; then
  echo "✅ frameit completed successfully."
  echo "🧹 Cleaning up original framed_*.png (but NOT *_framed.png)..."
  
  # Delete only files that start with "framed_" but do NOT end with "_framed.png"
  find . -maxdepth 1 -type f -name "framed_*.png" ! -name "*_framed.png" -exec rm -v {} \;
  
  echo "✅ Cleanup complete. Final screenshots are preserved."

  echo "🔁 Renaming *_framed.png files to snake_case..."

  for file in *_framed.png; do
    # Skip if no matches
    [ -e "$file" ] || continue

    # Convert to lowercase, replace spaces and dashes with underscores, remove colons
    new_name=$(echo "$file" | tr '[:upper:]' '[:lower:]' | sed -E 's/[ :\-]+/_/g')

    # Remove multiple underscores
    new_name=$(echo "$new_name" | sed -E 's/_+/_/g')

    # Optional: strip extension and re-add for consistency
    base="${new_name%.png}"
    new_file="${base}.png"

    if [[ "$file" != "$new_file" ]]; then
      mv -v "$file" "$new_file"
    fi
  done

else
  echo "❌ frameit failed. Keeping all files for inspection."
  exit 1
fi
