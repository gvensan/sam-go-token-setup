# Video 3: Local models with Ollama

Length 1:26. Watch on [YouTube](https://www.youtube.com/watch?v=G66imk_d6hQ&list=PLD2bQ9LWYU9M).

Guides for this video: [Ollama](../../providers/ollama/README.md).

## Transcript

**[0:00] Title card:** Connect an LLM to Solace Agent Mesh, Video 3: Local models with Ollama. Run models on your own machine, from install to first chat.

[0:05] To run models on your own machine, with no API key and nothing sent to a cloud, use Ollama. Agent Mesh talks to it directly. This one we do from start to finish, including a first chat.

[0:16] Install Ollama from ollama dot com, then pull a model. We use Llama 3.2, which fits on a laptop. Pick a model that supports tool calling, because Agent Mesh agents use tools; Ollama's library marks those models. The models available keep changing, so check the library for current ones.

[0:36] Ollama listens on port eleven four three four. What matters is that Agent Mesh can reach that address. On the same machine, localhost works. In Docker, use host dot docker dot internal. In a GitHub Codespace your laptop is not reachable, so use another provider there.

[0:54] In Agent Mesh, choose Ollama. Set Authentication Type to None, because a local Ollama has no key, and enter the address. Open the model list: these are the models on this machine, read straight from Ollama. Pick Llama 3.2 and choose Set Up Default Models.

[1:12] Now ask something. The orchestrator answers, and every token came from this machine. Both built-in models now point at Ollama.

[1:20] The Ollama guide in the description covers the network cases and the common errors.
