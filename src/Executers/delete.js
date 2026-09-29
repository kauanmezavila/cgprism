import { rm } from "node:fs/promises";
import { resolve } from "../core/Packages/resolve.js";
import { join } from "node:path";
import {
  deleteModelsName,
  deleteModelsOwner,
  deleteModelsProvider,
} from "../core/ModelsManager/delete.js";

export async function uninstallModel(pathDetails) {
  if (!pathDetails?.provider || !pathDetails?.owner || !pathDetails?.model) {
    throw new Error("Brutal > Invalid model name details");
  } else {
    const mainPath = join(
      "src",
      "data",
      "Models",
      pathDetails.provider,
      pathDetails.owner,
      pathDetails.model,
    );

    try {
      await rm(mainPath, {
        recursive: true,
        force: false,
      });
      deleteModelsName(pathDetails.model, pathDetails.owner);
    } catch {
      console.error("Brutal >", error.message);
    }
  }
}

export async function uninstallOwner(pathDetails) {
  if (!pathDetails?.provider || !pathDetails?.owner) {
    throw new Error("Brutal > Invalid owner details");
  } else {
    const mainPath = join(
      "src",
      "data",
      "Models",
      pathDetails.provider,
      pathDetails.owner,
    );

    try {
      await rm(mainPath, {
        recursive: true,
        force: false,
      });
      deleteModelsOwner(pathDetails.owner);
    } catch {
      console.error("Brutal >", error.message);
    }
  }
}

export async function uninstallProvider(pathDetails) {
  if (!pathDetails?.provider) {
    throw new Error("Brutal > Invalid provider details");
  } else {
    const mainPath = join("src", "data", "Models", pathDetails.provider);

    try {
      await rm(mainPath, {
        recursive: true,
        force: false,
      });
      deleteModelsProvider(pathDetails.provider);
    } catch {
      console.error("Brutal >", error.message);
    }
  }
}

uninstallProvider(resolve("uninstall hg"));
