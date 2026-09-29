import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];

  let i = 0;
  let value = bytes;

  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }

  return `${value.toFixed(2)} ${units[i]}`;
}

export async function getSize(dir) {
  let total = 0;

  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      if (entry.name === ".git") continue;

      const fullPath = join(current, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        total += (await stat(fullPath)).size;
      }
    }
  }

  await walk(dir);

  const formatted = formatBytes(total);

  return {
    total,
    formatted,
  };
}
