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

const baseRoute = /\b(3d|three\.?js|webgl|gltf|glb|model|physics|simulation|simulator|learning|curriculum|khtn8|cannon|babylon|canvas|chemistry|biology|science|experiment)\b/.test(raw);
const visualRoute = /\b(visual|fancy|beautiful|ugly|polished|demo)\b/.test(raw) && /\b(3d|three\.?js|webgl|canvas|lab|model|chemistry|biology|physics|science|experiment|khtn8)\b/.test(raw);
const vietnameseRouteTerms = [
  "thí nghiệm",
  "thi nghiem",
  "mô phỏng",
  "mo phong",
  "hóa",
  "hoa",
  "sinh",
  "vật lý",
  "vat ly",
];
const vietnameseVisualRoute = ["đẹp", "dep", "xấu", "xau"].some((term) => raw.includes(term)) && ["3d", "lab", "demo", "thí nghiệm", "thi nghiem", "hóa", "hoa", "sinh", "vật lý", "vat ly"].some((term) => raw.includes(term));
const shouldRoute = baseRoute || visualRoute || vietnameseVisualRoute || vietnameseRouteTerms.some((term) => raw.includes(term));

if (!shouldRoute) {
  process.stdout.write("{}");
  process.exit(0);
}

const context = [
  "Three.js Lab plugin routing:",
  "- For product/curriculum labs use $learning-lab-3d-creator.",
  "- For visual quality, fancy demos, or before/after demo acceptance use $visual-lab-qa-agent at the start and end of each demo; loop on FIX_REQUIRED.",
  "- For KHTN8 biology/human body/ecology labs use $khtn8-biology-lab-creator plus stricter FE benchmarks.",
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
