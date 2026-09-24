import { spawn } from "node:child_process";

export function run(program, args = []) {
  const process = spawn(program, args);

  process.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  process.stderr.on("data", (data) => {
    console.error(data.toString());
  });

  process.on("close", (code) => {
    console.log(`Finalizado: ${code}`);
  });
}
