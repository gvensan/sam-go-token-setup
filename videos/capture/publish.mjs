/* global console */
/**
 * Publish the chapter videos: prepend a title card to each export in
 * out/chapters/ and write the result to ../NN-<chapter>.mp4.
 *
 * Cards are rendered as 1920x1080 PNGs through the recording Chrome (CDP :9223;
 * this ffmpeg build has no drawtext), in the same look as the in-video section
 * slides, then shown for CARD_SECONDS with a fade, over silence.
 *
 *   node assemble.mjs --chapters && node publish.mjs && node transcripts.mjs
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTERS } from './providers.steps.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const CARD_SECONDS = 4;
const CHAP = resolve(HERE, 'out/chapters');
const WORK = resolve(HERE, 'out/publish-work');
const DEST = resolve(HERE, '..');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function cardHtml(ch) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;width:1920px;height:1080px;overflow:hidden;
    background:radial-gradient(ellipse at 30% 40%,#14283a 0%,#0b1520 70%)}
  .wrap{display:flex;flex-direction:column;justify-content:center;height:100%;padding:0 12%;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#e6edf3}
  .kicker{font-size:26px;letter-spacing:.2em;color:#9be09b;font-weight:600}
  .num{font-size:30px;letter-spacing:.2em;color:#aab8c5;font-weight:600;margin-top:18px}
  .title{font-size:84px;font-weight:700;line-height:1.08;margin-top:40px;max-width:1500px}
  .rule{width:120px;height:5px;background:#00c895;border-radius:3px;margin:36px 0}
  .sub{font-size:36px;color:#aab8c5;line-height:1.35;max-width:1400px}
  </style></head><body><div class="wrap">
  <div class="kicker">CONNECT AN LLM TO SOLACE AGENT MESH</div>
  <div class="num">VIDEO ${ch.number}</div>
  <div class="title">${esc(ch.title)}</div>
  <div class="rule"></div>
  <div class="sub">${esc(ch.tagline ?? '')}</div>
  </div></body></html>`;
}

mkdirSync(WORK, { recursive: true });
const browser = await chromium.connectOverCDP('http://127.0.0.1:9223');
const ctx = browser.contexts()[0];
const p = await ctx.newPage();
const s = await ctx.newCDPSession(p);
await s.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
const pngs = {};
for (const ch of CHAPTERS) {
  await p.setContent(cardHtml(ch), { waitUntil: 'load' });
  await p.waitForTimeout(300);
  const { data } = await s.send('Page.captureScreenshot', { format: 'png' });
  pngs[ch.id] = resolve(WORK, `card-${ch.id}.png`);
  (await import('node:fs')).writeFileSync(pngs[ch.id], Buffer.from(data, 'base64'));
}
await p.close();
await browser.close().catch(() => {});

for (const ch of CHAPTERS) {
  const name = `${String(ch.number).padStart(2, '0')}-${ch.id}`;
  const src = resolve(CHAP, `${name}.mp4`);
  if (!existsSync(src)) { console.log(`  ${name}: no export, skipped`); continue; }
  const fadeOut = (CARD_SECONDS - 0.5).toFixed(2);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error',
    '-loop', '1', '-framerate', '30', '-t', String(CARD_SECONDS), '-i', pngs[ch.id],
    '-f', 'lavfi', '-t', String(CARD_SECONDS), '-i', 'anullsrc=r=48000:cl=mono',
    '-i', src,
    '-filter_complex',
    `[0:v]format=yuv420p,fade=t=in:st=0:d=0.5,fade=t=out:st=${fadeOut}:d=0.5,setsar=1[cv];`
    + `[2:v]fps=30,format=yuv420p,setsar=1[mv];[1:a]aresample=48000,aformat=channel_layouts=mono[ca];[2:a]aresample=48000,aformat=channel_layouts=mono[ma];`
    + '[cv][ca][mv][ma]concat=n=2:v=1:a=1[v][a]',
    '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-b:a', '160k',
    '-movflags', '+faststart', resolve(DEST, `${name}.mp4`)]);
  const d = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', resolve(DEST, `${name}.mp4`)]).toString());
  console.log(`  ${name}.mp4 ${Math.floor(d / 60)}:${String(Math.floor(d % 60)).padStart(2, '0')}`);
}
