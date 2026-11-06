# Connect an LLM to SAM: narration script (v3, recorded)

Five standalone videos: a provider-agnostic opener plus one per provider type.
2026-11-06. v3 (recorded): Video 0 opens by explaining model configurations,
General and Planning, and where they live; Videos 1, 2 and 4 show a title slide
in a short silent gap before each provider or part (`slide` on the step in
providers.steps.mjs). Lengths in the headings below are the recorded ones. Same narrator and pipeline as the SAM Go workshop series
(ElevenLabs voice cjVigY5qzO86Huf0OWal, eleven_multilingual_v2; capture via the
recording Chrome on CDP :9223). Brackets say what is on screen; they are not
spoken. Durations are estimates at about 150 words a minute plus cuts; the
voice sets the real ones.

**Ground rules (v2, Giri's review 2026-11-06)**

- **Neutral, provider agnostic.** No provider is called best, easiest or
  recommended. Choices are framed by the viewer's situation (already have a
  key, want a free tier, want local, already on a cloud, other provider), and
  facts like free tiers are stated plainly, never as a pitch.
- **No accounts, no real keys.** Provider-side steps are shown on the
  provider's **public documentation pages**, scrolled to the relevant section,
  never on a signed-in console. Each provider beat also shows **our own guide
  page** in this repo. Each video says once that provider steps come from the
  provider's docs.
- **Typed placeholders.** Credential fields are filled on camera with obvious
  placeholders that can never pass for real secrets:
  `sk-...your-key...`, `sk-ant-...your-key...`, `...your-gemini-key...`,
  `AKIA...your-key-id...`, `...your-secret...`, `https://YOUR-RESOURCE.openai.azure.com/`,
  `YOUR-DEPLOYMENT-NAME`, `YOUR_PROJECT_ID`. The video never clicks Set Up or
  Save with a placeholder (that would fail); it cuts to the finished state
  shown on the Ollama instance or to the Models page.
- **Models change.** Each video says once, briefly, that model names change
  as new models arrive and older ones are retired, so viewers pick from the
  list Agent Mesh shows and check the provider's model page. Only Llama 3.2
  (the Ollama demo) is named on purpose.
- **SAM side is live** (local SAM 2.385.1, dark theme). Only Ollama and the
  Custom test run end to end.
- Pictures follow the words (workshop sync contract): navigation inside cuts,
  the named thing on screen within a second of its word.
- Style: instructional, second person, present tense, calm. No em-dashes.
  Say "READ ME", never "README".
- Each video ends on this repo's guide and the community forum.

---

## Video 0. Which model provider? (2:24)

### 0.1 Models in Agent Mesh (0:45)

[Local SAM, first-run dialog dismissed: New Chat with the "No default model" banner.]

Every agent in Solace Agent Mesh does its thinking with a large language
model, and a new install has none connected yet. Agent Mesh tells you so
right at the top.

[System Settings expands; Models; the columns pointed at as named.]

Models live under System Settings, Models. Each row here is a model
configuration: which provider hosts the model, which model to call, and,
behind it, the credentials to reach it. Agents refer to a configuration by
its name, an alias, never by the provider or the key. So you can switch
providers or models in one place, without touching any agent.

### 0.2 General and Planning (0:40)

[The General and Planning rows, Default badges, Not configured; Add Model.]

Every deployment starts with two built-in configurations, marked Default.
General is the model that new agents and the built-in AI features use.
Planning is the model the Orchestrator agent uses to plan a task and delegate
the work to other agents. On a new install, both are not configured, so
nothing can use them yet. You can't delete them, but you can point either one
at a different provider or model at any time. Add Model creates more
configurations, for example a separate model for one agent.

[Source: Agent Mesh docs, "Configuring Models > How Agent Mesh Uses Models", bundled with SAM 2.385.1.]

### 0.3 The setup dialog (0:30)

[Fresh browser: the Configure Your AI Models dialog over New Chat.]

To connect both in one step, Agent Mesh opens this dialog the first time you
visit it in a browser. It sets General and Planning to the same provider and
model, and you can change each one later. If you close it, you can set them up
from the Models page instead.

The dialog asks for three things: a provider, a credential, and a model.
Agent Mesh works with many providers, and there is no single right choice. It
depends on what you already have.

### 0.4 The choices (0:45)

[Open the Model Provider list; each group highlighted as it is named.]

If you already have an API key from OpenAI, Anthropic, or Google AI Studio,
use that provider. Video one covers all three.

If your organization runs on Amazon Web Services, Microsoft Azure, or Google
Cloud, you can serve models from that cloud through Amazon Bedrock, Microsoft
Foundry, or Google Vertex AI. That is video two.

If you want models to run on your own machine, with no key and nothing sent
to a cloud, use Ollama, in video three.

And for any other provider or server that speaks the OpenAI API, choose
Custom, in video four.

[This repo's READ ME: the Pick your provider table.]

Some of these offer free tiers and some need billing from the start; the
guide's table shows what each one needs, so you can decide before you sign up
anywhere.

### 0.5 Close (0:10)

Whichever you choose, the step in Agent Mesh is the same short form. Pick
your video, and the matching guide is in the description.

---

## Video 1. API-key providers: OpenAI, Anthropic, Google AI Studio (2:38)

### 1.1 Open (0:25)

[SAM dialog; provider list open, OpenAI, Anthropic and Google AI Studio
highlighted in turn.]

This video covers the three providers that need only an API key: OpenAI,
Anthropic, and Google AI Studio. The provider steps you will see come from
each provider's public documentation; consoles change often, so the guide
links every step to its source.

### 1.2 The pattern (0:35)

[Select OpenAI; the dialog shows Authentication Type API Key, API Key,
Default Model.]

All three work the same way. Pick the provider, paste the key, and choose a
model. The model list stays empty until the key is accepted, because Agent
Mesh asks the provider which models your key can use. An empty list is your
first hint that something is wrong with the key.

[Model list area highlighted.]

Model names change often: new models arrive and older ones are retired. So
pick from the list Agent Mesh shows you, rather than from any name in a video.

### 1.3 OpenAI (0:45)

[OpenAI docs: the API keys guide on developers.openai.com.]

For OpenAI, sign in to the platform and open the API keys page. Choose Create
new secret key, name it, and set an expiry if you are offered one. Copy the
key straight away: OpenAI shows it only once.

[OpenAI pricing page, briefly.]

Usage is paid from prepaid credits, with a limited free tier in some
countries.

[SAM: provider OpenAI; placeholder sk-...your-key... typed into API Key.
Then this repo's OpenAI guide page.]

In Agent Mesh, choose OpenAI and paste your key. Our OpenAI guide has every
step and the common errors.

### 1.4 Anthropic (0:45)

[Claude docs: the authentication page on platform.claude.com.]

For Anthropic's Claude models, use the Claude Console. Under API keys, choose
Create key, name it, and pick an expiry; it cannot be changed later. Scope
the key to a workspace, because a key without one is rejected unless every
request names a workspace.

[Claude pricing page, briefly.]

New accounts get a small amount of credit to try the API; after that, usage
is prepaid.

[SAM: provider Anthropic; placeholder sk-ant-...your-key... typed. Then this
repo's Anthropic guide page.]

In Agent Mesh, choose Anthropic and paste your key. The Anthropic guide has
the details.

### 1.5 Google AI Studio (0:45)

[AI Studio docs: the API key page.]

For Google AI Studio, sign in with a Google account, open the API key page,
and choose Create API key. If AI Studio offers to restrict the key, restrict
it to the Gemini API.

[AI Studio pricing page: free and paid tier columns.]

Several Gemini models have a free tier with rate limits. On the free tier,
Google may use your prompts to improve its products, so keep confidential
data off it; the paid tier does not.

[SAM: provider Google AI Studio; placeholder ...your-gemini-key... typed.
Then this repo's Google AI Studio guide page.]

In Agent Mesh, choose Google AI Studio and paste your key. The guide has the
details.

### 1.6 Finish and close (0:25)

[Cut to System Settings > Models on the configured instance: General and
Planning listed.]

With a real key, choose a model and then Set Up Default Models. That one step
sets both built-in models, General and Planning; you can change either one
later under System Settings, Models. The guides are linked in the
description, and questions go to the Solace Agent Mesh community forum.

---

## Video 2. Cloud platforms: Amazon Bedrock, Microsoft Foundry, Google Vertex AI (3:11)

### 2.1 Open (0:30)

[SAM dialog; provider list open, the three cloud providers highlighted in turn.]

If your organization runs on a cloud, you can serve Agent Mesh's models from
it: Amazon Bedrock, Microsoft Foundry, or Google Vertex AI. The credential
belongs to your cloud account, so there are a few more steps than with a
simple API key, and each cloud has one detail that trips people up. The cloud
steps come from each provider's public documentation, linked in the guides.

### 2.2 Amazon Bedrock (1:20)

[SAM: provider Amazon Bedrock; fields AWS Access Key ID, Secret Access Key,
Session Token, Region.]

Start with what Agent Mesh asks for. For Bedrock it is an AWS access key ID
and secret access key, an optional session token, and a Region. Bedrock also
offers newer API keys, but this form takes IAM access keys, so that is what
we create.

[AWS IAM docs: creating a user, then the access keys page.]

In the IAM console, create a user for Agent Mesh and attach the AWS managed
policy Amazon Bedrock Limited Access. Then, on that user's security
credentials tab, create an access key. Copy the secret now; AWS shows it once.

[Bedrock docs: model access page.]

Two Bedrock details. Models switch on the first time you call them, and for
third-party models that first call can take up to fifteen minutes. And
Anthropic's models on Bedrock need a one-time use case form first.

[SAM: placeholders AKIA...your-key-id... and ...your-secret... typed, Region
us-east-1 typed. Then this repo's Bedrock guide page.]

In Agent Mesh, paste both keys and enter your Region. The Region matters:
models not offered there do not appear in the list. The Bedrock guide has
each step.

### 2.3 Microsoft Foundry (1:10)

[SAM: provider Microsoft Foundry; fields API Base URL, API Version,
Deployment Name.]

Azure OpenAI now lives in Microsoft Foundry, and Agent Mesh labels it that
way; older versions of Agent Mesh still say Azure OpenAI. You need three
things: the resource endpoint, a key, and a deployment name.

[Microsoft Learn: create resource page, deploy-model section, Keys and Endpoint.]

In the Azure portal, create an Azure OpenAI resource. In the Foundry portal,
deploy a model and note the deployment's name. Then, under Keys and Endpoint,
copy the endpoint and Key 1.

[SAM: placeholders https://YOUR-RESOURCE.openai.azure.com/ and
YOUR-DEPLOYMENT-NAME typed; each highlighted as named. Then this repo's
Foundry guide page.]

Two details. Paste the endpoint exactly as shown, with nothing added after
it; Agent Mesh builds the rest of the address itself. And type your
deployment's name, not the model's name. They can differ, and mixing them up
is the most common Foundry error.

### 2.4 Google Vertex AI (1:00)

[SAM: provider Google Vertex AI; Service Account JSON, Project ID, Region.]

Google Vertex AI uses a service account. Agent Mesh asks for its JSON key,
pasted whole, your project ID, and a region.

[Google Cloud docs: quickstart, then the service account keys page.]

In a Google Cloud project with billing, enable the Agent Platform API, which
is what Google now calls Vertex AI. Create a service account with the Agent
Platform User role, and create a JSON key for it. The file downloads once.

[SAM: Project ID placeholder YOUR_PROJECT_ID, Region global typed; the JSON
box highlighted. Then this repo's Vertex guide page.]

One detail: many company Google Cloud organizations block service account
keys by policy. If yours does, ask your cloud admin. Otherwise paste the
whole file, add your project ID and region, and choose a model.

### 2.5 Close (0:15)

[System Settings > Models.]

Which models each cloud offers changes over time and by region, so check the
provider's model catalog and pick from the list Agent Mesh shows. The guides
are linked in the description.

---

## Video 3. Local models with Ollama, end to end (1:23)

### 3.1 Open (0:20)

[Ollama download page.]

To run models on your own machine, with no API key and nothing sent to a
cloud, use Ollama. Agent Mesh talks to it directly. This one we do from start
to finish, including a first chat.

### 3.2 Install and pull (0:30)

[Terminal: ollama pull llama3.2 (cut over the download), then ollama list.]

Install Ollama from ollama dot com, then pull a model. We use Llama 3.2,
which fits on a laptop. Pick a model that supports tool calling, because
Agent Mesh agents use tools; Ollama's library marks those models. The models
available keep changing, so check the library for current ones.

### 3.3 Where Agent Mesh can reach it (0:35)

[This repo's Ollama guide: the Where is SAM running? table.]

Ollama listens on port eleven four three four. What matters is that Agent
Mesh can reach that address. On the same machine, localhost works. In Docker,
use host dot docker dot internal. In a GitHub Codespace your laptop is not
reachable, so use another provider there.

### 3.4 Connect it (0:40)

[SAM dialog: Ollama selected, Authentication Type None, API Base URL typed,
the model list opening with the pulled models.]

In Agent Mesh, choose Ollama. Set Authentication Type to None, because a
local Ollama has no key, and enter the address. Open the model list: these
are the models on this machine, read straight from Ollama. Pick Llama 3.2 and
choose Set Up Default Models.

### 3.5 First chat (0:30)

[New chat: type the question, send; cut on the wait; the answer appears.
Then System Settings > Models: General and Planning on Ollama.]

Now ask something. The orchestrator answers, and every token came from this
machine. Both built-in models now point at Ollama.

### 3.6 Close (0:10)

The Ollama guide in the description covers the network cases and the common
errors.

---

## Video 4. Any OpenAI-compatible provider: Custom (1:31)

### 4.1 Open (0:25)

[SAM dialog: provider list; the Custom entry and its description highlighted.]

Many providers, and most self-hosted model servers, speak the same API as
OpenAI. They do not need their own entry in Agent Mesh: for all of them,
choose Custom.

### 4.2 The three things (0:35)

[SAM: Custom selected, Authentication Type API Key, placeholder
sk-...your-key... typed, API Base URL and Default Model highlighted.]

Custom needs three things: the provider's API base URL, a key, and a model
name. Agent Mesh adds the version part of the address for you, so a base URL
with or without slash v one both work.

### 4.3 Hosted providers (0:40)

[This repo's Custom guide: the hosted providers table; then two provider docs
pages briefly (alphabetical, for example Cerebras and DeepSeek), each scrolled
to its base URL.]

Our Custom guide lists many hosted providers with their base URLs and where
to get a key, each linked to that provider's documentation. Terms differ:
some offer free tiers, some need prepaid credit, and model names change often,
so check each provider's model list.

### 4.4 Self-hosted servers (0:30)

[Guide: the self-hosted table; LiteLLM, vLLM, LM Studio rows.]

The same applies to servers you run yourself, such as a LiteLLM proxy, vLLM,
or LM Studio. Use their address, and if the server has no key, set
Authentication Type to None.

### 4.5 Test Connection, live (0:30)

[Models > Add Model: Custom, None, http://localhost:11434/v1, model chosen,
Test Connection, success message.]

Here is the whole path working against a local OpenAI-compatible server. The
model list fills in, and Test Connection succeeds. That test sends a short
chat that includes a tool, so it also checks that the model can call tools.
If it fails while the provider works elsewhere, choose a model that supports
tools.

### 4.6 Close (0:10)

The Custom guide in the description has the full tables and the common errors.

---

## Review log

- v1 -> v2 (Giri, 2026-11-06): added Video 0 (neutral opener); typed
  placeholders on camera; vendor public docs on camera plus our own guide
  pages; one brief "models change" line per video; removed preference
  language ("quickest", "handy") so every provider is presented neutrally.
