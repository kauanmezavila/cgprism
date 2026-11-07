import fs from "node:fs";
import { resolveModelsPath } from "./paths.js";

export function listDirTarget(pathDetails) {
  const mainPath = resolveModelsPath(pathDetails.provider, pathDetails.target);

  const files = fs.readdirSync(mainPath);
  return files;
}

export function listDirOwner(pathDetails) {
  const mainPath = resolveModelsPath(pathDetails.provider, pathDetails.owner);

  const files = fs.readdirSync(mainPath);
  return files;
}

export function listDirProvider(pathDetails) {
  const mainPath = resolveModelsPath(pathDetails.provider);

  const files = fs.readdirSync(mainPath);
  return files;
}
