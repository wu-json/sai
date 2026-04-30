#!/usr/bin/env bash
# Render an HTML file to PNG screenshot(s) using headless Chrome.
#
# Usage:
#   render.sh <path-to-html> [--out <dir>] [--width N] [--height N] [--frames "0,1000,3000"]
#
# Outputs:
#   <out>/frame-<ms>.png        for each requested time point
#   <out>/console.log           captured stderr/console output
#
# Defaults:
#   out     = directory of the html file, subdir ".renders"
#   width   = 1280
#   height  = 800
#   frames  = "0"  (single screenshot, no virtual time budget)

set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [[ ! -x "$CHROME" ]]; then
  echo "error: Chrome not found at: $CHROME" >&2
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "usage: render.sh <path-to-html> [--out <dir>] [--width N] [--height N] [--frames \"0,1000,3000\"]" >&2
  exit 2
fi

HTML_PATH="$1"; shift
if [[ ! -f "$HTML_PATH" ]]; then
  echo "error: not a file: $HTML_PATH" >&2
  exit 2
fi

# Resolve absolute path (macOS lacks `realpath` by default).
ABS_HTML="$(cd "$(dirname "$HTML_PATH")" && pwd)/$(basename "$HTML_PATH")"

OUT_DIR="$(dirname "$ABS_HTML")/.renders"
WIDTH=1280
HEIGHT=800
FRAMES="0"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --out)    OUT_DIR="$2"; shift 2 ;;
    --width)  WIDTH="$2"; shift 2 ;;
    --height) HEIGHT="$2"; shift 2 ;;
    --frames) FRAMES="$2"; shift 2 ;;
    *) echo "error: unknown flag: $1" >&2; exit 2 ;;
  esac
done

mkdir -p "$OUT_DIR"
CONSOLE_LOG="$OUT_DIR/console.log"
: > "$CONSOLE_LOG"

# Each Chrome invocation gets a fresh user-data-dir. Reusing the same dir
# across frames in the same script run causes Chrome to hang on subsequent
# calls (the prior run leaves state behind that confuses the next launch).
USER_DATA_PARENT="$(mktemp -d -t chrome-headless-XXXXXX)"
cleanup() { rm -rf "$USER_DATA_PARENT"; }
trap cleanup EXIT

# macOS lacks `timeout`, so we wrap each chrome invocation with perl's alarm.
run_with_timeout() {
  local secs="$1"; shift
  perl -e 'my $s = shift @ARGV; alarm $s; exec @ARGV' "$secs" "$@"
}

IFS=',' read -ra FRAME_ARR <<< "$FRAMES"
for MS in "${FRAME_ARR[@]}"; do
  MS="$(echo "$MS" | tr -d '[:space:]')"
  OUT_PNG="$OUT_DIR/frame-${MS}.png"

  # NOTE: legacy `--headless` is used because `--headless=new` hangs on
  # macOS Chrome 147 when invoked this way. --virtual-time-budget advances
  # the page clock so animations / setTimeout fire before the screenshot.
  # --virtual-time-budget=0 makes Chrome skip the screenshot entirely, so
  # only pass the flag when MS > 0.
  VTB_ARGS=()
  if [[ "$MS" != "0" ]]; then
    VTB_ARGS=(--virtual-time-budget="$MS")
  fi

  FRAME_USER_DATA="$USER_DATA_PARENT/frame-${MS}"
  mkdir -p "$FRAME_USER_DATA"

  set +e
  run_with_timeout 20 \
    "$CHROME" \
    --headless \
    --disable-gpu \
    --no-sandbox \
    --hide-scrollbars \
    --no-first-run \
    --no-default-browser-check \
    --user-data-dir="$FRAME_USER_DATA" \
    --window-size="${WIDTH},${HEIGHT}" \
    ${VTB_ARGS[@]+"${VTB_ARGS[@]}"} \
    --screenshot="$OUT_PNG" \
    "file://$ABS_HTML" \
    >> "$CONSOLE_LOG" 2>&1
  rc=$?
  set -e

  if [[ -f "$OUT_PNG" ]]; then
    echo "rendered: $OUT_PNG (t=${MS}ms)"
  else
    echo "FAILED to render frame at t=${MS}ms (exit=$rc) — see $CONSOLE_LOG" >&2
  fi
done

# Surface JS errors from the captured console log.
if grep -E -i "Uncaught|SyntaxError|TypeError|ReferenceError" "$CONSOLE_LOG" >/dev/null 2>&1; then
  echo ""
  echo "⚠ console issues detected:"
  grep -E -i "Uncaught|SyntaxError|TypeError|ReferenceError" "$CONSOLE_LOG" | head -20
fi
