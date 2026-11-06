# Video 0: Which model provider?

Length 2:27. Watch on [YouTube](https://www.youtube.com/watch?v=0TZFC9q_6lo&list=PLD2bQ9LWYU9M).

Guides for this video: [Pick your provider](../../README.md), [The SAM Models form](../../common/sam-model-form.md).

## Transcript

**[0:00] Title card:** Connect an LLM to Solace Agent Mesh, Video 0: Which model provider? What a model configuration is, General and Planning, and choosing a provider.

[0:05] Every agent in Solace Agent Mesh does its thinking with a large language model, and a new install has none connected yet. Agent Mesh tells you so right at the top.

[0:15] Models live under System Settings, Models. Each row here is a model configuration: which provider hosts the model, which model to call, and, behind it, the credentials to reach it. Agents refer to a configuration by its name, an alias, never by the provider or the key. So you can switch providers or models in one place, without touching any agent.

[0:37] Every deployment starts with two built-in configurations, marked Default. General is the model that new agents and the built-in AI features use. Planning is the model the Orchestrator agent uses to plan a task and delegate the work to other agents. On a new install, both are not configured, so nothing can use them yet. You can't delete them, but you can point either one at a different provider or model at any time. Add Model creates more configurations, for example a separate model for one agent.

[1:08] To connect both in one step, Agent Mesh opens this dialog the first time you visit it in a browser. It sets General and Planning to the same provider and model, and you can change each one later. If you close it, you can set them up from the Models page instead.

[1:22] The dialog asks for three things: a provider, a credential, and a model. Agent Mesh works with many providers, and there is no single right choice. It depends on what you already have.

[1:34] If you already have an API key from OpenAI, Anthropic, or Google AI Studio, use that provider. Video one covers all three.

[1:50] If your organization runs on Amazon Web Services, Microsoft Azure, or Google Cloud, you can serve models from that cloud through Amazon Bedrock, Microsoft Foundry, or Google Vertex AI. That is video two.

[2:02] If you want models to run on your own machine, with no key and nothing sent to a cloud, use Ollama, in video three.

[2:08] And for any other provider or server that speaks the OpenAI API, choose Custom, in video four.

[2:10] Some of these offer free tiers and some need billing from the start; the guide's table shows what each one needs, so you can decide before you sign up anywhere.

[2:18] Whichever you choose, the step in Agent Mesh is the same short form. Pick your video, and the matching guide is in the description.
