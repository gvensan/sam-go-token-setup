#!/bin/bash
# The on-camera terminal for the Ollama video. ttyd runs THIS script read-only
# (no keyboard input reaches a shell); it waits for the recorder to touch a
# go-file, then types and runs the two commands for real.
GO="${1:-$HOME/.cache/sam-provider-videos/env/ollama-demo.go}"
rm -f "$GO"
clear
printf '$ '
while [ ! -f "$GO" ]; do sleep 0.2; done
type_out() { local s="$1"; for ((i = 0; i < ${#s}; i++)); do printf '%s' "${s:i:1}"; sleep 0.045; done; printf '\n'; }
type_out 'ollama pull llama3.2'
# progress bars as thin green lines (solid blocks stack into a white slab on camera)
ollama pull llama3.2 2>&1 | perl -CS -pe 'BEGIN { $| = 1 } s/(\x{2588}+)/"\e[32m" . ("\x{2501}" x length($1)) . "\e[0m"/ge'
printf '$ '; sleep 1.2
type_out 'ollama list'
ollama list
printf '$ '
sleep 3600
