import t from "./colors.js";

import { spawn } from "node:child_process";

export function run(program, args = []) {
  return new Promise((resolve, reject) => {
    console.log(t.dim(`$ ${(program, args.join(" "))}`));
    const process = spawn(program, args);

    process.stdout.on("data", (data) => {
      console.log(t.dim(data.toString()));
    });

    process.stderr.on("data", (data) => {
      console.error(t.dim(data.toString()));
    });

    t.dim(t.red(process.on("error", reject)));

    process.on("close", (code) => {
      console.log(t.dim(t.magenta(`Finished with code [${code}]`)));

      if (code === 0) {
        resolve();
      } else {
        t.dim(reject(new Error(t.red(`Finished with [${code}]`))));
      }
    });
  });
}
