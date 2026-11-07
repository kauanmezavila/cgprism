import t from "../core/Packages/colors.js";
import { run } from "../core/Packages/run.js";

async function checkDependencies() {
  let errors = 0;
  const failedOnes = [];

  const dependenciesCmds = {
    node: ["node", ["--version"]],
    git: ["git", ["--version"]],
    "git-lfs": ["git", ["lfs", "version"]],
    pnpm: ["pnpm", ["--version"]],
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

export async function doctor() {
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
}
