import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export async function ask(question, defaultValue = "") {
  const rl = readline.createInterface({
    input,
    output,
  });
  const suffix = defaultValue ? ` [${defaultValue}]` : "";

  try {
    const answer = await rl.question(`${question}${suffix}: `);
    return answer.trim() || defaultValue;
  } finally {
    rl.close();
  }
}

export async function askBoolean(question, defaultValue = true) {
  const rl = readline.createInterface({
    input,
    output,
  });
  const suffix = defaultValue ? " [Y/n]" : " [y/N]";

  try {
    const answer = (await rl.question(`${question}${suffix}: `))
      .trim()
      .toLowerCase();

    if (!answer) return defaultValue;
    return answer === "y" || answer === "yes";
  } finally {
    rl.close();
  }
}
