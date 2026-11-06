# sam-go-token-setup

Guides and helpers for obtaining API tokens/keys from the LLM providers that
Solace Agent Mesh (SAM) supports in its model setup, and for kickstarting
people on both standard providers and any OpenAI-compatible endpoint. The
audience is workshop participants and developers new to SAM: prefer short,
copy-pasteable steps, and verify each provider flow against the live provider
pages before publishing (provider consoles change often).

## Context carried over from the workshop recording project (Nov 2026)

This project was spun out of `~/gitsolace/sam-go-workshop-recording` (the
chapter-video capture pipeline for the SAM Go workshop). Facts verified there
that matter here:

- The companion workshop is `SolaceDev/solace-developer-workshops`, branch
  `sam-go`: a GitHub Codespaces flow with a Workshop Tracker (13 sections) and
  a registration step where participants set their AI API key. That key entry
  point is the moment this project's guides serve.
- **Verified .env gotcha**: in the workshop codespace, a RELATIVE
  `SAM_DATA_DIR` in `/workspaces/solace-developer-workshops/.env` breaks
  custom-toolset discovery after a codespace restart (the fresh `sam` binary
  fork/execs with ENOENT). Any guide that has learners edit `.env` for API
  keys must keep paths absolute and avoid clobbering other entries. This was
  reported to the SAM team as a bug (a backup of the fixed env sits at
  `/tmp/env-backup` inside that codespace).
- Support channel to point learners at: the Solace Agent Mesh category on the
  community forum, https://community.solace.com/c/solace-agent-mesh/16
- Workshop pages (guides, slides) are served from
  https://solacedev.github.io/solace-developer-workshops/
- If this project ever needs demo/walkthrough videos, do not rebuild tooling:
  the recording pipeline lives in `~/gitsolace/sam-go-workshop-recording/capture`
  and its `PLAYBOOK.md` explains the whole recreate/update loop.

## Scope notes

- "Non-standard" here means any OpenAI-compatible provider (custom base URL +
  key), not just the big-name vendors. Treat base-URL + model-name + key as
  the common denominator and document provider quirks as deltas from that.
- Never place real keys in files, examples, or command output; use obvious
  placeholders (`sk-...your-key...`) and point at env files or secret stores.
- Long-term home may be the workshop repo itself (next to its guides) if the
  content becomes learner-facing there; keep the structure portable.
