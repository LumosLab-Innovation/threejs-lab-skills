#!/usr/bin/env node
if (process.argv[2] === "install") {
  const { main } = await import("./install.mjs");
  await main(process.argv.slice(3));
} else {
  const { main } = await import("../plugins/threejs-lab/skills/threejs-studio/scripts/cli.mjs");
  await main(process.argv.slice(2));
}
