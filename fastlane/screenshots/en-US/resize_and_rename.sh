#!/bin/bash

set -e

WIDTH=1290
HEIGHT=2796

shopt -s nullglob  # Ensure *.png expands to empty array if no match

for file in *.png; do
  if [[ "$file" == framed_* ]]; then
    continue
  fi

  output="framed_$file"
  echo "Resizing $file -> $output ($WIDTH x $HEIGHT)"
  sips -z "$HEIGHT" "$WIDTH" "$file" --out "$output"

  # Delete original only if resized file exists
  if [[ -f "$output" ]]; then
    rm "$file"
  fi
done

echo "✅ All images resized, renamed to framed_*, and originals removed."
