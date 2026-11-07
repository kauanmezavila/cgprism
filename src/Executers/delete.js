import t from "../core/Packages/colors.js";

import { rm } from "node:fs/promises";
import { askBoolean } from "../core/Packages/ask.js";
import { join, sep } from "node:path";
import { resolveModelsPath } from "../core/Packages/paths.js";
import {
  deleteModelsSpecial,
  deleteModelsOwner,
  deleteModelsProvider,
  deleteModelsPath,
} from "../core/ModelsManager/delete.js";
import {
  getModelsOwner,
  getModelsProvider,
  getModelsPath,
} from "../core/ModelsManager/get.js";

function ollamaIds(models) {
  return [
    ...new Set(
      models
        .map((model) => model.ollama_model_id)
        .filter((id) => typeof id === "string" && id.length > 0),
    ),
  ];
}

export async function uninstallModelsRepo(pathDetails) {
  if (!pathDetails?.provider || !pathDetails?.owner || !pathDetails?.model) {
    throw new Error("\n\nBrutal > Invalid model name details");
  } else {
    const mainPath = resolveModelsPath(
      pathDetails.provider,
      pathDetails.owner,
      pathDetails.model,
    );

    console.log(t.dim("Deleting: " + mainPath));
    console.log(
      t.underline(
        `You are about to delete ${t.italic(t.gradient(pathDetails.model))}`,
      ),
      t.underline(`[from ${t.bold(pathDetails.owner)}]`),
    );
    try {
      const deleteAsk = await askBoolean("Are you sure?", false);
      if (deleteAsk) {
        const idsToUninstall = ollamaIds(
          getModelsOwner(pathDetails.owner).filter(
            (model) =>
              model.provider === pathDetails.provider &&
              (model.path === mainPath ||
                model.path?.startsWith(`${mainPath}${sep}`)),
          ),
        );
        await rm(mainPath, {
          recursive: true,
          force: false,
        });
        deleteModelsSpecial(mainPath, pathDetails.owner);
        console.log(
          t.green("\nOK"),
          `${pathDetails.model} from ${pathDetails.owner} was burned...`,
        );
        return idsToUninstall;
      } else {
        console.log(
          t.green("\nOK"),
          `Operation cancelled, ${t.italic(t.gradient(pathDetails.model))} from ${pathDetails.owner} is safe, by now...`,
        );
        return [];
      }
    } catch {
      console.error("\n\nBrutal > Something happened...");
      return [];
    }
  }
}

export async function uninstallModelsFile(pathDetails) {
  if (
    !pathDetails?.provider ||
    !pathDetails?.owner ||
    !pathDetails?.model ||
    !pathDetails?.file
  ) {
    throw new Error("\n\nBrutal > Invalid model name details");
  } else {
    const mainPath = resolveModelsPath(
      pathDetails.provider,
      pathDetails.owner,
      pathDetails.model,
      pathDetails.file,
    );

    console.log(t.dim("Deleting: " + mainPath));
    console.log(
      t.underline(
        `You are about to delete ${t.italic(t.gradient(pathDetails.file))}`,
      ),
      t.underline(
        `[from ${t.bold(join(pathDetails.owner, pathDetails.model))}]`,
      ),
    );
    try {
      const deleteAsk = await askBoolean("Are you sure?", false);
      if (deleteAsk) {
        const idsToUninstall = ollamaIds(getModelsPath(mainPath));
        await rm(mainPath, {
          recursive: true,
          force: false,
        });
        deleteModelsPath(mainPath, pathDetails.owner);
        console.log(
          t.green("\nOK"),
          `${pathDetails.file} from ${join(pathDetails.owner, pathDetails.model)} was burned...`,
        );
        return idsToUninstall;
      } else {
        console.log(
          t.green("\nOK"),
          `Operation cancelled, ${t.italic(t.gradient(pathDetails.model))} from ${pathDetails.owner} is safe, by now...`,
        );
        return [];
      }
    } catch {
      console.error("\n\nBrutal > Something happened...");
      return [];
    }
  }
}

export async function uninstallOwner(pathDetails) {
  if (!pathDetails?.provider || !pathDetails?.owner) {
    throw new Error("\n\nBrutal > Invalid owner details");
  } else {
    const mainPath = resolveModelsPath(pathDetails.provider, pathDetails.owner);

    console.log(t.dim("Deleting: " + mainPath));
    console.log(
      t.underline(
        `You are about to delete all work made by ${t.bold(pathDetails.owner)}`,
      ),
      `[${t.bold(getModelsOwner(pathDetails.owner).length)} models]`,
    );
    try {
      const deleteAsk = await askBoolean("Are you sure?", false);
      if (deleteAsk) {
        const idsToUninstall = ollamaIds(getModelsOwner(pathDetails.owner));
        await rm(mainPath, {
          recursive: true,
          force: false,
        });
        deleteModelsOwner(pathDetails.owner);
        console.log(
          t.green("\nOK"),
          `All of ${pathDetails.owner} work was burned...`,
        );
        return idsToUninstall;
      } else {
        console.log(
          t.green("\nOK"),
          `Operation cancelled, ${pathDetails.owner} models are safe, by now...`,
        );
        return [];
      }
    } catch {
      console.error("\n\nBrutal > Something happened...");
      return [];
    }
  }
}

export async function uninstallProvider(pathDetails) {
  if (!pathDetails?.provider) {
    throw new Error("\n\nBrutal > Invalid provider details");
  } else {
    const mainPath = resolveModelsPath(pathDetails.provider);

    console.log(t.dim("Deleting: " + mainPath));
    console.log(
      t.underline(
        `You are about to delete all models provided by ${t.bold(pathDetails.provider)}`,
      ),
      t.underline(
        `[${t.bold(getModelsProvider(pathDetails.provider).length)} models]`,
      ),
    );

    try {
      const deleteAsk = await askBoolean("Are you sure?", false);
      if (deleteAsk) {
        const idsToUninstall = ollamaIds(
          getModelsProvider(pathDetails.provider),
        );
        await rm(mainPath, {
          recursive: true,
          force: false,
        });
        deleteModelsProvider(pathDetails.provider);
        console.log(
          t.green("\nOK"),
          `All models provided by ${pathDetails.provider} are burned...`,
        );
        return idsToUninstall;
      } else {
        console.log(
          t.green("\nOK"),
          `Operation cancelled, models provided by ${pathDetails.provider} are safe, by now...`,
        );
        return [];
      }
    } catch {
      console.error("\n\nBrutal > Something happened...");
      return [];
    }
  }
}
