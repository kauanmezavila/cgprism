import t from "../core/Packages/colors.js";
import readline from "node:readline/promises";

import { run } from "../core/Packages/run.js";
import { resolve } from "../core/Packages/resolve.js";
import { getSize } from "../core/Packages/size.js";
import { join } from "node:path";
import { addModel, dbInit } from "../core/ModelsManager/registry.js";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

const ask = async (question, defaultValue) => {
  const answer = await rl.question(`${question} [${defaultValue}]: `);

  return answer.trim() || defaultValue;
};

export async function promptModel(installDetails, mainPath, total) {
  const model = {
    name: await ask("Name", installDetails.model),
    provider: await ask("Provider", installDetails.provider),
    owner: await ask("Owner", installDetails.owner),
    version: await ask("Version", "latest"),
    path: mainPath,
    format: await ask("Format"),
    size_bytes: Number(await ask("Size (Bytes)", total)),
    parameters: await ask("Params"),
    runtime: await ask("Runtime"),
  };

  rl.close();

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
  }

  console.log(`Getting ready to download ${t.gradient(installDetails.model)}`);
  try {
    await run("git", [
      "clone",
      installDetails.providerUrl + installDetails.target,
      mainPath,
    ]);

    const size = await getSize(mainPath);

    console.log(
      `\n${t.green("OK")} installed ${t.gradient(installDetails.model)} [${size.formatted}]`,
    );

    const prompModel = await promptModel(installDetails, mainPath, size.total);
    dbInit();
    addModel(prompModel);
  } catch (error) {
    console.error("Brutal >", error.message);
  }
}

install(resolve("install hg@prism-ml/Ternary-Bonsai-2-27B-gguf"));
