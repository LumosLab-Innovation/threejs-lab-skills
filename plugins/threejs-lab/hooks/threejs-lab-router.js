#!/usr/bin/env node
const fs = require("fs");

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

const raw = [
  readStdin(),
  process.env.USER_PROMPT || "",
  process.env.PROMPT || "",
].join("\n").toLowerCase();

const shouldRoute = /\b(3d|three\.?js|webgl|gltf|glb|model|physics|simulation|simulator|learning|curriculum|khtn8|cannon|babylon|canvas)\b/.test(raw);

if (!shouldRoute) {
  process.stdout.write("{}");
  process.exit(0);
}

const context = [
  "Three.js Lab plugin routing:",
  "- For product/curriculum labs use $learning-lab-3d-creator.",
  "- For model/material/GLB work use $threejs-model-creator.",
  "- For physics, forces, collisions, and numerical simulation use $threejs-physics-simulation.",
  "- Before claiming done, use $threejs-performance-qa for build, browser, canvas, asset, and performance checks.",
  "- For strict PM/QA acceptance, use $learning-lab-qa-pm-reviewer and block if evidence is missing.",
].join("\n");

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "UserPromptSubmit",
    additionalContext: context,
  },
}));
