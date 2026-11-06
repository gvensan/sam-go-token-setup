# Research: the 7 native SAM providers (official docs only)

Collected 2026-11-06. Working notes, not learner-facing. Model IDs change often.

## Big changes vs older guides

- Doc URL moves: platform.openai.com/docs -> developers.openai.com/api/docs; docs.claude.com ->
  platform.claude.com/docs; ai.google.dev/gemini-api/docs -> aistudio.google.com/docs;
  cloud.google.com/vertex-ai -> docs.cloud.google.com.
- Vertex AI renamed "Gemini Enterprise Agent Platform" (Agent Platform API, role Agent Platform
  User = roles/aiplatform.user, env GOOGLE_GENAI_USE_ENTERPRISE=True).
- Azure OpenAI now under "Microsoft Foundry" (classic + new portal). v1 route /openai/v1/ needs no api-version.
- Bedrock: no "Model access" page in commercial Regions (enabled on first use); Anthropic models
  still need one-time First Time Use form. Bedrock now issues API keys (bearer tokens).

## 1. Amazon Bedrock

- Creds: Bedrock API key (AWS_BEARER_TOKEN_BEDROCK), short-term (<=12h) or long-term (IAM user
  behind it, "exploration only"); or IAM roles/keys.
- Prereqs: AWS account with payment method; IAM perms for Bedrock + aws-marketplace:Subscribe etc. on first third-party model use.
- Steps: console.aws.amazon.com/bedrock -> pick Region FIRST -> API keys -> Long-term API keys tab ->
  Generate long-term API keys -> expiration -> Generate -> copy. Short-term:
  https://console.aws.amazon.com/bedrock/home#/api-keys/short-term/create.
  Anthropic FTU: https://console.aws.amazon.com/bedrock/home#/providers/anthropic (website URL; GitHub profile OK).
- CLI: iam create-user; attach AmazonBedrockLimitedAccess; iam create-service-specific-credential
  --service-name bedrock.amazonaws.com --credential-age-days 30 (key = ServiceApiKeyValue).
- Docs: https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html ,
  https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html ,
  https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html ,
  https://docs.aws.amazon.com/bedrock/latest/userguide/bedrock-mantle.html ,
  pricing https://aws.amazon.com/bedrock/pricing/
- Endpoints: https://bedrock-runtime.<region>.amazonaws.com ; OpenAI-compat .../openai/v1 ;
  Mantle https://bedrock-mantle.<region>.api.aws/v1 ; Anthropic .../anthropic
- Models: us.anthropic.claude-sonnet-4-6, global.anthropic.claude-opus-5, us.openai.gpt-5.6-sol,
  openai.gpt-oss-120b (Mantle). OpenAI GPT on runtime needs inference profile (us./global.).
- Verify: POST .../model/us.anthropic.claude-sonnet-4-6/converse with Authorization: Bearer.
- Gotchas: key Region-locked ("Credential should be scoped to a valid region"); first-use
  Marketplace subscription up to 15 min (AccessDeniedException); FTU pending; boto3 >= 1.39.0;
  no /models on runtime. Free credits coverage of Bedrock unverified.

## 2. Anthropic

- Creds: API key sk-ant-api..., ANTHROPIC_API_KEY. Personal / service account / workspace (legacy).
- Prereqs: Claude Console account; small free credits for new users; buy credits at
  https://platform.claude.com/settings/billing.
- Steps: https://platform.claude.com/ -> https://platform.claude.com/settings/keys -> Create key ->
  name + expiration (3h/1d/7d/30d/custom/Never; cannot change later) -> Linked account -> scope to workspace.
- Docs: https://platform.claude.com/docs/en/get-started ,
  https://platform.claude.com/docs/en/manage-claude/authentication ,
  https://platform.claude.com/docs/en/models/overview ,
  https://platform.claude.com/docs/en/about-claude/pricing ,
  https://platform.claude.com/docs/en/api/rate-limits
- Endpoint: https://api.anthropic.com/v1/messages, headers x-api-key + anthropic-version: 2026-10-21.
  OpenAI-compat https://api.anthropic.com/v1/ (not production-ready per docs).
- Models: claude-opus-5-5, claude-sonnet-5-5, claude-haiku-5-5, claude-fable-5-1.
- Gotchas: unscoped key needs anthropic-workspace-id header (400); expired keys 401 permanent;
  spend cap 429 enforced_spend_limit_reached.

## 3. Azure OpenAI (Microsoft Foundry)

- Creds: Endpoint + KEY1/KEY2 + deployment name (+ api-version only on legacy routes). Entra ID for prod.
- Prereqs: Azure subscription (https://azure.microsoft.com/pricing/purchase-options/azure-account),
  role to create resources, model quota in Region.
- Classic steps: portal Create a resource -> Azure OpenAI -> Create -> Basics (Subscription,
  Resource group, Region, Name, Pricing Tier Standard) -> Network All networks -> Review + submit ->
  Create -> Go to resource. ai.azure.com (New Foundry toggle off) -> resource -> Deployments ->
  + Deploy model -> Deploy base model -> Deployment name + type -> Deploy. Portal resource ->
  Resource Management -> Keys and Endpoint.
- CLI: az cognitiveservices account keys list --name <res> --resource-group <rg>
- Docs: https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/create-resource ,
  https://learn.microsoft.com/en-us/azure/foundry/tutorials/quickstart-create-foundry-resources ,
  https://learn.microsoft.com/en-us/azure/ai-foundry/openai/api-version-lifecycle ,
  https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/endpoints ,
  pricing https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/
- Endpoint: https://<resource>.openai.azure.com/openai/v1/ ; model field = DEPLOYMENT NAME.
- Models: gpt-5.5, gpt-5.4, gpt-5.4-mini, gpt-5-mini, gpt-4.1, gpt-4o.
- Gotchas: deployment name vs model name; Region quota; free trial deploy unverified.

## 4. Google AI Studio (Gemini API)

- Creds: GEMINI_API_KEY (GOOGLE_API_KEY wins if both). New keys are "auth keys" since 2026-05-28.
- Prereqs: Google account. Free tier exists.
- Steps: https://aistudio.google.com/apikey -> Create API key -> copy. No project: Dashboard ->
  Projects -> Import projects. Permission error: Project Editor needed.
- Docs: https://aistudio.google.com/docs/api-key , https://aistudio.google.com/docs/openai ,
  https://aistudio.google.com/docs/models , https://aistudio.google.com/docs/pricing ,
  https://aistudio.google.com/docs/rate-limits
- OpenAI-compat base: https://generativelanguage.googleapis.com/v1beta/openai/
- Models: gemini-3.8-flash, gemini-3.6-flash, gemini-3.5-flash-lite; 2.5 deprecated (auto-route from 2026-12-01).
- Gotchas: free-tier content used to improve products; restrict key to Gemini API; dormant
  unrestricted keys blocked.

## 5. Google Vertex AI (Gemini Enterprise Agent Platform)

- Creds: ADC, service account JSON, or express-mode API key (@gmail.com only, 90-day trial).
- Prereqs: project with billing; enable Agent Platform API; roles/aiplatform.user. $300/90-day trial needs card.
- SA steps: Service accounts -> account -> Keys -> Add key -> Create new key -> JSON -> Create
  (cannot download again). Env: GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION=global,
  GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/key.json.
- Docs: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/quickstart ,
  https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/api-keys ,
  https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/openai ,
  https://docs.cloud.google.com/iam/docs/keys-create-delete ,
  https://docs.cloud.google.com/free/docs/free-cloud-features
- Endpoints: aiplatform.googleapis.com/v1/projects/{P}/locations/{L}/publishers/google/models/{M}:generateContent ;
  OpenAI-compat .../endpoints/openapi (OAuth token 1h, not static key; model google/gemini-3.5-flash).
- Gotchas: orgs since 2024-05-03 enforce iam.disableServiceAccountKeyCreation; 10 keys per SA; keep path absolute.

## 6. Ollama

- Local: no key (placeholder "ollama"). Cloud: key at https://ollama.com/settings/keys (OLLAMA_API_KEY).
- Steps: https://ollama.com/download -> ollama pull gemma4:e2b -> ollama run. Server http://localhost:11434.
- Docs: https://docs.ollama.com/quickstart , https://docs.ollama.com/api ,
  https://docs.ollama.com/api/openai-compatibility , https://docs.ollama.com/cloud , https://ollama.com/pricing
- Endpoints: local /api and /v1; cloud https://ollama.com/v1. Models gpt-oss:20b, llama3.2, gemma4:e2b, :cloud suffix.
- Gotcha (inference): in Codespaces localhost is the codespace, not the laptop.

## 7. OpenAI

- Creds: OPENAI_API_KEY, project-scoped (user or service account).
- Prereqs: account; Free tier ($100/mo usage limit, allowed geographies); Build tier after $5.
- Steps: https://platform.openai.com/settings/organization/api-keys -> + Create new secret key ->
  optional permissions + expiration -> copy (shown once).
- Docs: https://developers.openai.com/api/docs/quickstart ,
  https://developers.openai.com/api/docs/guides/api-keys , https://developers.openai.com/api/docs/models ,
  https://developers.openai.com/api/docs/pricing , https://developers.openai.com/api/docs/guides/rate-limits
- Endpoint https://api.openai.com/v1. Models gpt-6-astra, gpt-6.1-sol, gpt-6.1-terra, gpt-6-luna.
- Verify: curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"

## Unverified (carry into disclaimers)

OpenAI button wording (help page 403); Anthropic free-credit size; Azure new-portal key location
and trial deploy; Bedrock credit coverage; AI Studio free-tier limits; Vertex trial coverage;
Ollama Cloud free limits. SAM per-provider form fields: check the live UI.
