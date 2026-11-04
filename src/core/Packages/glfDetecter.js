import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function detectLFS(repoPath) {
  try {
    const { stdout } = await execFileAsync("git", ["lfs", "ls-files"], {
      cwd: repoPath,
    });

    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

export async function pullLFS(repoPath) {
  await execFileAsync("git", ["lfs", "pull"], { cwd: repoPath });
}
