/* global process, document, window, localStorage, location */
/**
 * The provider-setup videos: five standalone chapters, narration-first.
 * Narration text is the approved SCRIPT.draft.md v2 (Giri, 2026-11-06), verbatim
 * apart from {markers} (check with: node check-script.mjs).
 *
 * Environment (tools/stage.sh up): SAM 2.385.1 headless on http://localhost:8800,
 * guide pages on http://127.0.0.1:8777, read-only demo terminal on :7681, Ollama.
 * Vendor docs open in a separate, signed-out browser context (no identities on camera).
 *
 * Rules (videos/SCRIPT.draft.md): provider neutral; typed placeholders only, never
 * submitted; pictures land on their words (navigation inside cuts).
 */

export const TITLE = 'Connect an LLM to Solace Agent Mesh';
export const DESCRIPTION = `How to give Solace Agent Mesh (SAM) a language model: which provider fits your situation, how to get a credential from each, and where it goes in SAM.

Provider steps are based on each provider's public documentation; consoles and model names change often, so follow the linked guides for the current flow.`;

/** Same narrator as the SAM Go workshop series. */
export const NARRATOR = {
  voice: 'cjVigY5qzO86Huf0OWal',
  model: 'eleven_multilingual_v2',
  settings: { stability: 0.35, similarity_boost: 0.75, style: 0.2, speed: 1.05, use_speaker_boost: true },
  seed: 20261106,
};

const SAM = process.env.SAM_URL ?? 'http://localhost:8800';
const GUIDES = process.env.GUIDES_URL ?? 'http://127.0.0.1:8777';
const TERM = process.env.TERM_URL ?? 'http://127.0.0.1:7681';
const DEMO_GO = `${process.env.HOME}/.cache/sam-provider-videos/env/ollama-demo.go`;

const DOCS = {
  openaiKeys: 'https://developers.openai.com/api/docs/guides/api-keys',
  openaiPricing: 'https://developers.openai.com/api/docs/pricing',
  claudeAuth: 'https://platform.claude.com/docs/en/manage-claude/authentication',
  claudePricing: 'https://platform.claude.com/docs/en/about-claude/pricing',
  aistudioKey: 'https://aistudio.google.com/docs/api-key',
  aistudioPricing: 'https://aistudio.google.com/docs/pricing',
  iamUser: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html',
  iamKeys: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',
  bedrockAccess: 'https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html',
  azureCreate: 'https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/create-resource',
  vertexStart: 'https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/quickstart',
  gcpKeys: 'https://docs.cloud.google.com/iam/docs/keys-create-delete',
  ollamaDownload: 'https://ollama.com/download',
  cerebras: 'https://inference-docs.cerebras.ai/quickstart',
  deepseek: 'https://api-docs.deepseek.com/',
};

const FAST = { glide: 280, beat: 400, settle: 300 };

// ── helpers ──────────────────────────────────────────────────────────────

/** A page.evaluate that cannot hang. */
async function ask(p, fn, arg, ms = 5000) {
  return Promise.race([p.evaluate(fn, arg), new Promise((r) => setTimeout(() => r(null), ms))]).catch(() => null);
}

/** Choreographed click on a Playwright locator. */
async function clickLoc(t, locator, opts = {}) {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  const box = await Promise.race([locator.boundingBox(), new Promise((r) => setTimeout(() => r(null), 4000))]).catch(() => null);
  if (!box) throw new Error('clickLoc: target has no bounding box');
  await t.showClick({ x: box.x + box.width / 2, y: box.y + box.height / 2 }, opts);
}

/** Glide to a locator and pulse, without clicking: "this one". */
async function pointLoc(t, locator, { ring = true } = {}) {
  const b = await Promise.race([locator.boundingBox(), new Promise((r) => setTimeout(() => r(null), 3000))]).catch(() => null);
  if (b) await t.point({ x: b.x + Math.min(b.width / 2, 260), y: b.y + b.height / 2 }, { ring });
}

/** Smooth-scroll so the first heading (else any small element) containing `text` is in view. */
async function landmark(t, text, { block = 'start', settle = 1800, smooth = true } = {}) {
  await ask(t.source, ([txt, blk, sm]) => {
    const low = txt.toLowerCase();
    const has = (e) => (e.textContent ?? '').trim().toLowerCase().includes(low) && e.getClientRects().length;
    const el = [...document.querySelectorAll('h1,h2,h3,h4')].find(has)
      ?? [...document.querySelectorAll('p,li,td,th,strong,span,code,a')].filter(has).sort((a, b) => a.textContent.length - b.textContent.length)[0];
    if (el) el.scrollIntoView({ behavior: sm ? 'smooth' : 'auto', block: blk });
  }, [text, block, smooth]);
  await t.wait(settle);
}

/** The SAM tab (main context), made the source. */
async function samPage(t) {
  const p = t.tab('localhost:8800');
  if (p) { await t.useSource(p); return p; }
  return t.open(`${SAM}/#/chat`);
}

const dialog = (p) => p.getByRole('dialog', { name: 'Configure Your AI Models' });

/** Fresh first-run dialog over New Chat (SAM must be unconfigured: stage.sh reset-sam). */
async function freshDialog(t) {
  const p = await samPage(t);
  await p.goto(`${SAM}/#/chat`, { waitUntil: 'domcontentloaded' });
  await ask(p, () => { localStorage.removeItem('model-setup-dialog-dismissed'); localStorage.setItem('sam-theme', 'dark'); window.getSelection()?.removeAllRanges(); });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await dialog(p).waitFor({ state: 'visible', timeout: 20000 });
  await t.settleCapture?.();
  await t.wait(900);
  return p;
}

/** Open the provider list (choreographed unless inside a cut). */
async function openProviders(t, opts = {}) {
  await clickLoc(t, t.source.getByTestId('modelProviderSelect'), opts);
  await t.source.locator('[data-slot="popover-content"] button').first().waitFor({ timeout: 5000 });
  await t.wait(300);
}
const providerOption = (p, name) => p.locator('[data-slot="popover-content"] button').filter({ hasText: new RegExp(`^${name}`) }).first();

/** Pick a provider from the open list, or open the list first. */
async function pickProvider(t, name, opts = {}) {
  if (!(await providerOption(t.source, name).isVisible().catch(() => false))) await openProviders(t, opts);
  await clickLoc(t, providerOption(t.source, name), opts);
  await t.wait(500);
}

/** Native select for Authentication Type: point, then choose. */
async function chooseAuth(t, label) {
  const sel = t.source.locator('form select').first();
  await pointLoc(t, sel, { ring: false });
  await sel.selectOption({ label });
  await t.wait(500);
}

/** Click a field, clear it, type a placeholder visibly; reveal it when it is a password field. */
async function typePlaceholder(t, locator, value, { reveal = false } = {}) {
  await clickLoc(t, locator, { ring: false, glide: 300, beat: 150, settle: 150 });
  await locator.fill('').catch(() => {});
  await t.type(value, { delay: 22 });
  if (reveal) {
    const eye = locator.locator('xpath=..').getByTestId('Show password');
    if (await eye.count()) await clickLoc(t, eye, { ring: false, glide: 250, beat: 150, settle: 200 });
  }
  await t.wait(150);
}

/** Click a field and paste a placeholder in one go (the narration says "paste"). */
async function pastePlaceholder(t, locator, value, { reveal = false } = {}) {
  await clickLoc(t, locator, { ring: false, glide: 300, beat: 150, settle: 150 });
  await locator.fill(value);
  if (reveal) {
    const eye = locator.locator('xpath=..').getByTestId('Show password');
    if (await eye.count()) await clickLoc(t, eye, { ring: false, glide: 250, beat: 150, settle: 200 });
  }
  await t.wait(150);
}

/** The signed-out context for vendor docs (no account, no identity on camera). */
async function docsContext(t) {
  if (!t.state.docsCtx) {
    t.state.docsCtx = await t.ctx.browser().newContext({ viewport: { width: 1728, height: 972 }, colorScheme: 'dark' });
  }
  return t.state.docsCtx;
}

/** Inside a cut: open a vendor docs page signed out, clear banners, land on `mark`. */
async function openDoc(t, url, mark, { block = 'start' } = {}) {
  await t.cut(async () => {
    const ctx = await docsContext(t);
    const p = t.state.docPage && !t.state.docPage.isClosed() ? t.state.docPage : await ctx.newPage();
    t.state.docPage = p;
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p.locator('h1').first().waitFor({ timeout: 30000 }).catch(() => {});
    await t.wait(2500);
    for (const name of [/Reject all/i, /^Dismiss$/i, /^Decline/i, /^Reject$/i]) {
      const b = p.getByRole('button', { name }).first();
      if (await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); await t.wait(500); }
    }
    await t.useSource(p);
    if (mark) await landmark(t, mark, { block, smooth: false, settle: 600 });
    else await ask(p, () => window.scrollTo(0, 0));
  });
}

/** Inside a cut: open one of this repo's guide pages (rendered by tools/render-guides.sh). */
async function openGuide(t, path, mark, { block = 'start' } = {}) {
  await t.cut(async () => {
    const url = `${GUIDES}/${path}`;
    const p = t.tab(url) ?? await t.ctx.newPage();
    if (p.url() !== url) await p.goto(url, { waitUntil: 'domcontentloaded' });
    await t.useSource(p);
    await ask(p, () => window.scrollTo(0, 0));
    if (mark) await landmark(t, mark, { block, smooth: false, settle: 500 });
  });
}

/** Back to the SAM dialog (inside a cut) with `provider` already selected. */
async function backToDialog(t, provider) {
  await t.cut(async () => {
    const p = await samPage(t);
    if (!(await dialog(p).isVisible().catch(() => false))) await freshDialog(t);
    if (provider) {
      await openProviders(t);
      await providerOption(p, provider).click();
      await t.wait(600);
    }
  });
}

/** Inside a cut: SAM's Models page (System Settings > Models). */
async function modelsPage(t) {
  await t.cut(async () => {
    const p = await samPage(t);
    await p.goto(`${SAM}/#/models`, { waitUntil: 'domcontentloaded' });
    await p.getByRole('button', { name: /Add Model/i }).first().waitFor({ timeout: 15000 });
    await t.wait(1200);
    if (await dialog(p).isVisible().catch(() => false)) await dialog(p).getByRole('button', { name: 'Cancel' }).click().catch(() => {});
    await dialog(p).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    await ask(p, () => window.getSelection()?.removeAllRanges());
    await t.wait(800);
  });
}

// ── the chapters ──────────────────────────────────────────────────────────

/** The published playlist; each chapter's `youtube` is its video ID in it. */
export const YOUTUBE_PLAYLIST = 'PLD2bQ9LWYU9M';

export const CHAPTERS = [
  // ─────────────────────────────────────────────────────────────── Video 0
  {
    id: 'which-provider',
    youtube: '0TZFC9q_6lo',
    tagline: 'What a model configuration is, General and Planning, and choosing a provider',
    number: 0,
    title: 'Which model provider?',
    stage: 'SAM unconfigured (tools/stage.sh reset-sam). Guide pages rendered and served.',
    script: `{intro}Every agent in Solace Agent Mesh does its thinking with a large language model, and a new install has none connected yet. {banner}Agent Mesh tells you so right at the top.

{nav}Models live under System Settings, {nav-models}Models. {i-parts}Each row here is a model configuration: {c-provider}which provider hosts the model, {c-model}which model to call, and, behind it, the credentials to reach it. {c-name}Agents refer to a configuration by its name, an alias, never by the provider or the key. So you can switch providers or models in one place, without touching any agent.

{defaults}Every deployment starts with two built-in configurations, marked Default. {general}General is the model that new agents and the built-in AI features use. {planning}Planning is the model the Orchestrator agent uses to plan a task and delegate the work to other agents. {not-configured}On a new install, both are not configured, so nothing can use them yet. You can't delete them, but you can point either one at a different provider or model at any time. {add}Add Model creates more configurations, for example a separate model for one agent.

{dialog}To connect both in one step, Agent Mesh opens this dialog the first time you visit it in a browser. It sets General and Planning to the same provider and model, and you can change each one later. If you close it, you can set them up from the Models page instead.

{open}The dialog asks for three things: a provider, a credential, and a model. Agent Mesh works with many providers, and there is no single right choice. It depends on what you already have.

{choices}If you already have an API key from {g-key}OpenAI, Anthropic, or Google AI Studio, use that provider. Video one covers all three.

If your organization runs on Amazon Web Services, Microsoft Azure, or Google Cloud, you can serve models from that cloud through {g-cloud}Amazon Bedrock, Microsoft Foundry, or Google Vertex AI. That is video two.

If you want models to run on your own machine, with no key and nothing sent to a cloud, use {g-local}Ollama, in video three.

And for any other provider or server that speaks the OpenAI API, choose {g-custom}Custom, in video four.

{table}Some of these offer free tiers and some need billing from the start; the guide's table shows what each one needs, so you can decide before you sign up anywhere.

{close}Whichever you choose, the step in Agent Mesh is the same short form. Pick your video, and the matching guide is in the description.`,
    async setup(t) {
      // New Chat with the first-run dialog dismissed: the "no default model" banner is the opening picture.
      await t.cut(async () => {
        const p = await samPage(t);
        await p.goto(`${SAM}/#/chat`, { waitUntil: 'domcontentloaded' });
        // The one-time "now accessible to your team" notice on Models is not part of this story: pre-dismissed.
        await ask(p, () => { localStorage.setItem('model-setup-dialog-dismissed', 'true'); localStorage.setItem('sam-models-onboarding-dismissed', 'true'); localStorage.setItem('sam-theme', 'dark'); });
        await p.reload({ waitUntil: 'domcontentloaded' });
        await p.getByText('No default model has been set up', { exact: false }).first().waitFor({ timeout: 20000 });
        // Start with System Settings collapsed so the viewer sees it open.
        if (await p.getByRole('link', { name: 'Models', exact: true }).isVisible().catch(() => false)) {
          await p.getByRole('button', { name: 'System Settings' }).click();
        }
        await ask(p, () => window.getSelection()?.removeAllRanges());
        await t.wait(1200);
      });
    },
    steps: [
      {
        id: 'intro',
        async act(t) {
          await t.at('banner');
          await pointLoc(t, t.source.getByText('No default model has been set up', { exact: false }).first());
        },
      },
      {
        id: 'nav',
        async act(t) {
          const p = t.source;
          await clickLoc(t, p.getByRole('button', { name: 'System Settings' }), FAST);
          await t.at('nav-models');
          await clickLoc(t, p.getByRole('link', { name: 'Models', exact: true }));
          await p.getByRole('button', { name: /Add Model/i }).first().waitFor({ timeout: 15000 });
        },
      },
      {
        id: 'i-parts',
        async act(t) {
          const p = t.source;
          const col = (name) => p.getByRole('columnheader', { name, exact: true }).first();
          await t.at('c-provider'); await pointLoc(t, col('Model Provider'));
          await t.at('c-model'); await pointLoc(t, col('Model'));
          await t.at('c-name'); await pointLoc(t, col('Name'));
        },
      },
      {
        id: 'defaults',
        async act(t) {
          const p = t.source;
          const row = (name) => p.locator('tr').filter({ hasText: name }).first();
          await pointLoc(t, row('General').getByText('Default', { exact: true }));
          await t.at('general'); await pointLoc(t, row('General').getByText('General', { exact: true }));
          await t.at('planning'); await pointLoc(t, row('Planning').getByText('Planning', { exact: true }));
          await t.at('not-configured'); await pointLoc(t, row('General').getByText('Not configured', { exact: true }).first());
          await t.at('add'); await pointLoc(t, p.getByRole('button', { name: /Add Model/i }).first());
        },
      },
      {
        id: 'dialog',
        async act(t) {
          // One page load (not freshDialog's two) so the dialog is up as "this dialog" is said.
          await t.cut(async () => {
            const p = t.source;
            await ask(p, () => { localStorage.removeItem('model-setup-dialog-dismissed'); window.getSelection()?.removeAllRanges(); });
            await p.goto(`${SAM}/?fresh=1#/chat`, { waitUntil: 'domcontentloaded' });
            await dialog(p).waitFor({ state: 'visible', timeout: 20000 });
            await t.settleCapture();
            await t.wait(300);
          });
        },
      },
      {
        id: 'open',
        async act(t) {
          await pointLoc(t, t.source.getByTestId('modelProviderSelect'));
          await t.wait(4500); // "a provider, a credential, and a model" holds on the form
          await openProviders(t); // "Agent Mesh works with many providers"
        },
      },
      {
        id: 'choices',
        async act(t) {
          const p = t.source;
          for (const [cue, names] of [['g-key', ['OpenAI', 'Anthropic', 'Google AI Studio']], ['g-cloud', ['Amazon Bedrock', 'Microsoft Foundry', 'Google Vertex AI']], ['g-local', ['Ollama']], ['g-custom', ['Custom']]]) {
            await t.at(cue);
            for (const n of names) { await pointLoc(t, providerOption(p, n)); await t.wait(700); }
          }
        },
      },
      {
        id: 'table',
        async act(t) {
          await t.cut(async () => { await t.source.keyboard.press('Escape').catch(() => {}); });
          await openGuide(t, 'README.html', 'Pick your provider');
          await t.wait(2500);
          await landmark(t, 'Cost to start', { block: 'center', settle: 1200 });
        },
      },
      {
        id: 'close',
        async act(t) { await t.cut(async () => { await samPage(t); }); await pointLoc(t, t.source.getByTestId('modelProviderSelect')); },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────── Video 1
  {
    id: 'api-key-providers',
    youtube: 'atnMfLbcSF4',
    tagline: 'Create an API key, then add it in Agent Mesh',
    slideKicker: 'Provider',
    number: 1,
    title: 'API-key providers: OpenAI, Anthropic, Google AI Studio',
    stage: 'SAM unconfigured (tools/stage.sh reset-sam).',
    script: `{open}This video covers the three providers that need only an API key: {h-openai}OpenAI, {h-anthropic}Anthropic, and {h-google}Google AI Studio. The provider steps you will see come from each provider's public documentation; consoles change often, so the guide links every step to its source.

{pattern}All three work the same way. Pick the provider, {p-key}paste the key, and {p-model}choose a model. The model list stays empty until the key is accepted, because Agent Mesh asks the provider which models your key can use. An empty list is your first hint that something is wrong with the key.

{models-change}Model names change often: new models arrive and older ones are retired. So pick from the list Agent Mesh shows you, rather than from any name in a video.

{openai}For OpenAI, sign in to the platform and open the API keys page. Choose Create new secret key, name it, and set an expiry if you are offered one. Copy the key straight away: OpenAI shows it only once.

{openai-pricing}Usage is paid from prepaid credits, with a limited free tier in some countries.

{openai-sam}In Agent Mesh, choose OpenAI and paste your key. {openai-guide}Our OpenAI guide has every step and the common errors.

{anthropic}For Anthropic's Claude models, use the Claude Console. Under API keys, choose Create key, name it, and pick an expiry; it cannot be changed later. {a-workspace}Scope the key to a workspace, because a key without one is rejected unless every request names a workspace.

{anthropic-pricing}New accounts get a small amount of credit to try the API; after that, usage is prepaid.

{anthropic-sam}In Agent Mesh, choose Anthropic and paste your key. {anthropic-guide}The Anthropic guide has the details.

{google}For Google AI Studio, sign in with a Google account, open the API key page, and choose Create API key. {g-restrict}If AI Studio offers to restrict the key, restrict it to the Gemini API.

{google-pricing}Several Gemini models have a free tier with rate limits. On the free tier, Google may use your prompts to improve its products, so keep confidential data off it; the paid tier does not.

{google-sam}In Agent Mesh, choose Google AI Studio and paste your key. {google-guide}The guide has the details.

{finish}With a real key, choose a model and then Set Up Default Models. That one step sets both built-in models, General and Planning; {f-models}you can change either one later under System Settings, Models. The guides are linked in the description, and questions go to the Solace Agent Mesh community forum.`,
    async setup(t) { await t.cut(async () => { await freshDialog(t); await openProviders(t); }); },
    steps: [
      {
        id: 'open',
        async act(t) {
          for (const [cue, n] of [['h-openai', 'OpenAI'], ['h-anthropic', 'Anthropic'], ['h-google', 'Google AI Studio']]) {
            await t.at(cue); await pointLoc(t, providerOption(t.source, n));
          }
        },
      },
      {
        id: 'pattern',
        async act(t) {
          await pickProvider(t, 'OpenAI', FAST);
          await t.at('p-key');
          await pastePlaceholder(t, t.source.locator('input[name="apiKey"]'), 'sk-...your-key...');
          await t.at('p-model');
          await clickLoc(t, t.source.getByPlaceholder('Type or select a model...'), { beat: 500 });
        },
      },
      { id: 'models-change', async act(t) { await pointLoc(t, t.source.getByPlaceholder('Type or select a model...')); } },
      {
        id: 'openai',
        slide: { title: 'OpenAI', sub: 'You need: an API key' },
        async act(t) { await openDoc(t, DOCS.openaiKeys, 'API keys and service accounts'); await t.wait(5000); await landmark(t, 'Manage credentials through their lifecycle'); },
      },
      { id: 'openai-pricing', async act(t) { await openDoc(t, DOCS.openaiPricing, 'Pricing'); await t.wait(1500); await landmark(t, 'Flagship models', { settle: 1200 }); } },
      {
        id: 'openai-sam',
        async act(t) {
          await backToDialog(t, 'OpenAI');
          await pastePlaceholder(t, t.source.locator('input[name="apiKey"]'), 'sk-...your-key...', { reveal: true });
          await t.at('openai-guide');
          await openGuide(t, 'providers/openai/README.html');
          await landmark(t, '1. Get your API key', { settle: 1000 });
        },
      },
      { id: 'anthropic',
        slide: { title: 'Anthropic', sub: 'You need: an API key, scoped to a workspace' }, async act(t) { await openDoc(t, DOCS.claudeAuth, 'Create and use a key'); await t.at('a-workspace'); await landmark(t, 'Select a workspace'); } },
      { id: 'anthropic-pricing', async act(t) { await openDoc(t, DOCS.claudePricing, 'Model pricing'); } },
      {
        id: 'anthropic-sam',
        async act(t) {
          await backToDialog(t, 'Anthropic');
          await pastePlaceholder(t, t.source.locator('input[name="apiKey"]'), 'sk-ant-...your-key...', { reveal: true });
          await t.at('anthropic-guide');
          await openGuide(t, 'providers/anthropic/README.html');
          await landmark(t, 'Troubleshooting', { settle: 1000 });
        },
      },
      { id: 'google',
        slide: { title: 'Google AI Studio', sub: 'You need: an API key' }, async act(t) { await openDoc(t, DOCS.aistudioKey, 'Managing API keys in Google AI Studio'); await t.at('g-restrict'); await landmark(t, 'Restricting and securing your keys'); } },
      { id: 'google-pricing', async act(t) { await openDoc(t, DOCS.aistudioPricing, 'Gemini Developer API pricing'); await t.wait(2000); await t.scroll(300); } },
      {
        id: 'google-sam',
        async act(t) {
          await backToDialog(t, 'Google AI Studio');
          await pastePlaceholder(t, t.source.locator('input[name="apiKey"]'), '...your-gemini-key...', { reveal: true });
          await t.at('google-guide');
          await openGuide(t, 'providers/google-ai-studio/README.html');
          await landmark(t, 'Troubleshooting', { settle: 1000 });
        },
      },
      {
        id: 'finish',
        async act(t) {
          await backToDialog(t);
          await pointLoc(t, dialog(t.source).getByRole('button', { name: 'Set Up Default Models' }));
          await t.at('f-models');
          await modelsPage(t);
          await pointLoc(t, t.source.getByText('General', { exact: true }).first());
          await t.wait(800);
          await pointLoc(t, t.source.getByText('Planning', { exact: true }).first());
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────── Video 2
  {
    id: 'cloud-providers',
    youtube: '0aBb9YDBepI',
    tagline: 'Serve models from your organization\'s cloud account',
    slideKicker: 'Provider',
    number: 2,
    title: 'Cloud platforms: Amazon Bedrock, Microsoft Foundry, Google Vertex AI',
    stage: 'SAM unconfigured (tools/stage.sh reset-sam).',
    script: `{open}If your organization runs on a cloud, you can serve Agent Mesh's models from it: {h-bedrock}Amazon Bedrock, {h-foundry}Microsoft Foundry, or {h-vertex}Google Vertex AI. The credential belongs to your cloud account, so there are a few more steps than with a simple API key, and each cloud has one detail that trips people up. The cloud steps come from each provider's public documentation, linked in the guides.

{bedrock}Start with what Agent Mesh asks for. For Bedrock it is an {b-ids}AWS access key ID and secret access key, an optional session token, and a {b-region}Region. Bedrock also offers newer API keys, but this form takes IAM access keys, so that is what we create.

{bedrock-iam}In the IAM console, create a user for Agent Mesh and attach the AWS managed policy Amazon Bedrock Limited Access. {b-keys}Then, on that user's security credentials tab, create an access key. Copy the secret now; AWS shows it once.

{bedrock-access}Two Bedrock details. Models switch on the first time you call them, and for third-party models that first call can take up to fifteen minutes. {b-anthropic}And Anthropic's models on Bedrock need a one-time use case form first.

{bedrock-sam}In Agent Mesh, paste both keys and enter your Region. {b-region-matters}The Region matters: models not offered there do not appear in the list. {bedrock-guide}The Bedrock guide has each step.

{foundry}Azure OpenAI now lives in Microsoft Foundry, and Agent Mesh labels it that way; older versions of Agent Mesh still say Azure OpenAI. You need three things: the {f-endpoint}resource endpoint, a key, and a {f-deployment}deployment name.

{foundry-docs}In the Azure portal, create an Azure OpenAI resource. {f-deploy}In the Foundry portal, deploy a model and note the deployment's name. Then, under Keys and Endpoint, copy the endpoint and Key 1.

{foundry-sam}Two details. Paste the endpoint exactly as shown, with nothing added after it; Agent Mesh builds the rest of the address itself. {f-name}And type your deployment's name, not the model's name. They can differ, and mixing them up is the most common Foundry error.

{vertex}Google Vertex AI uses a service account. Agent Mesh asks for its {v-json}JSON key, pasted whole, your {v-project}project ID, and a region.

{vertex-docs}In a Google Cloud project with billing, enable the Agent Platform API, which is what Google now calls Vertex AI. Create a service account with the Agent Platform User role, {v-keys}and create a JSON key for it. The file downloads once.

{vertex-sam}One detail: many company Google Cloud organizations block service account keys by policy. If yours does, ask your cloud admin. {v-paste}Otherwise paste the whole file, add your project ID and region, and choose a model.

{close}Which models each cloud offers changes over time and by region, so check the provider's model catalog and pick from the list Agent Mesh shows. The guides are linked in the description.`,
    async setup(t) { await t.cut(async () => { await freshDialog(t); await openProviders(t); }); },
    steps: [
      {
        id: 'open',
        async act(t) {
          for (const [cue, n] of [['h-bedrock', 'Amazon Bedrock'], ['h-foundry', 'Microsoft Foundry'], ['h-vertex', 'Google Vertex AI']]) {
            await t.at(cue); await pointLoc(t, providerOption(t.source, n));
          }
        },
      },
      {
        id: 'bedrock',
        slide: { title: 'Amazon Bedrock', sub: 'You need: an AWS access key, its secret, and a Region' },
        async act(t) {
          await pickProvider(t, 'Amazon Bedrock', FAST);
          const p = t.source;
          await t.at('b-ids');
          await pointLoc(t, p.locator('input[name="awsAccessKeyId"]'));
          await t.wait(600);
          await pointLoc(t, p.locator('input[name="awsSecretAccessKey"]'));
          await t.at('b-region');
          await pointLoc(t, p.locator('input[name="awsRegionName"]'));
        },
      },
      { id: 'bedrock-iam', async act(t) { await openDoc(t, DOCS.iamUser, 'Create an IAM user'); await t.at('b-keys'); await openDoc(t, DOCS.iamKeys, 'Manage access keys for IAM users'); } },
      { id: 'bedrock-access', async act(t) { await openDoc(t, DOCS.bedrockAccess, 'Request access to models'); await t.at('b-anthropic'); await landmark(t, 'Required one-time for Anthropic models'); } },
      {
        id: 'bedrock-sam',
        async act(t) {
          await backToDialog(t, 'Amazon Bedrock');
          const p = t.source;
          await pastePlaceholder(t, p.locator('input[name="awsAccessKeyId"]'), 'AKIA...your-key-id...');
          await pastePlaceholder(t, p.locator('input[name="awsSecretAccessKey"]'), '...your-secret...', { reveal: true });
          await typePlaceholder(t, p.locator('input[name="awsRegionName"]'), 'us-east-1');
          await t.at('b-region-matters');
          await pointLoc(t, p.locator('input[name="awsRegionName"]'));
          await t.at('bedrock-guide');
          await openGuide(t, 'providers/amazon-bedrock/README.html');
          await landmark(t, '1. Create an IAM user', { settle: 1000 });
        },
      },
      {
        id: 'foundry',
        slide: { title: 'Microsoft Foundry', sub: 'You need: an endpoint, a key, and a deployment name' },
        async act(t) {
          await backToDialog(t, 'Microsoft Foundry');
          const p = t.source;
          await chooseAuth(t, 'API Key');
          await t.at('f-endpoint');
          await pointLoc(t, p.locator('input[name="apiBase"]'));
          await t.at('f-deployment');
          await pointLoc(t, p.getByPlaceholder('Type or select a deployment...'));
        },
      },
      { id: 'foundry-docs', async act(t) { await openDoc(t, DOCS.azureCreate, 'Create a resource'); await t.at('f-deploy'); await landmark(t, 'Deploy a model'); } },
      {
        id: 'foundry-sam',
        async act(t) {
          await backToDialog(t, 'Microsoft Foundry');
          const p = t.source;
          await t.cut(async () => { await p.locator('form select').first().selectOption({ label: 'API Key' }); await t.wait(400); });
          await pastePlaceholder(t, p.locator('input[name="apiBase"]'), 'https://YOUR-RESOURCE.openai.azure.com/');
          await pastePlaceholder(t, p.locator('input[name="apiKey"]'), '...your-azure-key...', { reveal: true });
          await t.at('f-name');
          await typePlaceholder(t, p.getByPlaceholder('Type or select a deployment...'), 'YOUR-DEPLOYMENT-NAME');
          await t.wait(2500);
          await openGuide(t, 'providers/azure-openai/README.html', '5. Add it to SAM');
        },
      },
      {
        id: 'vertex',
        slide: { title: 'Google Vertex AI', sub: 'You need: a service account key, a project ID, and a region' },
        async act(t) {
          await backToDialog(t, 'Google Vertex AI');
          const p = t.source;
          await t.at('v-json');
          await pointLoc(t, p.locator('textarea[name="vertexCredentials"]'));
          await t.at('v-project');
          await pointLoc(t, p.locator('input[name="vertexProject"]'));
          await t.wait(600);
          await pointLoc(t, p.locator('input[name="vertexLocation"]'));
        },
      },
      { id: 'vertex-docs', async act(t) { await openDoc(t, DOCS.vertexStart, 'Set up required roles'); await t.at('v-keys'); await openDoc(t, DOCS.gcpKeys, 'Create a service account key'); } },
      {
        id: 'vertex-sam',
        async act(t) {
          await openDoc(t, DOCS.gcpKeys, 'Allow service account key creation');
          await t.at('v-paste');
          await backToDialog(t, 'Google Vertex AI');
          const p = t.source;
          await pointLoc(t, p.locator('textarea[name="vertexCredentials"]'));
          await typePlaceholder(t, p.locator('input[name="vertexProject"]'), 'YOUR_PROJECT_ID');
          await typePlaceholder(t, p.locator('input[name="vertexLocation"]'), 'global');
        },
      },
      {
        id: 'close',
        async act(t) { await openGuide(t, 'providers/google-vertex-ai/README.html'); await t.wait(1500); await landmark(t, 'Troubleshooting'); },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────── Video 3
  {
    id: 'ollama',
    youtube: 'G66imk_d6hQ',
    tagline: 'Run models on your own machine, from install to first chat',
    number: 3,
    title: 'Local models with Ollama',
    stage: 'SAM unconfigured (tools/stage.sh reset-sam); demo terminal fresh (tools/stage.sh reset-term); Ollama running with llama3.2 pulled. Ends CONFIGURED: reset-sam before any other video.',
    script: `{open}To run models on your own machine, with no API key and nothing sent to a cloud, use Ollama. Agent Mesh talks to it directly. This one we do from start to finish, including a first chat.

{pull}Install Ollama from ollama dot com, then pull a model. We use Llama 3.2, which fits on a laptop. Pick a model that supports tool calling, because Agent Mesh agents use tools; Ollama's library marks those models. The models available keep changing, so check the library for current ones.

{reach}Ollama listens on port eleven four three four. What matters is that Agent Mesh can reach that address. On the same machine, localhost works. In Docker, use host dot docker dot internal. In a GitHub Codespace your laptop is not reachable, so use another provider there.

{connect}In Agent Mesh, choose Ollama. {c-auth}Set Authentication Type to None, because a local Ollama has no key, {c-url}and enter the address. {c-list}Open the model list: these are the models on this machine, read straight from Ollama. {c-pick}Pick Llama 3.2 and choose Set Up Default Models.

{chat}Now ask something. The orchestrator answers, and every token came from this machine. {c-models}Both built-in models now point at Ollama.

{close}The Ollama guide in the description covers the network cases and the common errors.`,
    async setup(t) {
      await t.cut(() => freshDialog(t));
      await openDoc(t, DOCS.ollamaDownload, 'Download Ollama');
    },
    steps: [
      { id: 'open', async act(t) { await t.wait(2500); await landmark(t, 'Install', { settle: 1200 }); } },
      {
        id: 'pull',
        async act(t) {
          await t.cut(async () => {
            const p = t.tab('127.0.0.1:7681') ?? await t.ctx.newPage();
            // always a fresh load: a tab left from an earlier take is attached to a dead terminal
            if (p.url().startsWith(TERM)) await p.reload({ waitUntil: 'domcontentloaded' }); else await p.goto(TERM, { waitUntil: 'domcontentloaded' });
            await t.useSource(p);
            await t.wait(1500);
          });
          const { writeFileSync } = await import('node:fs');
          writeFileSync(DEMO_GO, 'go');
          await t.wait(9000);
        },
      },
      { id: 'reach', async act(t) { await openGuide(t, 'providers/ollama/README.html', 'Where is SAM running?'); } },
      {
        id: 'connect',
        async act(t) {
          await backToDialog(t);
          await t.cut(() => openProviders(t));
          const p = t.source;
          await pickProvider(t, 'Ollama', FAST);
          await t.at('c-auth');
          await chooseAuth(t, 'None');
          await t.at('c-url');
          await typePlaceholder(t, p.locator('input[name="apiBase"]'), 'http://localhost:11434');
          await t.at('c-list');
          await clickLoc(t, p.getByPlaceholder('Type or select a model...'), { beat: 500 });
          await p.locator('[data-slot="popover-content"] button').filter({ hasText: /llama3\.2/ }).first().waitFor({ timeout: 10000 });
          await t.at('c-pick');
          await clickLoc(t, p.locator('[data-slot="popover-content"] button').filter({ hasText: /llama3\.2/ }).first(), FAST);
          await t.wait(600);
          await clickLoc(t, dialog(p).getByRole('button', { name: 'Set Up Default Models' }), FAST);
          await dialog(p).waitFor({ state: 'hidden', timeout: 15000 });
        },
      },
      {
        id: 'chat',
        async act(t) {
          const p = t.source;
          await clickLoc(t, p.locator('[contenteditable="true"]').first(), { ring: false, ...FAST });
          await t.type('In one sentence, what is an event broker?', { delay: 18 });
          await clickLoc(t, p.locator('button[type="submit"], [aria-label*="Send message" i]').first(), FAST);
          await t.cut(async () => {
            // wait for the answer to finish streaming
            const deadline = Date.now() + 180000;
            let last = '';
            let same = 0;
            while (Date.now() < deadline && same < 4) {
              await t.wait(1000);
              const txt = (await ask(p, () => document.querySelector('main')?.innerText ?? '')) ?? '';
              same = txt === last && txt.includes('event broker') ? same + 1 : 0;
              last = txt;
            }
          });
          await t.at('c-models');
          await modelsPage(t);
        },
      },
      { id: 'close', async act(t) { await openGuide(t, 'providers/ollama/README.html', 'Troubleshooting'); } },
    ],
  },

  // ─────────────────────────────────────────────────────────────── Video 4
  {
    id: 'custom-provider',
    youtube: 'cj9DlIAHXi0',
    tagline: 'Any hosted or self-hosted server that speaks the OpenAI API',
    slideKicker: 'Part',
    number: 4,
    title: 'Any OpenAI-compatible provider: Custom',
    stage: 'SAM unconfigured (tools/stage.sh reset-sam). Ollama running with llama3.2 (for the live Test Connection).',
    script: `{open}Many providers, and most self-hosted model servers, speak the same API as OpenAI. They do not need their own entry in Agent Mesh: for all of them, choose Custom.

{three}Custom needs three things: the provider's {t-url}API base URL, {t-key}a key, and {t-model}a model name. Agent Mesh adds the version part of the address for you, so a base URL with or without slash v one both work.

{hosted}Our Custom guide lists many hosted providers with their base URLs and where to get a key, {h-docs}each linked to that provider's documentation. Terms differ: some offer free tiers, some need prepaid credit, and model names change often, so check each provider's model list.

{self}The same applies to servers you run yourself, such as a LiteLLM proxy, vLLM, or LM Studio. Use their address, and if the server has no key, set Authentication Type to None.

{test}Here is the whole path working against a local OpenAI-compatible server. {t-list}The model list fills in, {t-run}and Test Connection succeeds. That test sends a short chat that includes a tool, so it also checks that the model can call tools. If it fails while the provider works elsewhere, choose a model that supports tools.

{close}The Custom guide in the description has the full tables and the common errors.`,
    async setup(t) { await t.cut(async () => { await freshDialog(t); await openProviders(t); }); },
    steps: [
      { id: 'open', async act(t) { await t.wait(1500); await pointLoc(t, providerOption(t.source, 'Custom')); } },
      {
        id: 'three',
        async act(t) {
          await pickProvider(t, 'Custom', FAST);
          const p = t.source;
          await t.cut(async () => { await p.locator('form select').first().selectOption({ label: 'API Key' }); await t.wait(400); });
          await t.at('t-url');
          await pointLoc(t, p.locator('input[name="apiBase"]'));
          await t.at('t-key');
          await pastePlaceholder(t, p.locator('input[name="apiKey"]'), 'sk-...your-key...', { reveal: true });
          await t.at('t-model');
          await pointLoc(t, p.getByPlaceholder('Type or select a model...'));
        },
      },
      {
        id: 'hosted',
        slide: { title: 'Hosted providers', sub: 'A base URL, a key, and a model name' },
        async act(t) {
          await openGuide(t, 'providers/custom/README.html', 'Hosted providers');
          await t.at('h-docs');
          await openDoc(t, DOCS.cerebras, 'Quickstart');
          await t.wait(3500);
          await openDoc(t, DOCS.deepseek, 'Your First API Call');
        },
      },
      { id: 'self',
        slide: { title: 'Self-hosted servers', sub: 'LiteLLM, vLLM, LM Studio, and others' }, async act(t) { await openGuide(t, 'providers/custom/README.html', 'Self-hosted servers'); } },
      {
        id: 'test',
        slide: { title: 'See it work', sub: 'Test Connection against a local server' },
        async act(t) {
          const p = await (async () => { let q; await t.cut(async () => {
            q = await samPage(t);
            await q.goto(`${SAM}/#/models`, { waitUntil: 'domcontentloaded' });
            await q.getByRole('button', { name: /Add Model/i }).first().waitFor({ timeout: 15000 });
            await t.wait(1200);
            if (await dialog(q).isVisible().catch(() => false)) await dialog(q).getByRole('button', { name: 'Cancel' }).click();
            await dialog(q).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
            await q.getByRole('button', { name: /Add Model/i }).first().click();
            await q.getByTestId('modelProviderSelect').waitFor({ timeout: 10000 });
            await q.locator('input[name="displayName"], input[name="name"]').first().fill('local-openai-compatible').catch(() => {});
            await q.locator('textarea').first().fill('Local OpenAI-compatible server (Custom provider)').catch(() => {});
            await q.getByTestId('modelProviderSelect').click();
            await providerOption(q, 'Custom').click();
            await q.locator('form select').first().selectOption({ label: 'None' });
            await q.locator('input[name="apiBase"]').fill('http://localhost:11434/v1');
            await t.wait(600);
            await q.locator('input[name="apiBase"]').scrollIntoViewIfNeeded();
          }); return q; })();
          await t.at('t-list');
          await clickLoc(t, p.getByPlaceholder('Type or select a model...'), FAST);
          await p.locator('[data-slot="popover-content"] button').filter({ hasText: /llama3\.2/ }).first().waitFor({ timeout: 10000 });
          await t.wait(350);
          await clickLoc(t, p.locator('[data-slot="popover-content"] button').filter({ hasText: /llama3\.2/ }).first(), FAST);
          await t.at('t-run');
          await clickLoc(t, p.getByRole('button', { name: /Test Connection/i }).first());
          await t.cut(async () => { await p.getByText('Connection test successful').waitFor({ timeout: 60000 }); });
          await t.wait(500);
          await pointLoc(t, p.getByText('Connection test successful'));
        },
      },
      {
        id: 'close',
        async act(t) {
          await t.cut(async () => { await t.source.getByRole('button', { name: 'Cancel' }).first().click().catch(() => {}); });
          await openGuide(t, 'providers/custom/README.html', 'Troubleshooting');
        },
      },
    ],
  },
];
