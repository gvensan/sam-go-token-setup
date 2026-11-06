/* global console, process */
/**
 * Proves every chapter's spoken text equals the approved narration in
 * ./SCRIPT.md (markers stripped, whitespace normalized). Run before narrate.mjs.
 */
import { readFileSync } from 'node:fs';
import { CHAPTERS } from './providers.steps.mjs';
import { parseScript } from './timeline.mjs';

const md = readFileSync(new URL('./SCRIPT.md', import.meta.url), 'utf8');
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const sections = md.split(/^## Video (\d+)\./m);
const approved = {};
for (let i = 1; i < sections.length; i += 2) {
  const body = sections[i + 1].split(/^---$/m)[0]
    .replace(/\[[^\]]*\]/gs, ' ')      // on-screen notes
    .replace(/^#.*$/gm, ' ')           // headings
    .replace(/^.*\(\d+:\d+.*\)\s*$/m, ' ');
  approved[Number(sections[i])] = norm(body.split('\n').slice(1).join('\n'));
}
let bad = 0;
for (const ch of CHAPTERS) {
  const spoken = norm(parseScript(ch.script).text);
  const want = approved[ch.number];
  if (spoken === want) { console.log(`ok   ${ch.id} (${spoken.length} chars)`); continue; }
  bad++;
  let k = 0; while (k < spoken.length && spoken[k] === want?.[k]) k++;
  console.log(`DIFF ${ch.id} at char ${k}:\n  script: ...${spoken.slice(Math.max(0, k - 60), k + 80)}\n  draft:  ...${(want ?? '(missing)').slice(Math.max(0, k - 60), k + 80)}`);
}
process.exit(bad ? 1 : 0);
