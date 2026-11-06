import t from "../core/Packages/colors.js";
import readline from "node:readline";
import { stdin, stdout } from "node:process";

import { ask } from "../core/Packages/ask.js";
import { getModels } from "../core/ModelsManager/get.js";
import { run } from "../core/Packages/run.js";

async function chooseModel(models) {
  if (models.length === 1) return models[0];

  if (!stdin.isTTY || !stdout.isTTY) {
    console.log(
      models.map((model) => `  ${model.id}. ${model.name}`).join("\n"),
    );

    const id = Number(await ask("Model ID"));

    return models.find((model) => model.id === id) ?? null;
  }

  let selected = 0;

  const render = () => {
    readline.cursorTo(stdout, 0, 0);
    readline.clearScreenDown(stdout);

    stdout.write("Select with ↑/↓ and press Enter:\n");

    models.forEach((model, index) => {
      stdout.write(
        `${index === selected ? ">" : " "} ${model.name} (ID ${model.id})\n`,
      );
    });
  };

  readline.emitKeypressEvents(stdin);
  stdin.setRawMode(true);
  stdin.resume();

  render();

  try {
    return await new Promise((resolveSelection) => {
      const onKeypress = (_character, key) => {
        if (key.name === "up") {
          selected = (selected + models.length - 1) % models.length;
        } else if (key.name === "down") {
          selected = (selected + 1) % models.length;
        } else if (key.name === "return") {
          stdin.off("keypress", onKeypress);
          resolveSelection(models[selected]);
          return;
        } else if (key.name === "c" && key.ctrl) {
          stdin.off("keypress", onKeypress);
          resolveSelection(null);
          return;
        }

        render();
      };

      stdin.on("keypress", onKeypress);
    });
  } finally {
    stdin.setRawMode(false);
    stdin.pause();
    stdout.write("\n");
  }
}

function parseModelQuery(input) {
  const query = input.trim();

  const result = {
    provider: null,
    owner: null,
    model: null,
    raw: query,
  };

  if (!query) return result;

  let remaining = query;

  if (remaining.includes("@")) {
    const separator = remaining.indexOf("@");

    result.provider = remaining.slice(0, separator) || null;
    remaining = remaining.slice(separator + 1);
  }

  if (remaining.includes("/")) {
    const separator = remaining.indexOf("/");

    result.owner = remaining.slice(0, separator) || null;
    result.model = remaining.slice(separator + 1) || null;
  } else {
    result.model = remaining || null;
  }

  return result;
}

function resolveModel(input) {
  const query = parseModelQuery(input);
  const models = getModels();

  return models.filter((model) => {
    const providerMatch =
      !query.provider ||
      model.provider?.toLowerCase() === query.provider.toLowerCase();

    const ownerMatch =
      !query.owner || model.owner?.toLowerCase() === query.owner.toLowerCase();

    const modelMatch =
      !query.model ||
      model.name?.toLowerCase().includes(query.model.toLowerCase());

    return providerMatch && ownerMatch && modelMatch;
  });
}

export async function runModelWithOllama(query) {
  const matches = resolveModel(query);

  if (!matches.length) {
    console.log(t.red("Brutal > Model not found."));
    return null;
  }

  const selected = await chooseModel(matches);

  if (!selected) return null;

  if (selected.ollama_model_id) {
    await run("ollama", ["run", selected.ollama_model_id], {
      raw: true,
    });
  } else {
    console.log(t.red("Brutal > Model not created."));
  }
}
