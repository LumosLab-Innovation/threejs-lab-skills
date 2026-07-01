#!/usr/bin/env node
import { readFileSync } from "node:fs";

const files = process.argv.slice(2);

if (files.length === 0) {
  console.error("usage: node check-threejs-lab.mjs <file> [more files]");
  process.exit(2);
}

let hasError = false;

function testAny(source, patterns) {
  return patterns.some((pattern) => pattern.test(source));
}

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const usesThree = testAny(source, [
    /from\s+["']three["']/,
    /from\s+["']three\/addons\//,
    /\bTHREE\./,
    /@react-three\/fiber/,
    /<Canvas\b/,
  ]);
  const imperative = testAny(source, [/WebGLRenderer/, /new\s+THREE\.Scene/, /new\s+Scene\s*\(/]);
  const r3f = testAny(source, [/@react-three\/fiber/, /<Canvas\b/, /\buseFrame\s*\(/]);
  const errors = [];
  const warnings = [];

  if (!usesThree) {
    warnings.push("no obvious Three.js/R3F usage found");
  }

  if (imperative) {
    if (!testAny(source, [/new\s+(THREE\.)?Scene\s*\(/])) {
      errors.push("missing Scene creation");
    }
    if (!testAny(source, [/WebGLRenderer/])) {
      errors.push("missing WebGLRenderer");
    }
    if (!testAny(source, [/PerspectiveCamera/, /OrthographicCamera/])) {
      errors.push("missing camera");
    }
    if (!testAny(source, [/requestAnimationFrame/, /setAnimationLoop/])) {
      errors.push("missing render loop");
    }
    if (!testAny(source, [/addEventListener\(\s*["']resize["']/, /ResizeObserver/, /\.onresize\s*=/])) {
      warnings.push("no resize handling found");
    }
    if (!testAny(source, [/setPixelRatio/, /devicePixelRatio/])) {
      warnings.push("pixel ratio is not clamped/configured");
    }
  }

  if (r3f) {
    if (!testAny(source, [/<Canvas\b/])) {
      warnings.push("R3F detected without visible <Canvas>");
    }
    if (!testAny(source, [/\buseFrame\s*\(/, /frameloop\s*=/])) {
      warnings.push("R3F scene has no obvious frame/update hook");
    }
  }

  if (/GLTFLoader/.test(source) && !testAny(source, [/catch\s*\(/, /onError/, /try\s*{/, /error/i])) {
    warnings.push("GLTFLoader has no obvious error path");
  }

  if (/TextureLoader/.test(source) && /map\s*:/.test(source) && !/SRGBColorSpace/.test(source)) {
    warnings.push("color texture map may need SRGBColorSpace");
  }

  if (errors.length > 0) {
    hasError = true;
  }

  console.log(`${file}: ${errors.length ? "FAIL" : "ok"}`);
  for (const error of errors) console.log(`  error: ${error}`);
  for (const warning of warnings) console.log(`  warn: ${warning}`);
}

process.exit(hasError ? 1 : 0);
