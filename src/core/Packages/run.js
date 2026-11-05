import t from "./colors.js";
import { spawn } from "node:child_process";

export function run(program, args = [], options = {}) {
  const { raw = false, ...spawnOptions } = options;

  return new Promise((resolve, reject) => {
    console.log(t.dim(`$ ${program} ${args.join(" ")}`));

    const child = spawn(program, args, {
      ...spawnOptions,
      stdio: raw ? "inherit" : ["inherit", "pipe", "pipe"],
    });

    if (!raw) {
      child.stdout.on("data", (data) => {
        process.stdout.write(t.dim(data.toString()));
      });

      child.stderr.on("data", (data) => {
        process.stderr.write(t.dim(data.toString()));
      });
    }

    child.on("error", reject);

    child.on("close", (code) => {
      console.log(t.dim(t.magenta(`Finished with code [${code}]`)));

      if (code === 0) resolve();
      else reject(new Error(`Finished with code [${code}]`));
    });
  });
}
