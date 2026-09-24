import { run } from "../core/Packages/run.js";
import { resolve } from "../core/Packages/resolve.js";
import { join } from "node:path";

export default function install(installDetails) {
  const mainPath = join(
    "src",
    "data",
    "Models",
    installDetails.provider,
    installDetails.target,
  );

  run("git", [
    "clone",
    installDetails.providerUrl + installDetails.target,
    mainPath,
  ]);
}

install(resolve("install hg@prism-ml/Ternary-Bonsai-2-27B-gguf"));
