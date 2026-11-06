import Database from "better-sqlite3";

const db = new Database("src/data/registry.db");

export function getModelsBy(column, value) {
  return db
    .prepare(`SELECT * FROM models WHERE ${column} = @value`)
    .all({ value });
}

export function getModels() {
  const stmt = db.prepare(`
    SELECT *
    FROM models
  `);

  return stmt.all();
}

export function getModelsProvider(provider) {
  return getModelsBy("provider", provider);
}

export function getModelsName(name) {
  return getModelsBy("name", name);
}

export function getModelsOwner(owner) {
  return getModelsBy("owner", owner);
}

export function getModelsFormat(format) {
  return getModelsBy("format", format);
}

export function getModelsRuntime(runtime) {
  return getModelsBy("runtime", runtime);
}

export function getModelsStatus(status) {
  return getModelsBy("status", status);
}

export function getModelsParams(parameters) {
  return getModelsBy("parameters", parameters);
}

export function getModelsId(id) {
  return getModelsBy("id", id);
}

export function getModelsFamily(family) {
  return getModelsBy("family", family);
}

export function getModelsArchitecture(architecture) {
  return getModelsBy("architecture", architecture);
}

export function getModelsVersion(version) {
  return getModelsBy("version", version);
}

export function getModelsPath(path) {
  return getModelsBy("path", path);
}

export function getModelsSizeBytes(size_bytes) {
  return getModelsBy("size_bytes", size_bytes);
}

export function getModelsQuantization(quantization) {
  return getModelsBy("quantization", quantization);
}

export function getModelsContextLength(context_length) {
  return getModelsBy("context_length", context_length);
}

export function getModelsCapabilities(capabilities) {
  return getModelsBy("capabilities", capabilities);
}

export function getModelsCreatedAt(created_at) {
  return getModelsBy("created_at", created_at);
}

export function getModelsUpdatedAt(updated_at) {
  return getModelsBy("updated_at", updated_at);
}

export function getModelsGLS(gls) {
  return getModelsBy("gls", gls);
}

export function getModelsOllamaId(ollama_model_id) {
  return getModelsBy("ollama_model_id", ollama_model_id);
}
