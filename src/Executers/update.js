import fs from "node:fs";
import path from "node:path";
import * as os from "node:os";

import t from "../core/Packages/colors.js";
import { run } from "../core/Packages/run.js";
import { getModels } from "../core/ModelsManager/get.js";
import { resolveModelPath } from "../core/Packages/paths.js";

const OS = os.platform();

const INSTALL_URLS = {
  linux:
    "https://raw.githubusercontent.com/kauanmezavila/cgprism/main/install.sh",
  win32:
    "https://raw.githubusercontent.com/kauanmezavila/cgprism/main/install.ps1",
};

async function updateCgprism() {
  try {
    console.log("\nUpdating CGPrism...");

    if (OS === "linux") {
      await run("bash", ["-lc", `curl -fsSL "${INSTALL_URLS.linux}" | bash`]);
    } else if (OS === "win32") {
      await run("powershell", [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        `irm "${INSTALL_URLS.win32}" | iex`,
      ]);
    } else {
      throw new Error(`Unsupported OS: ${OS}`);
    }

    console.log(t.green("\nCGPrism updated."));
    return { errors: 0, failedOnes: [] };
  } catch (error) {
    console.log(t.red("\n[ERROR]") + " CGPrism update failed!");
    console.error(error);

    return { errors: 1, failedOnes: ["cgprism"] };
  }
}

async function checkDependencies() {
  let errors = 0;
  const failedOnes = [];

  const dependencies = {
    node: ["node", ["--version"]],
    nvm: ["nvm", ["--version"]],
    git: ["git", ["--version"]],
    "git-lfs": ["git", ["lfs", "version"]],
    npm: ["npm", ["--version"]],
    pnpm: ["pnpm", ["--version"]],
    ollama: ["ollama", ["--version"]],
  };

  for (const [name, [executable, args]] of Object.entries(dependencies)) {
    try {
      console.log(`\nChecking ${name}...`);
      await run(executable, args);
    } catch {
      errors++;
      failedOnes.push(name);

      console.log(t.red(`[${errors}]`) + ` ${name} is missing or unavailable.`);
    }
  }

  return { errors, failedOnes };
}

async function updateDependencies() {
  let errors = 0;
  const failedOnes = [];

  const updateTask = async (name, executable, args) => {
    try {
      console.log(`\nUpdating ${name}...`);
      await run(executable, args);

      console.log(t.green(`${name} updated.`));
    } catch (error) {
      errors++;
      failedOnes.push(name);

      console.log(t.red(`[${errors}]`) + ` ${name} update failed.`);
      console.error(error);
    }
  };

  try {
    console.log("\nUpdating Node.js...");

    if (OS === "linux") {
      await run("bash", [
        "-lc",
        'source "$HOME/.nvm/nvm.sh" && nvm install --lts && nvm use --lts && nvm alias default "lts/*"',
      ]);
    } else if (OS === "win32") {
      await run("nvm", ["install", "latest"]);
      await run("nvm", ["use", "latest"]);
    } else {
      throw new Error(`Unsupported OS: ${OS}`);
    }
  } catch (error) {
    errors++;
    failedOnes.push("node");

    console.log(t.red(`[${errors}]`) + " Node.js update failed.");
    console.error(error);
  }

  await updateTask("npm", "npm", ["install", "-g", "npm@latest"]);

  await updateTask("pnpm", "npm", ["install", "-g", "pnpm@latest"]);

  return { errors, failedOnes };
}

export async function updateModels(packageRoot) {
  let errors = 0;
  const failedOnes = [];

  const models = getModels();

  if (!models.length) {
    console.log("No models found.");
    return { errors, failedOnes };
  }

  console.log(`\n${t.green(models.length)} model(s) found:\n`);

  const field = (label, value, width = 20) =>
    `${label.padEnd(width)} ${t.green(String(value ?? "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ").padEnd(width))}`;

  for (const [index, model] of models.entries()) {
    const modelPath = resolveModelPath(model.path, packageRoot);

    let pathStatus = fs.existsSync(modelPath);
    let ollamaStatus = false;
    let ollamaStat = "N/A";

    if (!pathStatus) {
      errors++;
      failedOnes.push(model.path);
    }

    try {
      ollamaStatus = await modelExists(model.ollama_model_id);
    } catch {
      ollamaStatus = false;
    }

    if (ollamaStatus && pathStatus) {
      ollamaStat = t.green("OK");
    } else if (ollamaStatus && !pathStatus) {
      ollamaStat = t.red("!!");
      errors++;
      failedOnes.push(`${model.name}:Source-dont-exist`);
    } else if (!ollamaStatus && pathStatus) {
      ollamaStat = t.red("NO");
    } else {
      ollamaStat = t.yellow("!!");
      errors++;
      failedOnes.push(`${model.name}:Model-only-exist-in-db`);
    }

    if (pathStatus) {
      const gitDirectory = path.join(modelPath, ".git");

      if (fs.existsSync(gitDirectory)) {
        try {
          console.log(`\nUpdating repository: ${model.name}`);

          await run("git", ["-C", modelPath, "pull", "--ff-only"]);

          console.log(t.green(`${model.name} repository updated.`));
        } catch (error) {
          errors++;
          failedOnes.push(`${model.name}:git-pull`);

          console.log(
            t.red(`[${errors}]`) + ` ${model.name} repository update failed.`,
          );
          console.error(error);
        }
      }
    }

    console.log(
      t.bold(
        `> ${t.green(index + 1)}. ${t.gradient(
          `${model.provider}/${model.owner}/${model.name}`,
        )} ${t.dim(t.magenta(`(ID:${model.id})`))}`,
      ) +
        `\n   ${field("Integrity:", pathStatus ? "true" : "false", 15)}` +
        `\n   ---------------------------------------------------------------|` +
        `\n   ${field("Ollama model ID:", model.ollama_model_id, 19)} ${field("", ollamaStat, 2)} |\n`,
    );
  }

  return { errors, failedOnes };
}

export async function updateAll(packageRoot) {
  let errors = 0;
  const failedOnes = [];

  const tasks = [
    updateCgprism,
    checkDependencies,
    updateDependencies,
    () => updateModels(packageRoot),
  ];

  for (const task of tasks) {
    try {
      const result = await task();

      if (result) {
        errors += result.errors ?? 0;
        failedOnes.push(...(result.failedOnes ?? []));
      }
    } catch (error) {
      errors++;
      failedOnes.push("unknown");

      console.error(error);
    }
  }

  console.log("\n----------------------------");

  if (errors === 0) {
    console.log(t.green("All updates completed successfully."));
  } else {
    console.log(t.yellow(`${errors} error(s) occurred.`));
    console.log("Failed items:", failedOnes);
  }

  return { errors, failedOnes };
}
