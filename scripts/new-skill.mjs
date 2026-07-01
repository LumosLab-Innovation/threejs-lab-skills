#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const [rawName, ...rest] = process.argv.slice(2);
if (!rawName) {
  console.error("usage: node scripts/new-skill.mjs <skill-name> [description]");
  process.exit(2);
}

const name = rawName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
if (!name) {
  console.error("skill name must include letters or digits");
  process.exit(2);
}

const description = rest.join(" ") || `Use when working on ${name}.`;
const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const skillDir = join(root, "plugins", "threejs-lab", "skills", name);
if (existsSync(skillDir)) {
  console.error(`skill already exists: ${skillDir}`);
  process.exit(1);
}

mkdirSync(join(skillDir, "agents"), { recursive: true });
mkdirSync(join(skillDir, "references"), { recursive: true });
writeFileSync(join(skillDir, "SKILL.md"), `---\nname: ${name}\ndescription: ${description}\n---\n\n# ${name}\n\n## Workflow\n\n1. Inspect the target code first.\n2. Reuse existing project patterns and dependencies.\n3. Build the smallest complete version.\n4. Run validation before reporting done.\n`);
writeFileSync(join(skillDir, "agents", "openai.yaml"), `interface:\n  display_name: "${name.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ")}"\n  short_description: "${description.slice(0, 64)}"\n  default_prompt: "Use $${name} for this task."\n`);
console.log(`created ${skillDir}`);
