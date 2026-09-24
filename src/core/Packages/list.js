import fs from "node:fs";

export function listDirTarget(pathDetails) {
  const mainPath = join(
    "src",
    "data",
    "Models",
    pathDetails.provider,
    pathDetails.target,
  );

  const files = fs.readdirSync(mainPath);
  return files;
}

export function listDirOwner(pathDetails) {
  const mainPath = join(
    "src",
    "data",
    "Models",
    pathDetails.provider,
    pathDetails.owner,
  );

  const files = fs.readdirSync(mainPath);
  return files;
}

export function listDirProvider(pathDetails) {
  const mainPath = join("src", "data", "Models", pathDetails.provider);

  const files = fs.readdirSync(mainPath);
  return files;
}
