#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve, join } from "node:path";
import { homedir } from "node:os";
import { parseArgs } from "node:util";
import { mkdir, readdir, readFile, writeFile, lstat } from "node:fs/promises";
import { createHash } from "node:crypto";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "plugins", "threejs-lab", "skills");
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const marker = ".threejs-lab-install.json";

async function rejectSymlinks(target, key) {
  let current = target;
  for (const part of ["", ...key.split("/")]) {
    current = join(current, part);
    try { if ((await lstat(current)).isSymbolicLink()) throw new Error(`Refusing to write through symlink: ${current}`); }
    catch (e) { if (e.code !== "ENOENT") throw e; }
  }
}

async function filesAt(dir, prefix = "") {
  const files = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", ".threejs-studio"].includes(item.name)) continue;
    const name = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.isDirectory()) files.push(...await filesAt(join(dir, item.name), name));
    else if (item.isFile()) files.push(name);
    else throw new Error(`Source contains a symlink: ${name}`);
  }
  return files;
}

export function destination(agent, global, project, home = homedir()) {
  const base = global ? home : project;
  if (["codex", "opencode", "shared"].includes(agent)) return join(base, ".agents", "skills");
  if (agent === "claude") return join(base, ".claude", "skills");
  throw new Error("Unknown agent. Use codex, claude, opencode, shared, or --skills-dir.");
}

export async function installInto(target, { only = null, dryRun = false } = {}) {
  target = resolve(target);
  if (target === source || target.startsWith(source + "/") || target.startsWith(source + "\\")) throw new Error("Cannot install into the source skills directory");
  let previous = {};
  await rejectSymlinks(target, marker);
  try { previous = JSON.parse(await readFile(join(target, marker), "utf8")); }
  catch (e) { if (e.code !== "ENOENT") throw e; }
  const names = (await readdir(source, { withFileTypes: true })).filter((d) => d.isDirectory() && (!only || only.includes(d.name))).map((d) => d.name);
  if (only?.some((name) => !names.includes(name))) throw new Error("Unknown skill in --only");
  const planned = [], conflicts = [];
  for (const name of names) {
    const dest = join(target, name);
    try { if ((await lstat(dest)).isSymbolicLink()) { conflicts.push(dest + " (symlink)"); continue; } }
    catch (e) { if (e.code !== "ENOENT") throw e; }
    const files = await filesAt(join(source, name));
    const inheritedLicense = !files.includes("LICENSE");
    if (inheritedLicense) files.push("LICENSE");
    for (const file of files) {
      const key = `${name}/${file}`;
      const bytes = await readFile(inheritedLicense && file === "LICENSE" ? join(root, "LICENSE") : join(source, key));
      const sha = digest(bytes);
      const path = join(target, key);
      await rejectSymlinks(target, key);
      try {
        const local = digest(await readFile(path));
        if (local !== sha && local !== previous[key]) conflicts.push(key);
      } catch (e) { if (e.code !== "ENOENT") throw e; }
      planned.push({ key, path, bytes, sha });
    }
  }
  if (conflicts.length) throw new Error(`Local changes preserved; installation stopped before writing:\n${conflicts.join("\n")}\nUse a separate --skills-dir or reconcile these files first.`);
  if (!dryRun) {
    for (const item of planned) {
      await mkdir(dirname(item.path), { recursive: true });
      await writeFile(item.path, item.bytes);
      previous[item.key] = item.sha;
    }
    await mkdir(target, { recursive: true });
    await writeFile(join(target, marker), JSON.stringify(previous, null, 2) + "\n");
  }
  return { target, skills: names, files: planned.length, dryRun };
}

export async function main(args = process.argv.slice(2)) {
  try {
    const { values } = parseArgs({ args, options: {
      agent: { type: "string", default: "shared" }, global: { type: "boolean" },
      project: { type: "string", default: process.cwd() }, "skills-dir": { type: "string" },
      only: { type: "string" }, "dry-run": { type: "boolean" }, "skip-runtime": { type: "boolean" },
    } });
    const target = values["skills-dir"] || destination(values.agent, values.global, resolve(values.project));
    const result = await installInto(target, { only: values.only?.split(","), dryRun: values["dry-run"] });
    console.log(`${result.dryRun ? "Would install" : "Installed"} ${result.skills.length} skills (${result.files} files) → ${result.target}`);
    if (!result.dryRun && !values["skip-runtime"] && result.skills.includes("threejs-studio")) {
      const studio = join(result.target, "threejs-studio");
      // Run npm's JS entry on Windows too; user paths never enter a shell command.
      const npmCli = process.env.npm_execpath?.endsWith("npm-cli.js") ? process.env.npm_execpath : join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
      const npmArgs = ["ci", "--omit=dev", "--no-audit", "--no-fund"];
      const installed = process.platform === "win32"
        ? spawnSync(process.execPath, [npmCli, ...npmArgs], { cwd: studio, stdio: "inherit", windowsHide: true })
        : spawnSync("npm", npmArgs, { cwd: studio, stdio: "inherit" });
      if (installed.error || installed.status !== 0) throw new Error(`Skills copied; runtime install failed. Run npm ci --omit=dev in ${studio}`);
    }
    console.log("Start a new CLI session. Ask it to use threejs-studio. Blender MCP is optional and configured separately.");
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main();
