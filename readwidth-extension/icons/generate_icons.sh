#!/bin/bash

# Generate Chrome extension icons from icon.png
# Requires ImageMagick (convert)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$SCRIPT_DIR/icon.png"

if [ ! -f "$SOURCE" ]; then
  echo "Error: icon.png not found in $SCRIPT_DIR"
  exit 1
fi

for SIZE in 16 48 128; do
  convert "$SOURCE" -resize "${SIZE}x${SIZE}" "$SCRIPT_DIR/icon${SIZE}.png"
  echo "Generated icon${SIZE}.png"
done
