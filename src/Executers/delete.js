import { rm } from "node:fs/promises";
import { resolve } from "../core/Packages/resolve.js";
import { join } from "node:path";

export async function uninstallModel(pathDetails) {
  const mainPath = join(
    "src",
    "data",
    "Models",
    pathDetails.provider,
    pathDetails.target,
  );

  await rm(mainPath, {
    recursive: true,
    force: true,
  });
}

export async function uninstallOwner(pathDetails) {
  const mainPath = join(
    "src",
    "data",
    "Models",
    pathDetails.provider,
    pathDetails.owner,
  );

  await rm(mainPath, {
    recursive: true,
    force: true,
  });
}

export async function uninstallProvider(pathDetails) {
  const mainPath = join("src", "data", "Models", pathDetails.provider);

  await rm(mainPath, {
    recursive: true,
    force: true,
  });
}

uninstallModel(resolve("uninstall hg@prism-ml/Ternary-Bonsai-2-27B-gguf"));
