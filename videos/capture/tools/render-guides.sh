#!/bin/bash
# Render the repo's guide markdown to GitHub-like dark HTML for on-camera use.
# Output: videos/capture/out/site (served by: python3 -m http.server 8777 -d out/site)
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"; ROOT="$(cd "$HERE/../.." && pwd)"; OUT="$HERE/out/site"
rm -rf "$OUT"; mkdir -p "$OUT"
cd "$ROOT"
for md in README.md common/*.md providers/*/README.md; do
  dir="$OUT/$(dirname "$md")"; mkdir -p "$dir"
  [ -d "$(dirname "$md")/images" ] && cp -R "$(dirname "$md")/images" "$dir/"
  title="sam-go-token-setup / $md"
  pandoc "$md" -f gfm -t html5 -s --metadata title="$title" \
    --css "$(python3 -c "import os;print(os.path.relpath('$HERE/out/site/guide.css','$dir'))")" \
    -V header-includes='<style>header#title-block-header{display:none}</style>' \
    -B <(echo "<div class=\"chrome\">Guide: <b>$md</b></div><main>") -A <(echo "</main>") \
    -o "$dir/$(basename "$md" .md).html"
done
cp "$HERE/tools/guide.css" "$OUT/guide.css"
echo "rendered to $OUT"
