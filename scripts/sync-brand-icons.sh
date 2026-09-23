#!/usr/bin/env bash
# Rebuild social profile pics + dashboard favicons from the Homework Palette app icon
# (blue house + tree). Fixes TikTok review mismatch vs website favicon.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ROOT}/../exercise/ios/HomeworkPalette/HomeworkPalette/Assets.xcassets/AppIcon.appiconset/AppIcon.png"
# Fallback if exercise sibling path differs
if [[ ! -f "$SRC" ]]; then
  SRC="/Users/imphanpagnarith/projects/exercise/ios/HomeworkPalette/HomeworkPalette/Assets.xcassets/AppIcon.appiconset/AppIcon.png"
fi
PROFILE="${ROOT}/assets/profile"
PUBLIC="${ROOT}/dashboard/public"
TIKTOK_ICON="${ROOT}/docs/tiktok-app-review/app-icon-1024.png"

if [[ ! -f "$SRC" ]]; then
  echo "Missing app icon at $SRC" >&2
  exit 1
fi

mkdir -p "$PROFILE" "$PUBLIC" "$(dirname "$TIKTOK_ICON")"

resize() {
  local size="$1" out="$2"
  sips -s format png -z "$size" "$size" "$SRC" --out "$out" >/dev/null
  echo "Wrote $out (${size}×${size})"
}

# Canonical copies
cp "$SRC" "$TIKTOK_ICON"
echo "Synced TikTok review icon → $TIKTOK_ICON"

resize 1024 "$PROFILE/_master-profile.png"
for name in youtube facebook instagram tiktok telegram appstore buymeacoffee; do
  resize 800 "$PROFILE/${name}-profile.png"
done

# Website / browser tab (social.chakriya.net)
resize 512 "$PUBLIC/favicon.png"
resize 32 "$PUBLIC/favicon-32.png"
resize 180 "$PUBLIC/apple-touch-icon.png"

# Also keep a 1024 for App Store / marketing dump next to docs if useful
resize 1024 "$PUBLIC/app-icon-1024.png"

echo "Done. Upload PNGs from assets/profile/ and redeploy dashboard for favicons."
