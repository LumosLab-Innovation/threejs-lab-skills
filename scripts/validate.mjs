#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const pluginRoot = join(root, "plugins", "threejs-lab");
const skillsRoot = join(pluginRoot, "skills");
let failed = false;

function fail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}

function ok(message) {
  console.log(`ok ${message}`);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const pluginJsonPath = join(pluginRoot, ".codex-plugin", "plugin.json");
const plugin = readJson(pluginJsonPath);
for (const field of ["name", "version", "description", "skills", "interface"]) {
  if (!plugin[field]) fail(`plugin.json missing ${field}`);
}
if (plugin.hooks && !existsSync(join(pluginRoot, plugin.hooks.replace(/^\.\//, "")))) {
  fail(`plugin hook file missing: ${plugin.hooks}`);
}
ok("plugin manifest parsed");

const marketplace = readJson(join(root, ".agents", "plugins", "marketplace.json"));
const entry = marketplace.plugins?.find((item) => item.name === plugin.name);
if (!entry) fail("marketplace missing threejs-lab entry");
if (entry?.source?.path !== "./plugins/threejs-lab") fail("marketplace path must be ./plugins/threejs-lab");
ok("marketplace parsed");

for (const name of readdirSync(skillsRoot)) {
  const skillDir = join(skillsRoot, name);
  const skillPath = join(skillDir, "SKILL.md");
  if (!existsSync(skillPath)) continue;
  const skill = readFileSync(skillPath, "utf8");
  if (!skill.startsWith("---\n") && !skill.startsWith("---\r\n")) fail(`${name}: missing YAML frontmatter`);
  if (!new RegExp(`name:\\s*${name}\\b`).test(skill)) fail(`${name}: frontmatter name mismatch`);
  if (!/description:\s*\S/.test(skill)) fail(`${name}: missing description`);
  const placeholderPattern = new RegExp("\\[TO" + "DO|TO" + "DO:|Replace" + " with", "i");
  if (placeholderPattern.test(skill)) fail(`${name}: leftover placeholder`);
  if (!existsSync(join(skillDir, "agents", "openai.yaml"))) fail(`${name}: missing agents/openai.yaml`);
  ok(`skill ${name}`);
}

const hookPath = join(pluginRoot, "hooks", "hooks.json");
if (existsSync(hookPath)) {
  readJson(hookPath);
  ok("hook manifest parsed");
}

process.exit(failed ? 1 : 0);
