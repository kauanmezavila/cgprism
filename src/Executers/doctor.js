import fs from "node:fs";

import t from "../core/Packages/colors.js";
import { run } from "../core/Packages/run.js";
import { getModels } from "../core/ModelsManager/get.js";
import { resolveModelPath } from "../core/Packages/paths.js";

async function checkDependencies() {
  let errors = 0;
  const failedOnes = [];

  const dependenciesCmds = {
    node: ["node", ["--version"]],
    nvm: ["nvm", ["--version"]],
    git: ["git", ["--version"]],
    "git-lfs": ["git", ["lfs", "version"]],
    npm: ["npm", ["--version"]],
    pnpm: ["pnpm", ["--version"]],
    ollama: ["ollama", ["--version"]],
  };

  for (const [dependency, [executable, args]] of Object.entries(
    dependenciesCmds,
  )) {
    try {
      console.log("");
      await run(executable, args);
    } catch {
      errors++;
      failedOnes.push(dependency);
      console.log(t.red(`\n[${errors}]`) + ` ${dependency} missing`);
    }
  }

  return { errors, failedOnes };
}

async function modelExists(modelName) {
  try {
    const response = await fetch("http://localhost:11434/api/tags");

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    return data.models.some((model) => model.name === modelName + ":latest");
  } catch (error) {
    return false;
  }
}
export async function checkModels(packageRoot) {
  let errors = 0;
  const failedOnes = [];

  const models = getModels();

  if (!models.length) {
    console.log("No models found.");
    return;
  } else {
    console.log(`\n${t.green(models.length)} model(s) found:\n`);

    const field = (label, value, width = 20) =>
      `${label.padEnd(width)} ${t.green(String(value ?? "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ").padEnd(width))}`;

    for (const [index, model] of models.entries()) {
      let pathStatus = "false";
      let ollamaStat;

      const modelPath = resolveModelPath(model.path, packageRoot);
      if (fs.existsSync(modelPath)) {
        pathStatus = "true";
      } else {
        errors++;
        failedOnes.push(model.path);
      }

      const ollamaStatus = await modelExists(model.ollama_model_id);
      if (ollamaStatus && pathStatus === "true") {
        ollamaStat = "OK";
      } else if (ollamaStatus && pathStatus === "false") {
        ollamaStat = t.bold(t.red("!!"));
        errors++;
        failedOnes.push(model.name + ":Source-dont-exist");
      } else if (!ollamaStatus && pathStatus === "true") {
        ollamaStat = t.red("NO");
      } else if (!ollamaStatus && pathStatus === "false") {
        ollamaStat = t.yellow("!!");
        errors++;
        failedOnes.push(model.name + ":Model-only-exist-in-db");
      }

      console.log(
        t.bold(
          `> ${t.green(index + 1)}. ${t.bold(t.gradient(`${model.provider}/${model.owner}/${model.name}`))} ${t.bold(t.dim(t.magenta(`(ID:${model.id})`)))}`,
        ) +
          `\n   ${field("Integrity:", pathStatus, 15)} |                              |` +
          `\n   ---------------------------------------------------------------|` +
          `\n   ${field("Ollama model ID:", model.ollama_model_id, 19)} ${field("", ollamaStat, 2)} |\n`,
      );
    }
  }

  return { errors, failedOnes };
}

export async function doctor(packageRoot) {
  console.log(t.bold(t.yellow("\nCGPrism Doctor")));
  console.log("\n1. Check dependencies:\n");

  try {
    const { errors, failedOnes } = await checkDependencies();

    if (errors === 0) {
      console.log(t.green("\nOK") + " All dependencies installed");
    } else {
      console.log(t.red(`\n${errors} dependency issue(s) found:`));
      console.log(failedOnes.join(", "));
    }
  } catch {
    console.log(t.red("Brutal > Error trying to check dependencies"));
  }

  console.log("\n2. Check models:\n");

  try {
    const { errors, failedOnes } = await checkModels(packageRoot);

    if (errors === 0) {
      console.log(t.green("\nOK") + " All models installed");
    } else {
      console.log(t.red(`\n${errors} models issue(s) found:`));
      console.log(failedOnes.join(", "));
    }
  } catch {
    console.log(t.red("Brutal > Error trying to check models"));
  }
}
