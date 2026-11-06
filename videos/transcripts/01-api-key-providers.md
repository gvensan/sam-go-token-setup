# Video 1: API-key providers: OpenAI, Anthropic, Google AI Studio

Length 2:41. Watch on [YouTube](https://www.youtube.com/watch?v=atnMfLbcSF4&list=PLD2bQ9LWYU9M).

Guides for this video: [OpenAI](../../providers/openai/README.md), [Anthropic](../../providers/anthropic/README.md), [Google AI Studio](../../providers/google-ai-studio/README.md).

## Transcript

**[0:00] Title card:** Connect an LLM to Solace Agent Mesh, Video 1: API-key providers: OpenAI, Anthropic, Google AI Studio. Create an API key, then add it in Agent Mesh.

[0:05] This video covers the three providers that need only an API key: OpenAI, Anthropic, and Google AI Studio. The provider steps you will see come from each provider's public documentation; consoles change often, so the guide links every step to its source.

[0:21] All three work the same way. Pick the provider, paste the key, and choose a model. The model list stays empty until the key is accepted, because Agent Mesh asks the provider which models your key can use. An empty list is your first hint that something is wrong with the key.

[0:37] Model names change often: new models arrive and older ones are retired. So pick from the list Agent Mesh shows you, rather than from any name in a video.

**[0:46] Slide: Provider 1 of 3, OpenAI.** You need: an API key.

[0:50] For OpenAI, sign in to the platform and open the API keys page. Choose Create new secret key, name it, and set an expiry if you are offered one. Copy the key straight away: OpenAI shows it only once.

[1:03] Usage is paid from prepaid credits, with a limited free tier in some countries.

[1:08] In Agent Mesh, choose OpenAI and paste your key. Our OpenAI guide has every step and the common errors.

**[1:15] Slide: Provider 2 of 3, Anthropic.** You need: an API key, scoped to a workspace.

[1:19] For Anthropic's Claude models, use the Claude Console. Under API keys, choose Create key, name it, and pick an expiry; it cannot be changed later. Scope the key to a workspace, because a key without one is rejected unless every request names a workspace.

[1:37] New accounts get a small amount of credit to try the API; after that, usage is prepaid.

[1:43] In Agent Mesh, choose Anthropic and paste your key. The Anthropic guide has the details.

**[1:48] Slide: Provider 3 of 3, Google AI Studio.** You need: an API key.

[1:52] For Google AI Studio, sign in with a Google account, open the API key page, and choose Create API key. If AI Studio offers to restrict the key, restrict it to the Gemini API.

[2:04] Several Gemini models have a free tier with rate limits. On the free tier, Google may use your prompts to improve its products, so keep confidential data off it; the paid tier does not.

[2:16] In Agent Mesh, choose Google AI Studio and paste your key. The guide has the details.

[2:22] With a real key, choose a model and then Set Up Default Models. That one step sets both built-in models, General and Planning; you can change either one later under System Settings, Models. The guides are linked in the description, and questions go to the Solace Agent Mesh community forum.
