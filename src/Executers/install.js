import t from "../core/Packages/colors.js";

import { run } from "../core/Packages/run.js";
import { getModelDefaults } from "../core/Packages/modelDefaults.js";
import { resolveModelName } from "../core/Packages/nameResolver.js";
import { getSize } from "../core/Packages/size.js";
import { ask } from "../core/Packages/ask.js";
import { detectLFS, pullLFS } from "../core/Packages/glfDetecter.js";

import { join, extname, relative } from "node:path";
import { access, readdir } from "node:fs/promises";

import { addModel, dbInit } from "../core/ModelsManager/registry.js";

const MODEL_EXTENSIONS = new Set([
  ".gguf",
  ".ggml",
  ".safetensors",
  ".bin",
  ".onnx",
  ".pt",
  ".pth",
]);

async function scanModels(directory) {
  const models = [];

  async function scan(currentPath) {
    const entries = await readdir(currentPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await scan(fullPath);
        continue;
      }

      const extension = extname(entry.name).toLowerCase();

      if (MODEL_EXTENSIONS.has(extension)) {
        models.push(fullPath);
      }
    }
  }

  await scan(directory);

  return models;
}

async function promptModel(installDetails, modelPath, hasLFS) {
  const size = await getSize(modelPath);

  const filename = modelPath.split(/[\\/]/).pop();
  const modelDefaults = await getModelDefaults(
    installDetails.provider,
    installDetails.providerUrl,
    installDetails.target,
    filename,
  );
  const defaults = modelDefaults || resolveModelName(filename);

  console.log(`\n${t.gradient("Model detected")}: ${filename}`);

  const model = {
    name: await ask("Name", defaults.name),
    family: await ask("Family", defaults.family || ""),
    architecture: await ask("Architecture", defaults.architecture || ""),

    provider: await ask("Provider", installDetails.provider),

    owner: await ask("Owner", installDetails.owner),

    version: await ask("Version", defaults.version || ""),

    path: modelPath,

    format: await ask(
      "Format",
      extname(filename).replace(".", "").toUpperCase(),
    ),

    size_bytes: size.total,

    parameters: await ask("Params", defaults.parameterSize || ""),

    quantization: await ask("Quantization", defaults.quantization || ""),

    runtime: await ask("Runtime", ""),
    context_length:
      Number(
        await ask("Context length", String(defaults.contextLength || "")),
      ) || null,
    capabilities: await ask(
      "Capabilities",
      defaults.capabilities || defaults.variant?.join(", ") || "",
    ),
    gls: installDetails.gls || hasLFS ? 0 : 1,
    ollama_model_id: null,
  };

  return model;
}

export default async function install(installDetails) {
  let mainPath;

  try {
    mainPath = join(
      "src",
      "data",
      "Models",
      installDetails.provider,
      installDetails.target,
    );
  } catch {
    console.error(t.red("Hm, cant resolve the main path!"));

    return;
  }

  console.log(
    `Getting ready to download ${t.italic(t.gradient(installDetails.model))}`,
  );

  try {
    if (!installDetails.providerUrl || !installDetails.target) {
      throw new Error("Invalid provider or model repository");
    }

    try {
      await access(join(mainPath, ".git"));
      console.log(`\n${t.green("OK")} using existing repository.`);
    } catch {
      await run("git", [
        "clone",
        installDetails.providerUrl + installDetails.target,
        mainPath,
      ]);
      console.log(`\n${t.green("OK")} repository cloned.`);
    }

    console.log(`${t.cyan("Checking Git LFS...")}`);

    const hasLFS = await detectLFS(mainPath);

    if (installDetails.gls) {
      if (hasLFS) {
        console.log(
          `${t.yellow("Git LFS detected. Downloading model files...")}`,
        );

        await pullLFS(mainPath);

        console.log(`${t.green("OK")} Git LFS files downloaded.`);
      } else {
        console.log(`${t.green("No Git LFS files detected.")}`);
      }
    }

    console.log(`${t.cyan("Scanning repository...")}`);

    const models = await scanModels(mainPath);

    if (models.length === 0) {
      console.log(t.red("Strange > No supported model files found."));

      return;
    }

    console.log(`\n${t.green("Found!")} ${models.length} model(s):\n`);

    models.forEach((modelPath, index) => {
      console.log(`  ${index + 1}. ${relative(mainPath, modelPath)}`);
    });

    dbInit();

    for (const modelPath of models) {
      const model = await promptModel(installDetails, modelPath, hasLFS);

      addModel(model);

      console.log(
        `${t.green("OK")} Model registered: ${t.italic(t.gradient(model.name))}`,
      );
    }

    console.log(`\n${t.green("Installation complete.")}`);
  } catch (error) {
    console.error(t.red(`Brutal > ${error.message}`));
  }
}
