#!/usr/bin/env node

import t from "../core/Packages/colors.js";
import install from "../Executers/install.js";
import {
  uninstallModelsFile,
  uninstallModelsRepo,
  uninstallOwner,
  uninstallProvider,
} from "../Executers/delete.js";
import { resolve } from "../core/Packages/resolve.js";

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

  if (resolvedQuery.model + resolvedQuery.owner + resolvedQuery.provider) {
    install(resolvedQuery);
  } else {
    console.log("Brutal > Missing info on the query");
  }
} else if (command === "uninstall") {
  console.log(banner);
  console.log(`\n${t.bold("Running:")} ${t.underline(args.join(" "))}\n`);
  console.log(t.dim(`Resolved:\n${JSON.stringify(resolvedQuery, null, 2)}\n`));

  if (resolvedQuery.file) {
    uninstallModelsFile(resolvedQuery);
  } else if (resolvedQuery.model) {
    uninstallModelsRepo(resolvedQuery);
  } else if (resolvedQuery.owner) {
    uninstallOwner(resolvedQuery);
  } else if (resolvedQuery.provider) {
    uninstallProvider(resolvedQuery);
  } else {
    console.log("Brutal > Missing info on the query");
  }
}
