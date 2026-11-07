import Database from "better-sqlite3";
import { normalizeParameters } from "./registry.js";

const db = new Database("src/data/registry.db");

async function deleteModelsBy(column, value) {
  return db
    .prepare(`DELETE FROM models WHERE ${column} = @value`)
    .run({ value });
}

export function deleteModelsProvider(provider) {
  return deleteModelsBy("provider", provider);
}

export async function deleteModelsName(name, owner) {
  return db
    .prepare(
      `
      DELETE FROM models
      WHERE name LIKE @name
        AND owner = @owner
    `,
    )
    .run({
      name: `${name}%`,
      owner,
    });
}

export async function deleteModelsSpecial(path, owner) {
  return db
    .prepare(
      `
      DELETE FROM models
      WHERE path LIKE @path
        AND owner = @owner
    `,
    )
    .run({
      path: `${path}%`,
      owner,
    });
}

export function deleteModelsOwner(owner) {
  return deleteModelsBy("owner", owner);
}

export function deleteModelsFormat(format) {
  return deleteModelsBy("format", format);
}

export function deleteModelsRuntime(runtime) {
  return deleteModelsBy("runtime", runtime);
}

export function deleteModelsStatus(status) {
  return deleteModelsBy("status", status);
}

export function deleteModelsParams(parameters) {
  return deleteModelsBy("parameters", normalizeParameters(parameters));
}

export function deleteModelsId(id) {
  return deleteModelsBy("id", id);
}

export function deleteModelsFamily(family) {
  return deleteModelsBy("family", family);
}

export function deleteModelsArchitecture(architecture) {
  return deleteModelsBy("architecture", architecture);
}

export function deleteModelsVersion(version) {
  return deleteModelsBy("version", version);
}

export function deleteModelsPath(path) {
  return deleteModelsBy("path", path);
}

export function deleteModelsSizeBytes(size_bytes) {
  return deleteModelsBy("size_bytes", size_bytes);
}

export function deleteModelsQuantization(quantization) {
  return deleteModelsBy("quantization", quantization);
}

export function deleteModelsContextLength(context_length) {
  return deleteModelsBy("context_length", context_length);
}

export function deleteModelsCapabilities(capabilities) {
  return deleteModelsBy("capabilities", capabilities);
}

export function deleteModelsCreatedAt(created_at) {
  return deleteModelsBy("created_at", created_at);
}

export function deleteModelsUpdatedAt(updated_at) {
  return deleteModelsBy("updated_at", updated_at);
}

export function deleteModelsGLS(gls) {
  return deleteModelsBy("gls", gls);
}

export function deleteModelsOllamaId(ollama_model_id) {
  return deleteModelsBy("ollama_model_id", ollama_model_id);
}
