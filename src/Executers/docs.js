import { getModels } from "../core/ModelsManager/get.js";
import { ask } from "../core/Packages/ask.js";
import readline from "node:readline";
import { stdin, stdout } from "node:process";

const docTypes = {
  model: "name",
  provider: "provider",
  owner: "owner",
  family: "family",
  architecture: "architecture",
  format: "format",
  runtime: "runtime",
  status: "status",
};

async function chooseModel(models) {
  if (models.length === 1) return models[0];
  if (!stdin.isTTY || !stdout.isTTY) {
    console.log(
      models.map((model) => `  ${model.id}. ${model.name}`).join("\n"),
    );
    const id = Number(await ask("Model ID"));
    return models.find((model) => model.id === id);
  }

  let selected = 0;
  const render = () => {
    readline.cursorTo(stdout, 0, 0);
    readline.clearScreenDown(stdout);
    stdout.write("Select with ^/v and press Enter:\n");
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
        if (key.name === "up")
          selected = (selected + models.length - 1) % models.length;
        else if (key.name === "down") selected = (selected + 1) % models.length;
        else if (key.name === "return") {
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

export async function showDocs(args = process.argv.slice(2)) {
  const typeFlag = args
    .slice(1)
    .find((arg) => arg.startsWith("--"))
    ?.slice(2);
  const field = docTypes[typeFlag];
  const term = args.slice(1).find((arg) => !arg.startsWith("-"));

  const matches = getModels().filter((model) =>
    String(model[field] ?? "")
      .toLowerCase()
      .includes(term.toLowerCase()),
  );
  if (matches.length === 0) {
    console.log("No items found in the DB.");
    return;
  }

  const selected = await chooseModel(matches);
  if (selected) {
    return selected.path;
  } else {
    return null;
  }
}
