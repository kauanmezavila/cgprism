import t from "../core/Packages/colors.js";
import { getModels } from "../core/ModelsManager/get.js";

export async function listModels() {
  const models = getModels();

  if (!models.length) {
    console.log("No models found.");
    return;
  } else {
    console.log(`\n${t.green(models.length)} model(s) found:\n`);
    models.forEach((model, index) => {
      const field = (label, value, width = 20) =>
        `${label.padEnd(width)} ${t.green(String(value ?? "ㅤㅤㅤㅤㅤㅤㅤㅤ").padEnd(width))}`;

      console.log(
        t.bold(
          `> ${t.green(index + 1)}. ${t.bold(t.gradient(`${model.provider}/${model.owner}/${model.name}`))} ${t.bold(t.dim(t.magenta(`(ID:${model.id})`)))}`,
        ) +
          `\n   ${field("Format:", model.format, 15)} | ${field("Runtime:", model.runtime, 15)} |` +
          `\n   ${field("Family:", model.family, 15)} | ${field("Architecture:", model.architecture, 15)} |` +
          `\n   ${field("Parameters:", model.parameters, 15)} | ${field("Quantization:", model.quantization, 15)} |` +
          `\n   ${field("Size (bytes):", model.size_bytes, 15)} |                                 |` +
          `\n   ------------------------------------------------------------------|` +
          `\n   ${field("Ollama model ID:", model.ollama_model_id, 28)} |\n`,
      );
    });
  }
}
