import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { load, next, addImage, addModel, decide, artifactPath, requireValue } from "./state.mjs";

const skillRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".glb": "model/gltf-binary" };

function send(res, code, body, type = "application/json") {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

async function body(req) {
  let content = "";
  for await (const chunk of req) {
    content += chunk;
    requireValue(content.length < 16000, "Request too large");
  }
  return JSON.parse(content);
}

export async function start(dir, { port = 0, sessionFile = true } = {}) {
  const state = await load(dir);
  const threeRoot = dirname(dirname(require.resolve("three")));
  const agentKey = randomBytes(32).toString("hex");
  const reviewKey = randomBytes(32).toString("hex");
  const sessionPath = join(dir, ".session.json");
  const session = { id: state.id, agentKey, pid: process.pid };
  const release = async () => {
    if (!sessionFile) return;
    try { if (JSON.parse(await readFile(sessionPath, "utf8")).agentKey === agentKey) await unlink(sessionPath); }
    catch { /* A moved workspace or an already-removed session needs no cleanup. */ }
  };
  if (sessionFile) {
    try { await writeFile(sessionPath, JSON.stringify(session), { flag: "wx", mode: 0o600 }); }
    catch (e) {
      if (e.code !== "EEXIST") throw e;
      const old = JSON.parse(await readFile(sessionPath, "utf8"));
      requireValue(Number.isInteger(old.pid) && old.pid > 0, "Invalid session file; inspect it before restarting");
      let alive = true;
      try { process.kill(old.pid, 0); } catch (error) { if (error.code === "ESRCH") alive = false; }
      requireValue(!alive, "A studio already owns this workspace. Use its URL or stop it first.");
      await unlink(sessionPath);
      await writeFile(sessionPath, JSON.stringify(session), { flag: "wx", mode: 0o600 });
    }
  }
  const viewed = new Set();
  let origin;
  // One local session owns the journal; serialize writes from the CLI and browser.
  let queue = Promise.resolve();
  const serial = (operation) => {
    const result = queue.then(operation);
    queue = result.catch(() => {});
    return result;
  };
  const server = createServer(async (req, res) => {
    try {
      requireValue(req.headers.host === new URL(origin).host, "Invalid host");
      const pathname = new URL(req.url, origin).pathname;
      if (req.method === "GET" && pathname === "/health") return send(res, 200, { id: state.id });
      if (pathname.startsWith("/api/")) {
        // The review iframe has an opaque origin and cannot read or write this API.
        requireValue(!req.headers.origin || req.headers.origin === origin, "Cross-origin API request refused");
        if (req.method === "GET" && pathname === "/api/state") return send(res, 200, next(await load(dir)));
        requireValue(req.method === "POST", "Unsupported API method");
        const input = await body(req);
        if (pathname === "/api/agent") {
          requireValue(req.headers["x-agent-key"] === agentKey, "Invalid CLI session");
          const result = await serial(async () => {
            const current = await load(dir);
            if (input.action === "add-image") return addImage(dir, current, input);
            if (input.action === "add-model") return addModel(dir, current, input);
            if (input.action === "stop") { setTimeout(() => server.close(), 50); return { stopped: true }; }
            throw new Error("Unknown CLI action");
          });
          return send(res, 200, result);
        }
        requireValue(req.headers.origin === origin && req.headers["x-review-key"] === reviewKey, "Use the studio to review");
        if (pathname === "/api/viewed") {
          const current = await load(dir);
          requireValue(current.models.some((m) => m.id === input.id && m.sha256 === input.sha256), "Unknown preview");
          viewed.add(input.id);
          return send(res, 200, { ready: true });
        }
        requireValue(pathname === "/api/decision", "Unknown API endpoint");
        await serial(async () => decide(dir, await load(dir), input, viewed));
        return send(res, 200, next(await load(dir)));
      }
      requireValue(req.method === "GET", "Unsupported method");
      if (pathname === "/" || pathname === "/index.html") {
        const html = (await readFile(join(skillRoot, "web", "index.html"), "utf8")).replace("__REVIEW_KEY__", reviewKey);
        res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
        return send(res, 200, html, types[".html"]);
      }
      const webFiles = new Set(["/app.js", "/style.css", "/viewer.html", "/viewer.js", "/motion.js"]);
      let file;
      if (webFiles.has(pathname)) {
        file = join(skillRoot, "web", pathname.slice(1));
      } else if (pathname === "/vendor/three.js") {
        file = join(threeRoot, "build", "three.module.js");
      } else if (pathname === "/vendor/three.core.js") {
        file = join(threeRoot, "build", "three.core.js");
      } else if (/^\/vendor\/addons\/[\w/-]+\.js$/.test(pathname) && !pathname.includes("..")) {
        file = join(threeRoot, "examples", "jsm", pathname.slice("/vendor/addons/".length));
      } else if (pathname.startsWith("/artifacts/")) {
        const current = await load(dir);
        const name = decodeURIComponent(pathname.slice(1));
        const registered = [...current.images.map((i) => i.file), ...current.models.flatMap((m) => m.files.map((f) => f.file))];
        requireValue(registered.includes(name), "Unknown artifact");
        file = await artifactPath(dir, name);
        if (name.endsWith(".json") || name.endsWith(".blend")) res.setHeader("Content-Disposition", "attachment");
      } else return send(res, 404, { error: "Not found" });
      if (pathname !== "/app.js" && pathname !== "/style.css") {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      }
      if (pathname === "/viewer.html") {
        res.setHeader("Content-Security-Policy", `default-src 'none'; script-src 'unsafe-inline' ${origin}; style-src 'unsafe-inline'; connect-src ${origin}; img-src ${origin} data: blob:; worker-src 'none'; object-src 'none'; base-uri 'none'`);
      }
      const ext = file.slice(file.lastIndexOf("."));
      return send(res, 200, await readFile(file), types[ext] || "application/octet-stream");
    } catch (error) {
      send(res, error.code === "ENOENT" ? 404 : 400, { error: error.code === "ENOENT" ? "File not found" : error.message });
    }
  });
  try { await new Promise((resolve, reject) => { server.once("error", reject); server.listen(port, "127.0.0.1", resolve); }); }
  catch (error) { await release(); throw error; }
  origin = `http://127.0.0.1:${server.address().port}`;
  if (sessionFile) {
    server.on("close", release);
    try { await writeFile(sessionPath, JSON.stringify({ ...session, origin }), { mode: 0o600 }); }
    catch (error) { server.close(); throw error; }
  }
  return { server, origin, agentKey };
}
