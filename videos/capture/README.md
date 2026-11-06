# Re-recording the videos

Production tooling for the videos (published on YouTube; see `../README.md`). Narration-first: the script is voiced
once (ElevenLabs), then each chapter is recorded against a local headless SAM so
every on-screen action lands on its word. Adapted from the SAM Go workshop
recording pipeline (`sam-go-workshop-recording/capture`, see its `PLAYBOOK.md`).

## Files

| File | Role |
|---|---|
| `SCRIPT.md` | The narration script with on-screen directions (brackets are not spoken). |
| `providers.steps.mjs` | Each chapter's spoken script (with `{markers}`) and the browser steps. |
| `check-script.mjs` | Confirms each chapter's spoken text matches `SCRIPT.md`. |
| `narrate.mjs` | Voices changed chapters (cached by text) and writes `out/narration.plan.json`. Section slides add silent gaps without re-voicing. |
| `record.mjs <chapter>` | Records one chapter (uses `rig.mjs`, `timeline.mjs`). |
| `assemble.mjs --chapters` | Exports `out/chapters/NN-<chapter>.mp4`. |
| `gen-narration-md.mjs <chapter>` | Per-beat production notes next to each export. |
| `publish.mjs` | Prepends a 4s title card (title and tagline from the steps file) and writes the released `../NN-<chapter>.mp4`. |
| `transcripts.mjs` | Viewer transcripts in `../transcripts/` (timestamps include the title card). |
| `tools/stage.sh` | Local stage, loopback only: guide pages :8777, read-only demo terminal :7681, Ollama, SAM :8800. |
| `tools/render-guides.sh` | Renders the Markdown guides to `out/site` for on-camera guide pages. |

## Loop

```bash
npm install                      # once
tools/render-guides.sh && tools/stage.sh up
node check-script.mjs            # script and steps agree
node narrate.mjs <chapter>       # needs ~/.config/sam-workshop/elevenlabs-key
tools/stage.sh reset-sam         # unconfigured SAM (first-run dialog)
tools/stage.sh reset-term        # before the Ollama chapter
node record.mjs <chapter>        # needs the recording Chrome on CDP :9223
node assemble.mjs --chapters
node publish.mjs                 # title card + export to ../NN-<chapter>.mp4
node transcripts.mjs
# upload ../NN-<chapter>.mp4 to the YouTube playlist (replace the old video),
# then set the chapter's `youtube` ID in providers.steps.mjs and rerun transcripts.mjs
tools/stage.sh down
```

Check each export frame by frame at its cue times before publishing (the
recorder reports late cues; it cannot see wrong pictures).
