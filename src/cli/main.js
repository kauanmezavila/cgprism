#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import path from "node:path";

import t from "../core/Packages/colors.js";
import { run } from "../core/Packages/run.js";
import { runModelWithOllama } from "../Executers/runModels.js";
import install from "../Executers/install.js";
import {
  uninstallModelsFile,
  uninstallModelsRepo,
  uninstallOwner,
  uninstallProvider,
} from "../Executers/delete.js";
import { showDocs } from "../Executers/docs.js";
import { resolve } from "../core/Packages/resolve.js";
import {
  createInternalModelWithOllama,
  createModelFile,
  createModelWithOllama,
} from "../Executers/model.js";
import { listModels } from "../Executers/list.js";
import {
  getSystemInfo,
  analyzeModelCapability,
  heuristicAnalyze,
  analyzeActualModels,
} from "../Executers/hardware.js";

import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageRoot = path.resolve(__dirname, "../..");

const modelsPath = path.join(packageRoot, "src", "data", "Models");
const registryPath = path.join(packageRoot, "src", "data", "registry.db");

const args = process.argv.slice(2);

const banner =
  t.gradient(
    [
      `   ________________       _               `,
      `  / ____/ ____/ __ \\_____(_)________ ___  `,
      ` / /   / / __/ /_/ / ___/ / ___/ __ \`__ \\ `,
      `/ /___/ /_/ / ____/ /  / (__  ) / / / / / `,
      `\\____/\\____/_/   /_/  /_/____/_/ /_/ /_/ `,
      ``,
    ].join("\n"),
  ) +
  t.bold(`=========================================
| The local interface for AI management |
`) +
  t.dim(`| >> https://github.com/kauanmezavila < |`);

const command = args[0];

const version = args.includes("--version");

const resolvedQuery = resolve(args.join(" "));

if (version) {
  console.log(t.italic(t.gradient(`CGPrism`) + " 0.0.1"));
} else if (command === "install") {
  console.log(banner);
  console.log(`\n${t.bold("Running:")} ${t.underline(args.join(" "))}\n`);
  console.log(t.dim(`Resolved:\n${JSON.stringify(resolvedQuery, null, 2)}\n`));

  if (resolvedQuery.owner && resolvedQuery.provider === "ol") {
    await install(resolvedQuery);

    const modelQuery = args
      .slice(1)
      .filter((arg) => !arg.startsWith("--"))
      .join(" ");

    const result = await createInternalModelWithOllama(
      modelQuery,
      resolvedQuery.owner,
    );

    if (result) {
      console.log(
        `${t.green("OK")} ${resolvedQuery.owner} was deployed to Ollama.`,
      );
    }
  } else if (
    resolvedQuery.model &&
    resolvedQuery.owner &&
    resolvedQuery.provider &&
    resolvedQuery.full &&
    resolvedQuery.ollama
  ) {
    await install(resolvedQuery);

    const modelQuery = args
      .slice(1)
      .filter((arg) => !arg.startsWith("--"))
      .join(" ");

    if (resolvedQuery.provider !== "ol") {
      await createModelFile(packageRoot, modelQuery);

      const result = await createModelWithOllama(packageRoot, modelQuery);

      if (result) {
        console.log(`${t.green("OK")} ${result.id} was deployed to Ollama.`);
      }
    } else {
      const result = await createInternalModelWithOllama(modelQuery);

      if (result) {
        console.log(`${t.green("OK")} ${result.id} was deployed to Ollama.`);
      }
    }
  } else if (
    resolvedQuery.model &&
    resolvedQuery.owner &&
    resolvedQuery.provider
  ) {
    await install(resolvedQuery);
  } else {
    console.log("Brutal > Missing info on the query");
  }
} else if (command === "uninstall") {
  console.log(banner);
  console.log(`\n${t.bold("Running:")} ${t.underline(args.join(" "))}\n`);
  console.log(t.dim(`Resolved:\n${JSON.stringify(resolvedQuery, null, 2)}\n`));

  let ollamaIDs = [];
  if (resolvedQuery.file) {
    ollamaIDs = await uninstallModelsFile(resolvedQuery);
  } else if (resolvedQuery.model) {
    ollamaIDs = await uninstallModelsRepo(resolvedQuery);
  } else if (resolvedQuery.owner) {
    ollamaIDs = await uninstallOwner(resolvedQuery);
  } else if (resolvedQuery.provider) {
    ollamaIDs = await uninstallProvider(resolvedQuery);
  } else {
    console.log("Brutal > Missing info on the query");
  }

  console.log("\n");
  if (ollamaIDs && ollamaIDs.length > 0) {
    console.log(
      await t.spinner("Removing Ollama models...\n", async () => {
        for (const id of ollamaIDs) {
          await run("ollama", ["rm", id]);
        }
      }),
    );
    console.log(t.green("\nOK") + " Ollama models removed.");
  }
} else if (command === "docs") {
  console.log(banner);
  console.log(`\n${t.bold("Running:")} ${t.underline(args.join(" "))}\n`);

  const selectedPath = await showDocs(args);
  const finalPath = dirname(selectedPath);

  await run("mdt", [finalPath], { raw: true });
} else if (command === "model") {
  console.log(banner);
  console.log(`\n${t.bold("Running:")} ${t.underline(args.join(" "))}\n`);
  console.log(t.dim(`Resolved:\n${JSON.stringify(resolvedQuery, null, 2)}\n`));

  const modelQuery = args
    .slice(1)
    .filter((arg) => !arg.startsWith("--"))
    .join(" ");

  if (resolvedQuery.new) {
    await createModelFile(packageRoot, modelQuery);
  } else if (resolvedQuery.create && resolvedQuery.ollama) {
    const result = await createModelWithOllama(packageRoot, modelQuery);

    if (result) {
      console.log(`${t.green("OK")} ${result.id} was deployed to Ollama.`);
    }
  }
} else if (command === "run") {
  console.log(banner);
  console.log(`\n${t.bold("Running:")} ${t.underline(args.join(" "))}\n`);
  console.log(t.dim(`Resolved:\n${JSON.stringify(resolvedQuery, null, 2)}\n`));

  const modelQuery = args
    .slice(1)
    .filter((arg) => !arg.startsWith("--"))
    .join(" ");

  if (resolvedQuery.ollama) {
    await runModelWithOllama(modelQuery);
  }
} else if (command === "list") {
  console.log(banner);
  console.log(`\n${t.bold("Running:")} ${t.underline(args.join(" "))}\n`);
  console.log(t.dim(`Resolved:\n${JSON.stringify(resolvedQuery, null, 2)}\n`));

  await listModels();
} else if (command === "hardware") {
  console.log(banner);
  console.log(`\n${t.bold("Running:")} ${t.underline(args.join(" "))}\n`);
  console.log(t.dim(`Resolved:\n${JSON.stringify(resolvedQuery, null, 2)}\n`));
  if (resolvedQuery.about) {
    const system = await getSystemInfo();

    const gpuInfo = system.graphics.controllers
      .map((gpu) => `   - ${t.green(`${gpu.vendor} ${gpu.model}`)}`)
      .join("\n");

    const diskInfo = system.storage.disks
      .map(
        (disk) => `   - Name: ${t.green(disk.name)}
     Model: ${t.green(disk.vendor ?? "")} ${t.green(disk.model ?? "")}
     Size: ${t.green((disk.size / 1024 ** 3).toFixed(2))} ${t.green(`GB`)}
     Type: ${t.green(disk.type ?? "Unknown")}
  `,
      )
      .join("\n");

    console.log(`
${"About " + t.yellow(system.system.hostname)} [${t.dim(system.collectedAt)}]
  > OS: ${t.green(`${system.system.os.distro} ${system.system.os.zena} ${system.system.os.release} ${system.system.os.arch} ${system.system.release}`)}
        ${t.dim(`\\[Serial: ${system.system.os.serial ?? "N/A"}]`)}

  > CPU: ${t.green(`${system.cpu.manufacturer} ${system.cpu.brand} [${system.cpu.logicalCores} threads]`)}
  > RAM: ${t.green(`${(system.memory.used / 1024 ** 3).toFixed(2)} / ${(system.memory.total / 1024 ** 3).toFixed(2)} GB`)}

  > GPU:
${gpuInfo}

  > DISK:
${diskInfo}
`);
  } else if (resolvedQuery.benchmark) {
    const system = await getSystemInfo();

    const capability = analyzeModelCapability(system);

    const { hardware, limits, execution, metadata } = capability;

    heuristicAnalyze(limits, execution, metadata);
  } else if (resolvedQuery.actual) {
    const system = await getSystemInfo();

    const capability = await analyzeActualModels(system);
  } else {
    const system = await getSystemInfo();

    const gpuInfo = system.graphics.controllers
      .map((gpu) => `   - ${t.green(`${gpu.vendor} ${gpu.model}`)}`)
      .join("\n");

    const diskInfo = system.storage.disks
      .map(
        (disk) => `   - Name: ${t.green(disk.name)}
     Model: ${t.green(disk.vendor ?? "")} ${t.green(disk.model ?? "")}
     Size: ${t.green((disk.size / 1024 ** 3).toFixed(2))} ${t.green(`GB`)}
     Type: ${t.green(disk.type ?? "Unknown")}
  `,
      )
      .join("\n");

    console.log(`
${"About " + t.yellow(system.system.hostname)} [${t.dim(system.collectedAt)}]
  > OS: ${t.green(`${system.system.os.distro} ${system.system.os.zena} ${system.system.os.release} ${system.system.os.arch} ${system.system.release}`)}
        ${t.dim(`\\[Serial: ${system.system.os.serial ?? "N/A"}]`)}

  > CPU: ${t.green(`${system.cpu.manufacturer} ${system.cpu.brand} [${system.cpu.logicalCores} threads]`)}
  > RAM: ${t.green(`${(system.memory.used / 1024 ** 3).toFixed(2)} / ${(system.memory.total / 1024 ** 3).toFixed(2)} GB`)}

  > GPU:
${gpuInfo}

  > DISK:
${diskInfo}
`);

    const capability = analyzeModelCapability(system);

    const { hardware, limits, execution, metadata } = capability;

    heuristicAnalyze(limits, execution, metadata);

    const capabilityt = await analyzeActualModels(system);
  }
}
