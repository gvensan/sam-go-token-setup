/* global console, process */
/**
 * Viewer transcripts for the released videos: one Markdown file per video in
 * ../transcripts/, with timestamps (video time), the section slides, and links
 * to the matching guides. Reads out/narration.plan.json and the chapter steps.
 *
 *   node transcripts.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTERS, YOUTUBE_PLAYLIST } from './providers.steps.mjs';
import { PLAN_FILE } from './narrate.mjs';
import { LEAD } from './rig.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../transcripts');
const GUIDES = {
  'which-provider': [['Pick your provider', '../../README.md'], ['The SAM Models form', '../../common/sam-model-form.md']],
  'api-key-providers': [['OpenAI', '../../providers/openai/README.md'], ['Anthropic', '../../providers/anthropic/README.md'], ['Google AI Studio', '../../providers/google-ai-studio/README.md']],
  'cloud-providers': [['Amazon Bedrock', '../../providers/amazon-bedrock/README.md'], ['Microsoft Foundry (Azure OpenAI)', '../../providers/azure-openai/README.md'], ['Google Vertex AI', '../../providers/google-vertex-ai/README.md']],
  ollama: [['Ollama', '../../providers/ollama/README.md']],
  'custom-provider': [['Custom (OpenAI-compatible) providers', '../../providers/custom/README.md']],
};
/** Seconds of title card publish.mjs puts before each video (kept in step with its CARD_SECONDS). */
const CARD = 4;
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const plan = JSON.parse(readFileSync(PLAN_FILE, 'utf8'));
mkdirSync(OUT, { recursive: true });
for (const ch of CHAPTERS) {
  const take = plan.chapters.find((c) => c.id === ch.id);
  if (!take) { console.error(`${ch.id}: not voiced, skipped`); continue; }
  const slides = ch.steps.filter((s) => s.slide);
  const name = `${String(ch.number).padStart(2, '0')}-${ch.id}`;
  const mp4 = resolve(HERE, '..', `${name}.mp4`);
  const len = existsSync(mp4) ? Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4]).toString()) : take.duration + LEAD + CARD;
  const lines = [`# Video ${ch.number}: ${ch.title}`, '', `Length ${clock(len)}. Watch on [YouTube](https://www.youtube.com/watch?v=${ch.youtube}&list=${YOUTUBE_PLAYLIST}).`, ''];
  lines.push(`Guides for this video: ${GUIDES[ch.id].map(([t, l]) => `[${t}](${l})`).join(', ')}.`, '', '## Transcript', '');
  lines.push(`**[0:00] Title card:** Connect an LLM to Solace Agent Mesh, Video ${ch.number}: ${ch.title}${/[.?!]$/.test(ch.title) ? "" : "."}${ch.tagline ? ` ${ch.tagline}.` : ''}`, '');
  for (const para of ch.script.split(/\n\s*\n/)) {
    const first = para.match(/\{([a-z0-9-]+)\}/)?.[1];
    const step = slides.find((s) => s.id === first);
    if (step) {
      const n = slides.indexOf(step) + 1;
      lines.push(`**[${clock(take.markers[`gap-${step.id}`] + LEAD + CARD)}] Slide: ${ch.slideKicker ?? 'Part'} ${n} of ${slides.length}, ${step.slide.title}.** ${step.slide.sub}.`, '');
    }
    const at = (first ? take.markers[first] + LEAD : 0) + CARD;
    lines.push(`[${clock(at)}] ${para.replace(/\{[a-z0-9-]+\}/g, '').replace(/\s+/g, ' ').trim()}`, '');
  }
  writeFileSync(resolve(OUT, `${name}.md`), lines.join('\n'));
  console.log(`  ${name}.md`);
}
