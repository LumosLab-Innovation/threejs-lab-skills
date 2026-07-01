#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function run(args) {
  const result = spawnSync("codex", args, { cwd: root, stdio: "inherit" });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(["plugin", "marketplace", "add", root]);
run(["plugin", "add", "threejs-lab@threejs-lab-local"]);
console.log("Installed threejs-lab@threejs-lab-local. Start a new Codex thread.");
