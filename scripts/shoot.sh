#!/usr/bin/env bash
# Screenshot the running site via Chrome's CLI --screenshot.
#
# Why the CLI and not CDP: on this machine Page.captureScreenshot returns solid
# black frames (fromSurface:true) or a half-rasterised page (fromSurface:false),
# regardless of --disable-gpu / swiftshader / bringToFront. The CLI path with
# --virtual-time-budget waits for paint properly and produces real renders.
#
# The CLI cannot scroll, so scrolled views come from #anchors, which this site
# already has on every chapter.
#
# --force-prefers-reduced-motion is load-bearing, not politeness: the homepage's
# ignition veil is gated on `isHome && !reduced && !seen` (app/layout.tsx), and
# every CLI run gets a fresh profile, so without it every homepage anchor shot
# came back as a solid #0C1220 rectangle. It also settles the scroll-reveal
# animations so nothing photographs mid-fade.
#
# Usage: bash scripts/shoot.sh [width] [height]
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
OUT="$(pwd)/scratch-shots"
W="${1:-1440}"
H="${2:-900}"
mkdir -p "$OUT"

shoot () { # name  url
  local prof; prof="$(mktemp -d)"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
    --user-data-dir="$prof" --virtual-time-budget=20000     --force-prefers-reduced-motion \
    --window-size="$W,$H" \
    --screenshot="$(cygpath -w "$OUT/$1-$W.png")" "$2" >/dev/null 2>&1
  rm -rf "$prof"
  echo "  $1-$W.png  $(stat -c%s "$OUT/$1-$W.png" 2>/dev/null || echo MISSING)"
}

shoot home-hero      "http://localhost:3200/"
shoot home-heritage  "http://localhost:3200/#heritage"
shoot home-locations "http://localhost:3200/#locations"
shoot home-gift      "http://localhost:3200/#gift"
shoot menu-hero      "http://localhost:3200/menu"
shoot menu-dumplings "http://localhost:3200/menu#c-dumplings"
shoot menu-seafood   "http://localhost:3200/menu#i-seafood"

# --- Full-page homepage capture -------------------------------------------
# The hero is min-height:100vh, so a tall window makes the hero AS TALL AS THE
# WINDOW and the capture shows nothing else. Pin it for the duration of the
# shot, then put it back. This is why `shoot-home-tall` is a separate step.
shoot_home_tall () {
  local css="app/styles/04-hero.css"
  cp "$css" /tmp/04-hero.shootbak
  printf '\n.hero{min-height:900px!important;height:900px!important}\n' >> "$css"
  sleep 2
  local prof; prof="$(mktemp -d)"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
    --user-data-dir="$prof" --virtual-time-budget=35000 \
    --window-size=1440,9200 \
    --screenshot="$(cygpath -w "$OUT/home-tall.png")" "http://localhost:3200/" >/dev/null 2>&1
  rm -rf "$prof"
  cp /tmp/04-hero.shootbak "$css"
  echo "  home-tall.png  $(stat -c%s "$OUT/home-tall.png" 2>/dev/null || echo MISSING)"
}
