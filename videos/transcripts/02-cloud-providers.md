# Video 2: Cloud platforms: Amazon Bedrock, Microsoft Foundry, Google Vertex AI

Length 3:15. Watch on [YouTube](https://www.youtube.com/watch?v=0aBb9YDBepI&list=PLD2bQ9LWYU9M).

Guides for this video: [Amazon Bedrock](../../providers/amazon-bedrock/README.md), [Microsoft Foundry (Azure OpenAI)](../../providers/azure-openai/README.md), [Google Vertex AI](../../providers/google-vertex-ai/README.md).

## Transcript

**[0:00] Title card:** Connect an LLM to Solace Agent Mesh, Video 2: Cloud platforms: Amazon Bedrock, Microsoft Foundry, Google Vertex AI. Serve models from your organization's cloud account.

[0:05] If your organization runs on a cloud, you can serve Agent Mesh's models from it: Amazon Bedrock, Microsoft Foundry, or Google Vertex AI. The credential belongs to your cloud account, so there are a few more steps than with a simple API key, and each cloud has one detail that trips people up. The cloud steps come from each provider's public documentation, linked in the guides.

**[0:29] Slide: Provider 1 of 3, Amazon Bedrock.** You need: an AWS access key, its secret, and a Region.

[0:33] Start with what Agent Mesh asks for. For Bedrock it is an AWS access key ID and secret access key, an optional session token, and a Region. Bedrock also offers newer API keys, but this form takes IAM access keys, so that is what we create.

[0:51] In the IAM console, create a user for Agent Mesh and attach the AWS managed policy Amazon Bedrock Limited Access. Then, on that user's security credentials tab, create an access key. Copy the secret now; AWS shows it once.

[1:08] Two Bedrock details. Models switch on the first time you call them, and for third-party models that first call can take up to fifteen minutes. And Anthropic's models on Bedrock need a one-time use case form first.

[1:23] In Agent Mesh, paste both keys and enter your Region. The Region matters: models not offered there do not appear in the list. The Bedrock guide has each step.

**[1:33] Slide: Provider 2 of 3, Microsoft Foundry.** You need: an endpoint, a key, and a deployment name.

[1:36] Azure OpenAI now lives in Microsoft Foundry, and Agent Mesh labels it that way; older versions of Agent Mesh still say Azure OpenAI. You need three things: the resource endpoint, a key, and a deployment name.

[1:51] In the Azure portal, create an Azure OpenAI resource. In the Foundry portal, deploy a model and note the deployment's name. Then, under Keys and Endpoint, copy the endpoint and Key 1.

[2:04] Two details. Paste the endpoint exactly as shown, with nothing added after it; Agent Mesh builds the rest of the address itself. And type your deployment's name, not the model's name. They can differ, and mixing them up is the most common Foundry error.

**[2:20] Slide: Provider 3 of 3, Google Vertex AI.** You need: a service account key, a project ID, and a region.

[2:24] Google Vertex AI uses a service account. Agent Mesh asks for its JSON key, pasted whole, your project ID, and a region.

[2:33] In a Google Cloud project with billing, enable the Agent Platform API, which is what Google now calls Vertex AI. Create a service account with the Agent Platform User role, and create a JSON key for it. The file downloads once.

[2:48] One detail: many company Google Cloud organizations block service account keys by policy. If yours does, ask your cloud admin. Otherwise paste the whole file, add your project ID and region, and choose a model.

[3:02] Which models each cloud offers changes over time and by region, so check the provider's model catalog and pick from the list Agent Mesh shows. The guides are linked in the description.
