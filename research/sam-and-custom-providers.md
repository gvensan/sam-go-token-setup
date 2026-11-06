# Research: SAM model config + OpenAI-compatible providers

Collected 2026-11-06 from official docs (read-only). Working notes, not learner-facing.
Model IDs and free-tier terms change often; re-check before publishing.

## SAM docs (live)

- UI: https://docs.solace.com/Agent-Mesh/Framework/building/models/index.htm
- CLI: https://docs.solace.com/Agent-Mesh/Framework/building/models/cli.htm
- Configure (prefix table, Helm): https://docs.solace.com/Agent-Mesh/Framework/installing/configure.htm
- DEAD (404, do not link): solacelabs.github.io/solace-agent-mesh/...
- github.com/SolaceLabs/solace-agent-mesh: Desktop downloads + examples only.

## Builder > Models form (per official UI doc)

Two default aliases `general` and `planning` (cannot delete; "not configured" until set).
Add Model fields: Model Type (only if decision nodes enabled), Display Name, Description,
Model Provider, API Base URL, API Key (show toggle), Model Name (dropdown populates once
provider + key valid; free text allowed), Max Input Tokens, Pricing (USD per 1M in/out,
cache optional), Advanced Settings (Temperature, Max Tokens, Prompt Caching Strategy,
Custom Parameters), Test Connection, Add (or "Save Anyway" on failed test).
Custom and Ollama add Authentication Type: API Key / OAuth2 / None.

GAP: per-provider fields for Bedrock, Azure OpenAI, Vertex, AI Studio not documented.
Must inspect the live form.

## Declarative YAML (`kind: model`)

spec: provider, modelType, modelName, apiBase, authConfig, modelParams, maxInputTokens, pricing.
provider: anthropic, openai, azure_openai, bedrock, google_ai_studio, vertex_ai, ollama, custom, typesafe.
authConfig.type: apikey (api_key) | none | oauth2 (client_id, client_secret, token_url).
Keys as `${ANTHROPIC_API_KEY}`. `sam config schema show model` lists fields.

## Prefix convention (runtime `<provider>/<model>`)

| Prefix | Needs |
|---|---|
| openai/ | default; OpenAI-compatible also needs endpoint |
| anthropic/ | inferred if name has claude/anthropic |
| google/ | inferred if name has gemini |
| azure/ | endpoint, API version, deployments map |
| bedrock/ | IAM with bedrock:InvokeModel, access key, secret key, region |
| vertex/ | service account with aiplatform.user, project, region, ADC |
| ollama/ | endpoint e.g. http://localhost:11434 |
| huggingface, replicate, groq, mistral, cohere, xai, openrouter, perplexity, cerebras, nebius | API key; cerebras + nebius "not tested end-to-end" |

## Env vars

LLM_SERVICE_API_KEY, LLM_SERVICE_ENDPOINT, LLM_SERVICE_GENERAL_MODEL_NAME,
LLM_SERVICE_PLANNING_MODEL_NAME, LLM_SERVICE_MAX_TOKENS (32000). OAuth: LLM_SERVICE_OAUTH_*.
First-run wizard auto-detects OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY,
AZURE_OPENAI_API_KEY and writes LLM_SERVICE_API_KEY. Helm: llmService.*.

## Local findings

- Workshop repo (origin/sam-go): `.sam/settings.yaml` llm.provider openai, base_url
  https://lite-llm.mymaas.net/, default_model claude-sonnet-4-6, api_key placeholder
  `<INSER_API_KEY_HERE>` replaced by util/set_api_key.sh. `.env` still has RELATIVE
  SAM_DATA_DIR / SAM_VOLUME_ROOT.
- Local doc copies: `.claude/skills/sam-docs/references/documentation/building/models/`.

## OpenAI-compatible providers (SAM: Provider = Custom, Auth = API Key)

Verify (placeholders):
```bash
curl BASE/chat/completions \
  -H "Authorization: Bearer sk-...your-key..." \
  -H "Content-Type: application/json" \
  -d '{"model":"MODEL","messages":[{"role":"user","content":"Say hello"}]}'
```
Cheaper: `curl BASE/models -H "Authorization: Bearer sk-...your-key..."`.
UNVERIFIED: whether SAM Custom needs a typed `openai/` prefix and `/v1` suffix.
Live on 2.385.1: SAM adds `/v1` when missing. From the SAM developers (2026-11-10, release
after 2.385.1, not yet verified live): an API Base URL ending in `/chat/completions` is used
as the full chat URL, with no suffix added (unblocks Volcengine Ark, `/api/v3`). Open: what
the model-list call does with a full URL; Custom-only or all base-URL providers; exact version.

| Provider | Base URL | Key console | Example models | LiteLLM prefix | Free/card | Quirks |
|---|---|---|---|---|---|---|
| OpenRouter | https://openrouter.ai/api/v1 | https://openrouter.ai/keys | ~anthropic/claude-sonnet-latest; `:free` models | openrouter/ | `:free` 20 RPM, 50/day (1000/day after 10 credits) | negative balance blocks free models |
| Groq | https://api.groq.com/openai/v1 | https://console.groq.com/keys | llama-3.3-70b-versatile, openai/gpt-oss-120b | groq/ | free plan | logprobs/logit_bias/name 400; n=1 |
| Together AI | https://api.together.ai/v1 | https://api.together.ai/settings/projects/~current/api-keys | openai/gpt-oss-120b | together_ai/ | free register, credits unverified | OpenAI model names 404 |
| Fireworks | https://api.fireworks.ai/inference/v1 | https://app.fireworks.ai/settings/users/api-keys | accounts/fireworks/models/... | fireworks_ai/ | unverified | truncates max_tokens silently |
| Mistral | https://api.mistral.ai/v1 | https://console.mistral.ai/api-keys | mistral-small-latest, mistral-large-latest | mistral/ | plan + billing; free tier unverified | |
| DeepSeek | https://api.deepseek.com | https://platform.deepseek.com/api_keys | deepseek-flash, deepseek-v4-pro | deepseek/ | prepaid (unverified) | /v1 need unverified |
| xAI | https://api.x.ai/v1 | https://console.x.ai/team/default/api-keys | grok-4.7 | xai/ | credits needed | Responses API preferred; chat-completions unverified |
| Perplexity | https://api.perplexity.ai/orchestrator/v1 | https://console.perplexity.ai/project/keys | perplexity/kimi-k3 | perplexity/ | pay-as-you-go | Sonar chat-completions support ended 2026-09-27; tool calling undocumented; weak fit for agents |
| Cerebras | https://api.cerebras.ai/v1 | https://cloud.cerebras.ai | gpt-oss-120b | cerebras/ | free account | n=1; tools + response_format clash; SAM "not tested e2e" |
| LiteLLM proxy | http://localhost:4000 | /ui > Virtual Keys | config.yaml model_name | litellm_proxy/ | self-hosted | never hand out master key; host.docker.internal |
| vLLM | http://localhost:8000/v1 | `--api-key` / VLLM_API_KEY | served HF repo | hosted_vllm/ | free | tool calling needs server flags |
| LM Studio | http://localhost:1234/v1 | optional tokens in Developer > Server Settings | GET /v1/models | lm_studio/ | free | "Serve on Local Network" for containers; Auth None |

## Sources

OpenRouter https://openrouter.ai/docs/quickstart, https://openrouter.ai/docs/api-reference/limits ·
Groq https://console.groq.com/docs/openai, https://console.groq.com/docs/rate-limits ·
Together https://docs.together.ai/docs/openai-api-compatibility ·
Fireworks https://docs.fireworks.ai/tools-sdks/openai-compatibility ·
Mistral https://docs.mistral.ai/api, https://docs.mistral.ai/getting-started/quickstarts/studio/activate-and-generate-api-key ·
DeepSeek https://api-docs.deepseek.com/ · xAI https://docs.x.ai/docs/tutorial ·
Perplexity https://docs.perplexity.ai/getting-started/quickstart ·
Cerebras https://inference-docs.cerebras.ai/quickstart, https://inference-docs.cerebras.ai/resources/openai ·
LiteLLM https://docs.litellm.ai/docs/proxy/docker_quick_start, https://docs.litellm.ai/docs/providers/openai_compatible ·
vLLM https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/ ·
LM Studio https://lmstudio.ai/docs/developer/openai-compat, https://lmstudio.ai/docs/developer/core/authentication

## LIVE: SAM 2.385.1 field map (captured 2026-11-06, local `sam run --embedded`)

Models page lives under **System Settings > Models** (`#/models`) in 2.385.1; Giri's other
instance shows it under **Builder > Models**. First run shows a "Configure Your AI Models"
dialog that sets BOTH General and Planning in one step.

| Provider (UI label) | Authentication Type | Fields |
|---|---|---|
| Amazon Bedrock | AWS IAM (fixed) | AWS Access Key ID*, AWS Secret Access Key*, AWS Session Token, AWS Region*, Default Model* |
| Anthropic | API Key (fixed) | API Key*, Default Model* |
| Google AI Studio | API Key (fixed) | API Key*, Default Model* |
| Google Vertex AI | GCP Service Account (fixed) | Service Account JSON* (paste full JSON), GCP Project ID*, GCP Region*, Default Model* |
| Microsoft Foundry (was "Azure OpenAI" in older builds) | API Key / OAuth2 | API Base URL*, API Version, Deployment Name* |
| Ollama | API Key / None | API Base URL*, Default Model* |
| OpenAI | API Key (fixed) | API Key*, Default Model* |
| Custom | API Key / OAuth2 / None | API Base URL*, Default Model* |

Model dropdown is populated live from the provider once auth is valid (Ollama listed the
pulled models). Add Model form adds Model Type (Chat (LLM) / Decision, EARLY ACCESS),
Display Name*, Description*. Bedrock in SAM = IAM access keys, NOT Bedrock API keys.
Ollama E2E verified: wizard -> General+Planning = llama3.2 -> Orchestrator chat answered.
