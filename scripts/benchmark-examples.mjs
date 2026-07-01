#!/usr/bin/env node
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { spawn } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const targets = process.argv.slice(2).length ? process.argv.slice(2) : [
  "examples/fancy-field-lab/index.html",
  "examples/density-buoyancy-lab/index.html",
  "examples/coulomb-force-lab/index.html",
];

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  const found = candidates.find((item) => existsSync(item));
  if (!found) throw new Error("Chrome not found. Set CHROME_PATH.");
  return found;
}

function freePort() {
  return new Promise((resolvePort) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolvePort(port));
    });
  });
}

function serve(port) {
  const server = createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    const file = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (!file.startsWith(root) || !existsSync(file)) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    res.writeHead(200, { "content-type": mime[extname(file)] || "application/octet-stream" });
    res.end(readFileSync(file));
  });
  return new Promise((resolveServer) => server.listen(port, "127.0.0.1", () => resolveServer(server)));
}

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function json(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolveOpen, rejectOpen) => {
    ws.addEventListener("open", resolveOpen, { once: true });
    ws.addEventListener("error", rejectOpen, { once: true });
  });
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolveMessage, rejectMessage } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) rejectMessage(new Error(message.error.message));
    else resolveMessage(message.result);
  });
  return {
    send(method, params = {}) {
      const messageId = ++id;
      ws.send(JSON.stringify({ id: messageId, method, params }));
      return new Promise((resolveMessage, rejectMessage) => pending.set(messageId, { resolveMessage, rejectMessage }));
    },
    close() {
      ws.close();
    },
  };
}

async function waitForChrome(port) {
  for (let i = 0; i < 80; i += 1) {
    try {
      return await json(`http://127.0.0.1:${port}/json/version`);
    } catch {
      await wait(100);
    }
  }
  throw new Error("Chrome DevTools did not start");
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Runtime.evaluate failed");
  return result.result.value;
}

const profiles = [
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

async function benchTarget(cdpPort, serverPort, target, profile) {
  const url = `http://127.0.0.1:${serverPort}/${target.replaceAll("\\", "/")}`;
  const pageInfo = await json(`http://127.0.0.1:${cdpPort}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const cdp = await connect(pageInfo.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: profile.width,
    height: profile.height,
    deviceScaleFactor: 1,
    mobile: profile.mobile,
  });
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
      window.__BENCH_ERRORS__ = [];
      window.addEventListener("error", (event) => window.__BENCH_ERRORS__.push(event.message));
      window.addEventListener("unhandledrejection", (event) => window.__BENCH_ERRORS__.push(String(event.reason)));
      const originalError = console.error;
      console.error = (...args) => {
        window.__BENCH_ERRORS__.push(args.map(String).join(" "));
        originalError.apply(console, args);
      };
    `,
  });
  await cdp.send("Page.navigate", { url });
  for (let i = 0; i < 100; i += 1) {
    if (await evaluate(cdp, "document.readyState") === "complete") break;
    await wait(100);
  }
  await wait(800);

  const result = await evaluate(cdp, `new Promise((resolve) => {
    const samples = [];
    let last = performance.now();
    function sample(now) {
      samples.push(now - last);
      last = now;
      if (samples.length < 150) requestAnimationFrame(sample);
      else {
        const sorted = [...samples].sort((a, b) => a - b);
        const avg = samples.reduce((sum, item) => sum + item, 0) / samples.length;
        const p95 = sorted[Math.floor(sorted.length * 0.95)];
        const canvas = document.querySelector("canvas");
        resolve({
          url: location.pathname,
          title: document.querySelector("h1")?.textContent || document.title,
          errors: window.__BENCH_ERRORS__ || [],
          fpsAvg: Math.round(1000 / avg),
          frameAvgMs: Number(avg.toFixed(2)),
          frameP95Ms: Number(p95.toFixed(2)),
          loadMs: Math.round(performance.getEntriesByType("navigation")[0]?.loadEventEnd || 0),
          profile: ${JSON.stringify(profile.name)},
          viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
          canvas: canvas ? { width: canvas.width, height: canvas.height, clientWidth: canvas.clientWidth, clientHeight: canvas.clientHeight } : null,
          benchmark: window.__LAB_BENCHMARK__ ? window.__LAB_BENCHMARK__() : {},
          resources: performance.getEntriesByType("resource").map((item) => ({
            name: item.name.split("/").slice(-1)[0],
            transferSize: item.transferSize || 0,
            decodedBodySize: item.decodedBodySize || 0
          }))
        });
      }
    }
    requestAnimationFrame(sample);
  })`);

  const interaction = await evaluate(cdp, `new Promise((resolve) => {
    const before = window.__LAB_BENCHMARK__ ? window.__LAB_BENCHMARK__() : {};
    const start = performance.now();
    const mutated = window.__LAB_BENCH_MUTATE__ ? window.__LAB_BENCH_MUTATE__() : null;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const after = window.__LAB_BENCHMARK__ ? window.__LAB_BENCHMARK__() : {};
      const mutateLatencyMs = performance.now() - start;
      const resetStart = performance.now();
      const resetCall = window.__LAB_BENCH_RESET__ ? window.__LAB_BENCH_RESET__() : null;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const reset = window.__LAB_BENCHMARK__ ? window.__LAB_BENCHMARK__() : {};
        resolve({
          mutateLatencyMs: Number(mutateLatencyMs.toFixed(2)),
          resetLatencyMs: Number((performance.now() - resetStart).toFixed(2)),
          changed: JSON.stringify(before.state) !== JSON.stringify(after.state),
          resetOk: JSON.stringify(before.state) === JSON.stringify(reset.state),
          before: before.state,
          mutated: mutated?.state || null,
          after: after.state,
          reset: reset.state,
          resetCall: resetCall?.state || null
        });
      }));
    }));
  })`);

  const visual = await evaluate(cdp, `(() => {
    const canvas = document.querySelector("canvas");
    const panel = document.querySelector(".panel,.console");
    const panelRect = panel?.getBoundingClientRect();
    const gl = canvas?.getContext("webgl2") || canvas?.getContext("webgl");
    let lit = 0;
    let total = 0;
    let luma = 0;
    if (gl && canvas) {
      const pixel = new Uint8Array(4);
      for (let y = 1; y < 6; y += 1) {
        for (let x = 1; x < 9; x += 1) {
          total += 1;
          gl.readPixels(Math.floor(canvas.width * x / 9), Math.floor(canvas.height * y / 6), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
          const value = pixel[0] * 0.2126 + pixel[1] * 0.7152 + pixel[2] * 0.0722;
          luma += value;
          if (value > 18) lit += 1;
        }
      }
    }
    return {
      litSamples: lit,
      sampleCount: total,
      coveragePct: total ? Math.round(lit / total * 100) : 0,
      avgLuma: total ? Number((luma / total).toFixed(1)) : 0,
      panelInsideViewport: panelRect ? panelRect.left >= 0 && panelRect.right <= innerWidth && panelRect.top >= 0 && panelRect.bottom <= innerHeight : null
    };
  })()`);

  const resources = result.resources || [];
  const totalTransferKB = Math.round(resources.reduce((sum, item) => sum + item.transferSize, 0) / 1024);
  const benchmark = result.benchmark || {};
  const render = benchmark.renderer?.render || {};
  const memory = benchmark.renderer?.memory || {};
  const budgets = {
    noConsoleErrors: result.errors.length === 0,
    fpsOk: result.fpsAvg >= 55,
    p95FrameOk: result.frameP95Ms <= 25,
    pixelRatioOk: (benchmark.renderer?.pixelRatio || 99) <= 2,
    drawCallsOk: (render.calls || 0) <= 180,
    textureBudgetOk: (memory.textures || 0) <= 16,
    transferBudgetOk: totalTransferKB <= 900,
    canvasCoverageOk: visual.coveragePct >= 2,
    stateMutationOk: interaction.changed && interaction.resetOk,
    responsivePanelOk: visual.panelInsideViewport !== false,
  };

  const screenshot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const screenshotDir = join(root, target.split(/[\\/]/).slice(0, 2).join("/"), "screenshots");
  mkdirSync(screenshotDir, { recursive: true });
  writeFileSync(join(screenshotDir, `${profile.name}-benchmark.png`), Buffer.from(screenshot.data, "base64"));
  cdp.close();
  return {
    ...result,
    interaction,
    visual,
    resourceSummary: { count: resources.length, totalTransferKB },
    budgets,
    pass: Object.values(budgets).every(Boolean),
  };
}

const serverPort = await freePort();
const cdpPort = await freePort();
const userDataDir = join(tmpdir(), `threejs-lab-bench-${Date.now()}`);
mkdirSync(userDataDir, { recursive: true });
const server = await serve(serverPort);
const chrome = spawn(findChrome(), [
  `--remote-debugging-port=${cdpPort}`,
  `--user-data-dir=${userDataDir}`,
  "--headless=new",
  "--no-first-run",
  "--no-default-browser-check",
  "about:blank",
], { stdio: "ignore" });

try {
  await waitForChrome(cdpPort);
  const results = [];
  for (const target of targets) {
    for (const profile of profiles) results.push(await benchTarget(cdpPort, serverPort, target, profile));
  }
  console.log(JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
} finally {
  chrome.kill();
  server.close();
  try {
    rmSync(userDataDir, { recursive: true, force: true });
  } catch {
    // ponytail: temp cleanup can lag behind Chrome exit on Windows; OS temp cleanup is enough.
  }
}
