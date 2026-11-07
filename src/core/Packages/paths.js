import os from "node:os";
import path from "node:path";
import fs from "node:fs";

const configuredRoot = process.env.CGPRISM_HOME;
export const dataRoot = configuredRoot
  ? path.resolve(os.homedir(), configuredRoot)
  : path.join(os.homedir(), ".cgprism");
export const modelsRoot = path.join(dataRoot, "Models");
export const registryPath = path.join(dataRoot, "registry.db");
export const storageManagerRoot = path.join(dataRoot, "StorageManager");
export const storageDatabasePath = path.join(storageManagerRoot, "storage.db");

fs.mkdirSync(modelsRoot, { recursive: true });
fs.mkdirSync(storageManagerRoot, { recursive: true });

export function resolveModelsPath(...segments) {
  const target = path.resolve(modelsRoot, ...segments);
  const relative = path.relative(modelsRoot, target);
  if (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error("Model path must stay inside the CGPrism data directory.");
  }
  return target;
}

export function resolveModelPath(modelPath, relativeTo = process.cwd()) {
  if (!modelPath) return modelPath;
  if (modelPath === "~") return os.homedir();
  if (modelPath.startsWith(`~${path.sep}`) || modelPath.startsWith("~/")) {
    return path.resolve(os.homedir(), modelPath.slice(2));
  }
  return path.isAbsolute(modelPath)
    ? path.normalize(modelPath)
    : path.resolve(relativeTo, modelPath);
}
