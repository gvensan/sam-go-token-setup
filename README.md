# Connect an LLM to Solace Agent Mesh

Step-by-step guides for getting an API key (or other credential) from each
model provider that Solace Agent Mesh (SAM) supports, and adding it in
**System Settings > Models** (Builder > Models in some versions).

> Provider-side steps come from each provider's official documentation and are
> linked at every step. Most were not live-verified by us; each page says so and
> shows when it was last checked. SAM-side steps were captured live.

## What you are setting up

A *model configuration* tells SAM which provider hosts a model, which model to
call, and the credentials to reach it. Agents refer to a configuration by name,
never by provider or key, so you can switch providers in one place. Every SAM
starts with two built-in configurations:

- **General**: the model new agents and built-in AI features use.
- **Planning**: the model the Orchestrator agent uses to plan and delegate work.

Both show as *not configured* until you connect them. The first-run
**Configure Your AI Models** dialog sets both in one step with the provider you
pick below. Details: [the SAM Models form](common/sam-model-form.md).

## Pick your provider

| Provider | You need | Cost to start | Guide |
|---|---|---|---|
| OpenAI | API key | Limited free tier; credits for real use | [OpenAI](providers/openai/README.md) |
| Anthropic | API key | Small free credits; then prepaid | [Anthropic](providers/anthropic/README.md) |
| Google AI Studio | API key | Free tier | [Google AI Studio](providers/google-ai-studio/README.md) |
| Amazon Bedrock | AWS access key + secret + Region | AWS account with billing | [Amazon Bedrock](providers/amazon-bedrock/README.md) |
| Microsoft Foundry (Azure OpenAI) | Endpoint + key + deployment name | Azure subscription | [Azure OpenAI / Foundry](providers/azure-openai/README.md) |
| Google Vertex AI | Service account + project + region | Google Cloud billing | [Google Vertex AI](providers/google-vertex-ai/README.md) |
| Ollama | Nothing (local) | Free | [Ollama](providers/ollama/README.md) |
| Custom (OpenAI-compatible) | Base URL + key + model name | Varies | [Custom providers](providers/custom/README.md) |

Not sure? Start from what you already have: an existing API key, your
organization's cloud (Bedrock, Foundry, Vertex AI), a machine to run models
locally (Ollama), or another OpenAI-compatible provider (Custom). The
"Cost to start" column shows which need billing up front.

> Model names change often as providers release new models and retire old
> ones. Each guide gives examples; always pick from the list SAM shows and
> check the provider's model page.

## Then add it to SAM

[The SAM Models form, explained](common/sam-model-form.md)

## Videos

Five short narrated walkthroughs, also available as a
[YouTube playlist](https://www.youtube.com/playlist?list=PLD2bQ9LWYU9M). Start with
Video 0 if you are new to SAM models.

| Video | About |
|---|---|
| [![Video 0: Which model provider?](https://img.youtube.com/vi/0TZFC9q_6lo/mqdefault.jpg)](https://www.youtube.com/watch?v=0TZFC9q_6lo&list=PLD2bQ9LWYU9M) | **[Video 0: Which model provider?](https://www.youtube.com/watch?v=0TZFC9q_6lo&list=PLD2bQ9LWYU9M)** (2:27)<br>Start here. What a model configuration is, the built-in General and Planning models, where Models lives in the UI, and how to choose a provider.<br>[Transcript](videos/transcripts/00-which-provider.md) |
| [![Video 1: API-key providers: OpenAI, Anthropic, Google AI Studio](https://img.youtube.com/vi/atnMfLbcSF4/mqdefault.jpg)](https://www.youtube.com/watch?v=atnMfLbcSF4&list=PLD2bQ9LWYU9M) | **[Video 1: API-key providers: OpenAI, Anthropic, Google AI Studio](https://www.youtube.com/watch?v=atnMfLbcSF4&list=PLD2bQ9LWYU9M)** (2:41)<br>Create an API key with each provider, then add it in Agent Mesh.<br>[Transcript](videos/transcripts/01-api-key-providers.md) |
| [![Video 2: Cloud platforms: Amazon Bedrock, Microsoft Foundry, Google Vertex AI](https://img.youtube.com/vi/0aBb9YDBepI/mqdefault.jpg)](https://www.youtube.com/watch?v=0aBb9YDBepI&list=PLD2bQ9LWYU9M) | **[Video 2: Cloud platforms: Amazon Bedrock, Microsoft Foundry, Google Vertex AI](https://www.youtube.com/watch?v=0aBb9YDBepI&list=PLD2bQ9LWYU9M)** (3:15)<br>Serve models from your organization's cloud account, and the one detail per cloud that trips people up.<br>[Transcript](videos/transcripts/02-cloud-providers.md) |
| [![Video 3: Local models with Ollama](https://img.youtube.com/vi/G66imk_d6hQ/mqdefault.jpg)](https://www.youtube.com/watch?v=G66imk_d6hQ&list=PLD2bQ9LWYU9M) | **[Video 3: Local models with Ollama](https://www.youtube.com/watch?v=G66imk_d6hQ&list=PLD2bQ9LWYU9M)** (1:26)<br>Run models on your own machine with no API key: install, pull a model, connect, first chat.<br>[Transcript](videos/transcripts/03-ollama.md) |
| [![Video 4: Any OpenAI-compatible provider: Custom](https://img.youtube.com/vi/cj9DlIAHXi0/mqdefault.jpg)](https://www.youtube.com/watch?v=cj9DlIAHXi0&list=PLD2bQ9LWYU9M) | **[Video 4: Any OpenAI-compatible provider: Custom](https://www.youtube.com/watch?v=cj9DlIAHXi0&list=PLD2bQ9LWYU9M)** (1:34)<br>Hosted and self-hosted servers that speak the OpenAI API, with a live Test Connection.<br>[Transcript](videos/transcripts/04-custom-provider.md) |

## Help

Ask on the [Solace Agent Mesh community forum](https://community.solace.com/c/solace-agent-mesh/16).
