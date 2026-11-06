/* global process, console, fetch, AbortSignal, setTimeout, Buffer */
/**
 * Voices the workshop walkthrough with ElevenLabs, one take per chapter, and
 * writes the timing plan the recording follows.
 *
 *   node capture/narrate.mjs            (before recording)
 *   NARRATE_DRY=1 node capture/narrate.mjs   (counts characters, calls nothing)
 *
 * Each chapter's script (workshop.steps.mjs) is spoken in ONE request to
 * POST /v1/text-to-speech/{voice}/with-timestamps, so the intonation carries
 * from sentence to sentence; the response's per-character timings give the
 * second each `{marker}` is reached. Writes out/narration.plan.json
 * (per chapter: the spoken text, its length, every marker's second and the
 * character timings) for record.mjs.
 *
 * Key: read only from ~/.config/sam-workshop/elevenlabs-key, falling back to
 * ~/.config/storming/elevenlabs-key (the storming tour's, same account).
 * Voice from ~/.config/sam-workshop/elevenlabs-voice when present, else
 * NARRATOR.voice. Clips are cached in ~/.cache/sam-provider-videos by voice,
 * model, settings and text, so a rerun pays only for chapters whose script
 * changed. Each request has a 90s timeout and is retried twice on 429/5xx;
 * any other failure stops the run before the plan is written.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { CHAPTERS, NARRATOR } from './providers.steps.mjs';
import { checkAlignment, markerSeconds, parseScript } from './timeline.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const PLAN_FILE = resolve(HERE, 'out/narration.plan.json');
export const CACHE = resolve(homedir(), '.cache/sam-provider-videos');
const KEY_FILES = [
  resolve(homedir(), '.config/sam-workshop/elevenlabs-key'),
  resolve(homedir(), '.config/storming/elevenlabs-key'),
];
const VOICE_FILE = resolve(homedir(), '.config/sam-workshop/elevenlabs-voice');
const FFPROBE = process.env.FFPROBE ?? 'ffprobe';
const API = 'https://api.elevenlabs.io/v1/text-to-speech';
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
/** Seconds of silence before a step that shows a slide. */
export const GAP_DEFAULT = 3.2;

/**
 * Splice silent gaps into a voiced take: each gap goes between the word before
 * its marker and the marker's word. Returns shifted alignment (so markers and
 * captions follow) plus `gap-<id>` seconds where each silence starts.
 */
function applyGaps(c, alignment, src, dst) {
  const starts = [...alignment.character_start_times_seconds];
  const ends = [...alignment.character_end_times_seconds];
  const text = c.parsed.text;
  const cuts = c.gaps.map(([id, secs]) => {
    const mk = c.parsed.markers.find((m) => m.name === id);
    let i = mk.offset;
    while (i < text.length && /\s/.test(text[i])) i++;
    let j = mk.offset - 1;
    while (j > 0 && /\s/.test(text[j])) j--;
    const at = j >= 0 ? (ends[j] + starts[i]) / 2 : starts[i];
    return { id, secs, i, at };
  }).sort((a, b) => a.at - b.at);
  const gapAt = {};
  let shift = 0;
  for (const g of cuts) {
    gapAt[`gap-${g.id}`] = g.at + shift;
    for (let k = g.i; k < starts.length; k++) { starts[k] += g.secs; ends[k] += g.secs; }
    shift += g.secs;
  }
  // audio: [seg0][sil0][seg1][sil1]...[segN]
  const parts = [];
  const filters = [];
  let prev = 0;
  cuts.forEach((g, n) => {
    filters.push(`[0:a]atrim=start=${prev.toFixed(3)}:end=${g.at.toFixed(3)},asetpts=PTS-STARTPTS[s${n}]`);
    filters.push(`aevalsrc=0:d=${g.secs}:s=44100:c=mono[z${n}]`);
    parts.push(`[s${n}]`, `[z${n}]`);
    prev = g.at;
  });
  filters.push(`[0:a]atrim=start=${prev.toFixed(3)},asetpts=PTS-STARTPTS[s${cuts.length}]`);
  parts.push(`[s${cuts.length}]`);
  filters.push(`${parts.join('')}concat=n=${parts.length}:v=0:a=1[out]`);
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', src, '-filter_complex', filters.join(';'), '-map', '[out]', '-ac', '1', '-ar', '44100', '-b:a', '128k', dst]);
  return { alignment: { ...alignment, character_start_times_seconds: starts, character_end_times_seconds: ends }, gapAt };
}

const readTrim = (f) => { try { return readFileSync(f, 'utf8').trim(); } catch { return ''; } };
export const VOICE = readTrim(VOICE_FILE) || NARRATOR.voice;

/** Each chapter's spoken text and markers, checked against its steps. */
export function chapterScripts() {
  return CHAPTERS.map((ch, i) => {
    const parsed = parseScript(ch.script);
    const names = parsed.markers.map((m) => m.name);
    const stepIds = ch.steps.map((s) => s.id);
    if (names[0] !== stepIds[0] || parsed.markers[0].offset !== 0) throw new Error(`${ch.id}: the script must open with {${stepIds[0]}}`);
    const order = names.filter((n) => stepIds.includes(n));
    if (order.join() !== stepIds.join()) throw new Error(`${ch.id}: step markers must appear once each, in step order (${stepIds.join(', ')})`);
    // chapters ship as standalone videos, so no neighbor context: editing one
    // chapter's script never invalidates another chapter's cached take
    const voiceKey = createHash('sha256').update(JSON.stringify([VOICE, NARRATOR.model, NARRATOR.settings, NARRATOR.seed, parsed.text])).digest('hex').slice(0, 24);
    // A step with a `slide` gets a silent gap before its marker, spliced into the
    // cached voice (no re-voicing). The take key covers the gaps, so changing
    // one re-times the take and marks older recordings stale.
    const gaps = ch.steps.filter((s) => s.slide).map((s) => [s.id, s.slide.hold ?? GAP_DEFAULT]);
    const key = gaps.length ? `${voiceKey}-g${createHash('sha256').update(JSON.stringify(gaps)).digest('hex').slice(0, 8)}` : voiceKey;
    return { id: ch.id, parsed, key, voiceKey, gaps };
  });
}

async function voice(c, apiKey) {
  for (let attempt = 0; ; attempt++) {
    let r;
    try {
      r = await fetch(`${API}/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          text: c.parsed.text,
          model_id: NARRATOR.model,
          voice_settings: NARRATOR.settings,
          seed: NARRATOR.seed,
        }),
        signal: AbortSignal.timeout(90000),
      });
    } catch (e) {
      if (attempt < 2) { await new Promise((res) => setTimeout(res, 2000 * (attempt + 1))); continue; }
      throw new Error(`${c.id}: ElevenLabs did not answer (${e.name})`);
    }
    if (r.ok) {
      const j = await r.json();
      checkAlignment(c.parsed.text, j.alignment);
      return { audio: Buffer.from(j.audio_base64, 'base64'), alignment: j.alignment };
    }
    const body = (await r.text()).slice(0, 300);
    if ((r.status === 429 || r.status >= 500) && attempt < 2) { await new Promise((res) => setTimeout(res, 3000 * (attempt + 1))); continue; }
    throw new Error(`${c.id}: ElevenLabs ${r.status}: ${body}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  let scripts = chapterScripts();
  if (only.length) scripts = scripts.filter((c) => only.includes(c.id));
  mkdirSync(CACHE, { recursive: true });
  const fresh = scripts.filter((c) => !existsSync(resolve(CACHE, `${c.voiceKey}.mp3`)) || !existsSync(resolve(CACHE, `${c.voiceKey}.json`)));
  const chars = (list) => list.reduce((n, c) => n + c.parsed.text.length, 0);
  console.log(`narration (voice ${VOICE}): ${scripts.length} chapters, ${chars(scripts)} characters; ${fresh.length} to voice (${chars(fresh)} characters), the rest cached`);
  if (process.env.NARRATE_DRY === '1') process.exit(0);

  const apiKey = KEY_FILES.map(readTrim).find(Boolean);
  if (!apiKey && fresh.length) { console.error(`no ElevenLabs key in ${KEY_FILES.join(' or ')}`); process.exit(1); }
  try {
    for (const c of fresh) {
      process.stdout.write(`  voicing ${c.id}... `);
      const { audio, alignment } = await voice(c, apiKey);
      writeFileSync(resolve(CACHE, `${c.voiceKey}.mp3`), audio);
      writeFileSync(resolve(CACHE, `${c.voiceKey}.json`), JSON.stringify(alignment));
      console.log(`${(audio.length / 1024).toFixed(0)} KB`);
    }
  } catch (e) {
    console.error(`\n${e.message}\nThe plan was not changed.`);
    process.exit(1);
  }

  // the plan always covers EVERY chapter whose take is cached, so a partial
  // voicing run still writes a plan record.mjs can use for those chapters
  const all = chapterScripts().filter((c) => existsSync(resolve(CACHE, `${c.voiceKey}.mp3`)) && existsSync(resolve(CACHE, `${c.voiceKey}.json`)));
  const plan = all.map((c) => {
    let alignment = JSON.parse(readFileSync(resolve(CACHE, `${c.voiceKey}.json`), 'utf8'));
    let gapAt = {};
    const audio = `${c.key}.mp3`;
    if (c.gaps.length) ({ alignment, gapAt } = applyGaps(c, alignment, resolve(CACHE, `${c.voiceKey}.mp3`), resolve(CACHE, audio)));
    const duration = Number(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', resolve(CACHE, audio)]).toString().trim());
    const markers = { ...markerSeconds(c.parsed, alignment), ...gapAt };
    console.log(`  ${c.id}: ${duration.toFixed(1)}s, ${Object.entries(markers).map(([n, s]) => `${n} ${s.toFixed(1)}`).join(', ')}`);
    return { id: c.id, key: c.key, audio, text: c.parsed.text, duration, markers, alignment };
  });
  mkdirSync(dirname(PLAN_FILE), { recursive: true });
  writeFileSync(PLAN_FILE, JSON.stringify({ voice: VOICE, model: NARRATOR.model, chapters: plan }, null, 1) + '\n');
  console.log(`plan -> ${PLAN_FILE}`);
}
