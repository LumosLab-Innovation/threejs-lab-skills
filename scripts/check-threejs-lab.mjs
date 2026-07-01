#!/usr/bin/env node
import { readFileSync } from "node:fs";

const files = process.argv.slice(2);

if (files.length === 0) {
  console.error("usage: node scripts/check-threejs-lab.mjs <file> [more files]");
  process.exit(2);
}

let failed = false;
const any = (source, patterns) => patterns.some((pattern) => pattern.test(source));

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const usesThree = any(source, [
    /from\s+["']three["']/,
    /from\s+["']three\/(?:addons|examples)\//,
    /\bTHREE\./,
    /@react-three\/fiber/,
    /<Canvas\b/,
    /@babylonjs\/core/,
  ]);
  const imperative = any(source, [/WebGLRenderer/, /new\s+THREE\.Scene/, /new\s+Scene\s*\(/]);
  const r3f = any(source, [/@react-three\/fiber/, /<Canvas\b/, /\buseFrame\s*\(/]);
  const errors = [];
  const warnings = [];

  if (!usesThree) warnings.push("no obvious Three.js/R3F/Babylon usage found");

  if (imperative) {
    if (!any(source, [/PerspectiveCamera/, /OrthographicCamera/, /new\s+ArcRotateCamera/, /new\s+FreeCamera/])) {
      errors.push("missing camera");
    }
    if (!any(source, [/requestAnimationFrame/, /setAnimationLoop/, /runRenderLoop/])) {
      errors.push("missing render loop");
    }
    if (!any(source, [/addEventListener\(\s*["']resize["']/, /ResizeObserver/, /\.onresize\s*=/])) {
      warnings.push("no resize handling found");
    }
    if (!any(source, [/setPixelRatio/, /devicePixelRatio/])) {
      warnings.push("pixel ratio is not clamped/configured");
    }
    if (!any(source, [/dispose\s*\(/, /removeEventListener/, /cancelAnimationFrame/, /stopRenderLoop/])) {
      warnings.push("no obvious teardown/disposal path");
    }
  }

  if (r3f && !any(source, [/<Canvas\b/])) warnings.push("R3F detected without visible <Canvas>");
  if (/GLTFLoader/.test(source) && !any(source, [/catch\s*\(/, /onError/, /try\s*{/, /error/i])) {
    warnings.push("GLTFLoader has no obvious error path");
  }
  if (/TextureLoader/.test(source) && /map\s*:/.test(source) && !/SRGBColorSpace/.test(source)) {
    warnings.push("color texture map may need SRGBColorSpace");
  }
  if (/\bCANNON\b|cannon-es/.test(source) && !any(source, [/fixed/i, /step\s*\(/, /1\s*\/\s*60/])) {
    warnings.push("physics code should document fixed timestep");
  }

  if (errors.length) failed = true;
  console.log(`${file}: ${errors.length ? "FAIL" : "ok"}`);
  for (const error of errors) console.log(`  error: ${error}`);
  for (const warning of warnings) console.log(`  warn: ${warning}`);
}

process.exit(failed ? 1 : 0);
