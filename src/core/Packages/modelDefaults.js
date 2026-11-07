import { resolveModelName } from "./nameResolver.js";

const modelInfoCache = new Map();

export async function getModelDefaults(
  provider,
  providerUrl,
  modelId,
  filename,
) {
  if (provider !== "hg" || provider !== "ms" || !providerUrl || !modelId)
    return null;

  const repoPath = modelId
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  const apiUrl = `${providerUrl.replace(/\/+$/, "")}/api/models/${repoPath}`;
  const cacheKey = `${provider}:${apiUrl}`;
  if (!modelInfoCache.has(cacheKey)) {
    modelInfoCache.set(
      cacheKey,
      fetch(apiUrl)
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null),
    );
  }

  try {
    const model = await modelInfoCache.get(cacheKey);
    if (!model) return null;

    const defaults = resolveModelName(filename);

    const config = model.config || {};
    const parameterCount = Object.values(
      model.safetensors?.parameters || {},
    ).reduce((total, count) => total + count, 0);

    return {
      ...defaults,
      family: config.model_type || defaults.family,
      architecture: config.architectures?.join(", ") || defaults.architecture,
      parameters: parameterCount
        ? parameterCount / 1_000_000_000
        : defaults.parameters,
      contextLength:
        config.max_position_embeddings ||
        config.max_sequence_length ||
        config.n_ctx ||
        defaults.contextLength,
      capabilities: model.pipeline_tag || "",
    };
  } catch {
    return null;
  }
}
