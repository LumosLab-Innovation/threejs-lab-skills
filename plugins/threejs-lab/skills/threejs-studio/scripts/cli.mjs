#!/usr/bin/env node
import { parseArgs } from "node:util";
import { resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readFile, open } from "node:fs/promises";
import { spawn } from "node:child_process";
import { init, load, next, requireValue } from "./state.mjs";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const cliFile = fileURLToPath(import.meta.url);
export function openBrowser(url) {
  const command = process.platform === "win32" ? ["rundll32.exe", ["url.dll,FileProtocolHandler", url]]
    : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  const child = spawn(...command, { stdio: "ignore", detached: true, windowsHide: true });
  child.on("error", () => console.error(`Open ${url} in your browser.`));
  child.unref();
}

async function session(dir) {
  const saved = JSON.parse(await readFile(join(dir, ".session.json"), "utf8"));
  requireValue(/^http:\/\/127\.0\.0\.1:\d+$/.test(saved.origin), "Invalid studio address");
  const response = await fetch(`${saved.origin}/health`, { signal: AbortSignal.timeout(1500) });
  requireValue((await response.json()).id === (await load(dir)).id, "Studio session mismatch");
  return saved;
}

export async function main(args) {
  try {
    const command = args[0] || "help";
    const { values } = parseArgs({ args: args.slice(1), options: {
      dir: { type: "string", default: ".threejs-studio" }, prompt: { type: "string" },
      engine: { type: "string", default: "threejs" }, file: { type: "string" }, title: { type: "string" },
      reference: { type: "string" }, provenance: { type: "string" }, blend: { type: "string" },
      behavior: { type: "string" },
      port: { type: "string", default: "0" }, background: { type: "boolean" },
      "no-open": { type: "boolean" }, wait: { type: "string", default: "0" },
    } });
    const dir = resolve(values.dir);
    if (command === "init") {
      console.log(JSON.stringify(next(await init(dir, values.prompt, values.engine)), null, 2));
    } else if (command === "serve") {
      let existing;
      try { existing = await session(dir); } catch { /* A stale session can be replaced. */ }
      if (existing) {
        console.log(existing.origin);
        if (!values["no-open"]) openBrowser(existing.origin);
        return;
      }
      const port = Number(values.port);
      requireValue(Number.isInteger(port) && port >= 0 && port <= 65535, "Invalid port");
      if (values.background) {
        const log = await open(join(dir, ".server.log"), "a", 0o600);
        const child = spawn(process.execPath, [cliFile, "serve", "--dir", dir, "--port", String(port), "--no-open"],
          { detached: true, stdio: ["ignore", log.fd, log.fd], windowsHide: true });
        await log.close();
        child.unref();
        for (let i = 0; i < 30; i++) {
          await delay(200);
          try { existing = await session(dir); break; } catch { /* Wait for the local listener. */ }
        }
        requireValue(existing, `Studio failed to start. Check ${join(dir, ".server.log")} (run npm ci in the skill folder if dependencies are missing).`);
        console.log(existing.origin);
        if (!values["no-open"]) openBrowser(existing.origin);
      } else {
        const { start } = await import("./server.mjs");
        const result = await start(dir, { port });
        console.log(result.origin);
        if (!values["no-open"]) openBrowser(result.origin);
        for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => result.server.close());
      }
    } else if (command === "status") {
      const wait = Number(values.wait);
      requireValue(Number.isFinite(wait) && wait >= 0 && wait <= 55, "Wait must be 0–55 seconds");
      const first = await load(dir);
      let current = first;
      const end = Date.now() + wait * 1000;
      while (Date.now() < end && current.revision === first.revision) { await delay(300); current = await load(dir); }
      console.log(JSON.stringify(next(current), null, 2));
    } else if (["add-image", "add-model", "stop"].includes(command)) {
      const live = await session(dir);
      const payload = { ...values, action: command };
      if (values.file) payload.file = resolve(values.file);
      if (values.blend) payload.blend = resolve(values.blend);
      if (values.behavior) payload.behavior = resolve(values.behavior);
      const response = await fetch(`${live.origin}/api/agent`, { method: "POST", headers: {
        "Content-Type": "application/json", "X-Agent-Key": live.agentKey,
      }, body: JSON.stringify(payload) });
      const result = await response.json();
      requireValue(response.ok, result.error);
      console.log(JSON.stringify(result, null, 2));
    } else if (command === "doctor") {
      const checks = { node: process.versions.node, imageTool: "Use the host's image-generation tool or add a local image.",
        blenderMcp: "Discover get_scene_info + execute_blender_code in your host; not required for Three.js." };
      for (const name of ["three", "esbuild"]) {
        try { await import(name); checks[name] = "ready"; } catch { checks[name] = "missing: run npm ci in the threejs-studio skill folder"; }
      }
      console.log(JSON.stringify(checks, null, 2));
      if ([checks.three, checks.esbuild].some((x) => x !== "ready")) process.exitCode = 1;
    } else {
      requireValue(command === "help", `Unknown command: ${command}`);
      console.log(`Three.js Studio (Node 22+)\n\ninit --prompt "..." [--engine threejs|blender] [--dir .threejs-studio]\nserve [--background] [--no-open] [--port 0] [--dir ...]\nadd-image --file reference.png --title "Option A" --provenance "Host tool or user file"\nstatus [--wait 55]\nadd-model --file model.ts --title "Option A" --reference <approved SHA256>\nadd-model --file model.glb --behavior behavior.ts [--blend model.blend] --title "Option A" --reference <approved SHA256>\nstop\ndoctor\n\nAll commands accept --dir. Approvals are made in the browser, never by CLI.\nThe agent authors geometry in Three.js or Blender and Three.js interaction for both. No paid generation API is bundled.`);
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main(process.argv.slice(2));
