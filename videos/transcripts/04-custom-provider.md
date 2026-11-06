# Video 4: Any OpenAI-compatible provider: Custom

Length 1:34. Watch on [YouTube](https://www.youtube.com/watch?v=cj9DlIAHXi0&list=PLD2bQ9LWYU9M).

Guides for this video: [Custom (OpenAI-compatible) providers](../../providers/custom/README.md).

## Transcript

**[0:00] Title card:** Connect an LLM to Solace Agent Mesh, Video 4: Any OpenAI-compatible provider: Custom. Any hosted or self-hosted server that speaks the OpenAI API.

[0:05] Many providers, and most self-hosted model servers, speak the same API as OpenAI. They do not need their own entry in Agent Mesh: for all of them, choose Custom.

[0:16] Custom needs three things: the provider's API base URL, a key, and a model name. Agent Mesh adds the version part of the address for you, so a base URL with or without slash v one both work.

**[0:30] Slide: Part 1 of 3, Hosted providers.** A base URL, a key, and a model name.

[0:33] Our Custom guide lists many hosted providers with their base URLs and where to get a key, each linked to that provider's documentation. Terms differ: some offer free tiers, some need prepaid credit, and model names change often, so check each provider's model list.

**[0:50] Slide: Part 2 of 3, Self-hosted servers.** LiteLLM, vLLM, LM Studio, and others.

[0:53] The same applies to servers you run yourself, such as a LiteLLM proxy, vLLM, or LM Studio. Use their address, and if the server has no key, set Authentication Type to None.

**[1:06] Slide: Part 3 of 3, See it work.** Test Connection against a local server.

[1:10] Here is the whole path working against a local OpenAI-compatible server. The model list fills in, and Test Connection succeeds. That test sends a short chat that includes a tool, so it also checks that the model can call tools. If it fails while the provider works elsewhere, choose a model that supports tools.

[1:28] The Custom guide in the description has the full tables and the common errors.
