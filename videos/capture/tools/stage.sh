#!/bin/bash
# Stage the local environment the provider videos are recorded against.
# Everything listens on 127.0.0.1 only.
#   stage.sh up          guide pages :8777, read-only demo terminal :7681, ollama, SAM :8800
#   stage.sh reset-sam   wipe the SAM home and restart it (unconfigured: first-run dialog)
#   stage.sh reset-term  restart the demo terminal (before each Ollama take)
#   stage.sh down        stop guide server, terminal and SAM (ollama left running)
# SAM runs headless (`sam run --embedded`) from a scratch dir with ABSOLUTE data paths.
set -uo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${SAM_VIDEO_WORK:-$HOME/.cache/sam-provider-videos/env}"
CONFIGS_FROM="${WORKSHOP_REPO:-$HOME/gitsolace/solace-developer-workshops}"
mkdir -p "$WORK"

sam_stop() { pkill -f "sam --sam-home $WORK/samhome" 2>/dev/null; sleep 3; }
sam_start() {
  [ -d "$WORK/run/configs" ] || { mkdir -p "$WORK/run"; git -C "$CONFIGS_FROM" archive origin/sam-go configs | tar -x -C "$WORK/run"; }
  mkdir -p "$WORK/samhome"
  ( cd "$WORK/run" && SAM_DATA_DIR="$WORK/run/.sam/data" SAM_VOLUME_ROOT="$WORK/run/.sam/data" \
    nohup sam --sam-home "$WORK/samhome" run --embedded --no-onboarding "$WORK/run/configs" > "$WORK/sam.log" 2>&1 & )
  for _ in $(seq 1 60); do
    [ "$(curl -s -o /dev/null -w '%{http_code}' localhost:8800/)" = 200 ] && { echo "SAM up on :8800 (home $WORK/samhome)"; return 0; }
    sleep 1
  done
  echo "SAM did not come up; see $WORK/sam.log"; return 1
}
term_start() {
  pkill -f "ttyd -i lo0 -p 7681" 2>/dev/null; sleep 1
  ( nohup ttyd -i lo0 -p 7681 -t fontSize=22 -t 'theme={"background":"#0d1117","foreground":"#e6edf3"}' \
      bash "$HERE/tools/ollama-demo.sh" "$WORK/ollama-demo.go" > "$WORK/ttyd.log" 2>&1 & )
  echo "demo terminal on 127.0.0.1:7681 (read-only)"
}
case "${1:-up}" in
  up)
    pgrep -f "http.server 8777" >/dev/null || ( nohup python3 -m http.server 8777 --bind 127.0.0.1 -d "$HERE/out/site" > "$WORK/site.log" 2>&1 & )
    term_start
    pgrep -x ollama >/dev/null || ( OLLAMA_HOST=127.0.0.1 nohup ollama serve > "$WORK/ollama.log" 2>&1 & )
    pkill -f "sam --sam-home" 2>/dev/null; sleep 3   # one SAM on :8800 at a time
    sam_start ;;
  reset-sam) sam_stop; rm -rf "$WORK/samhome" "$WORK/run/.sam"; sam_start ;;
  reset-term) term_start ;;
  down) sam_stop; pkill -f "http.server 8777"; pkill -f "ttyd -i lo0 -p 7681"; echo down ;;
esac
