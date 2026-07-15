import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export function runOfflineTests({
  env = process.env,
  platform = process.platform,
  spawn = spawnSync,
  stdio = "inherit",
} = {}) {
  const command = platform === "win32" ? "pnpm.cmd" : "pnpm";
  const result = spawn(command, ["-r", "test"], {
    env: { ...env, MOSS_SKIP_E2E: "1" },
    stdio,
  });

  if (result.error) throw result.error;
  return typeof result.status === "number" ? result.status : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = runOfflineTests();
}
