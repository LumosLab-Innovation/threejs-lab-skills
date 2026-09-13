import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, rm, mkdir, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { init, load, addModel, artifactPath } from "../plugins/threejs-lab/skills/threejs-studio/scripts/state.mjs";
import { start } from "../plugins/threejs-lab/skills/threejs-studio/scripts/server.mjs";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==", "base64");

async function fixture(t, engine = "threejs") {
  const dir = await mkdtemp(join(tmpdir(), "threejs-studio-test-"));
  await init(dir, "QA fixture, never a user-approved design", engine);
  const live = await start(dir);
  t.after(async () => { await new Promise((resolve) => live.server.close(resolve)); await rm(dir, { recursive: true, force: true }); });
  const html = await (await fetch(live.origin)).text();
  const token = html.match(/name="review-key" content="([a-f\d]+)"/)[1];
  const post = async (route, value, headers = {}) => {
    const response = await fetch(live.origin + route, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(value) });
    return { code: response.status, data: await response.json() };
  };
  const agent = (value) => post("/api/agent", value, { "X-Agent-Key": live.agentKey });
  const review = (value) => post("/api/decision", value, { Origin: live.origin, "X-Review-Key": token });
  const file = join(dir, "input.png"); await writeFile(file, png);
  const result = await agent({ action: "add-image", file, title: "Fixture image", provenance: "test fixture" });
  assert.equal(result.code, 200);
  return { dir, live, file, image: result.data, post, agent, review, token };
}

test("image approval is mandatory; snapshots persist and stale/repeated approvals fail", async (t) => {
  const f = await fixture(t);
  await assert.rejects(start(f.dir), /already owns/);
  const model = join(f.dir, "model.ts");
  await writeFile(model, "import {Group,Mesh,BoxGeometry,MeshStandardMaterial} from 'three'; export function createModel(){const root=new Group();root.add(new Mesh(new BoxGeometry(),new MeshStandardMaterial()));return root;}");
  const input = { action: "add-model", file: model, title: "Fixture model", reference: f.image.sha256 };
  assert.equal((await f.agent(input)).code, 400);
  const approval = { action: "approve-image", id: f.image.id, sha256: f.image.sha256, revision: 1, engine: "threejs" };
  assert.equal((await f.review(approval)).code, 200);
  assert.equal((await f.review(approval)).code, 400);
  assert.equal((await f.agent({ ...input, reference: "wrong" })).code, 400);
  const submitted = await f.agent(input); assert.equal(submitted.code, 200, JSON.stringify(submitted.data));
  const candidate = submitted.data;
  const decision = { action: "approve-model", id: candidate.id, sha256: candidate.sha256, revision: 3 };
  assert.equal((await f.review(decision)).code, 400); // No working preview evidence yet.
  await f.post("/api/viewed", { id: candidate.id, sha256: candidate.sha256 }, { Origin: f.live.origin, "X-Review-Key": f.token });
  assert.equal((await f.review(decision)).code, 200);
  assert.equal((await load(f.dir)).stage, "accepted");
  const snapshot = await readFile(join(f.dir, candidate.entry), "utf8");
  await writeFile(model, "export function createModel(){throw Error('new working source');}");
  assert.equal(await readFile(join(f.dir, candidate.entry), "utf8"), snapshot);
  assert.equal((await f.agent(input)).code, 400); // Explicit revision required after acceptance.
  await f.review({ action: "revise", target: "model", note: "Adjust silhouette", revision: 4 });
  const current = await load(f.dir); assert.equal(current.stage, "building"); assert.equal(current.models.length, 1);
  assert.equal(current.modelApproval, null); assert.equal(current.imageApproval.sha256, f.image.sha256);
  assert.equal((await f.review({ ...decision, revision: current.revision })).code, 400); // Prior round cannot be approved.
  await f.review({ action: "revise", target: "image", note: "Different direction", revision: current.revision });
  assert.equal((await load(f.dir)).imageApproval, null);
  assert.equal((await f.agent(input)).code, 400);
});

test("preview is sandboxed; foreign origins, forged approvals and unregistered files are refused", async (t) => {
  const f = await fixture(t);
  const decision = { action: "approve-image", id: f.image.id, sha256: f.image.sha256, revision: 1, engine: "threejs" };
  assert.equal((await f.post("/api/decision", decision, { Origin: "https://outside.example", "X-Review-Key": f.token })).code, 400);
  assert.equal((await f.post("/api/decision", decision, { Origin: "null", "X-Review-Key": f.token })).code, 400);
  assert.equal((await f.post("/api/decision", decision, { Origin: f.live.origin, "X-Agent-Key": f.live.agentKey })).code, 400);
  assert.equal((await fetch(f.live.origin + "/api/state", { headers: { Origin: "null" } })).status, 400);
  assert.equal((await fetch(f.live.origin + "/studio.json")).status, 404);
  assert.equal((await fetch(f.live.origin + "/.session.json")).status, 404);
  assert.equal((await fetch(f.live.origin + "/artifacts/not-registered.png")).status, 400);
  assert.equal((await fetch(f.live.origin + "/" + f.image.file)).headers.get("access-control-allow-origin"), "*");
  const html = await (await fetch(f.live.origin)).text();
  assert.match(html, /sandbox="allow-scripts allow-downloads"/);
  assert.doesNotMatch(html, /allow-same-origin/);
  await mkdir(join(f.dir, "link"));
  const outside = await mkdtemp(join(tmpdir(), "threejs-outside-"));
  try {
    await writeFile(join(outside, "secret.txt"), "fixture only");
    await symlink(outside, join(f.dir, "link", "escape"), "junction");
    await assert.rejects(artifactPath(f.dir, "link/escape/secret.txt"), /escaped/);
  } finally { await rm(outside, { recursive: true, force: true }); }
});

export function glbFixture(extra = {}) {
  const gltf = { asset: { version: "2.0" }, scenes: [{ nodes: [0] }], scene: 0,
    nodes: [{ mesh: 0 }], meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
    buffers: [{ byteLength: 36 }], bufferViews: [{ buffer: 0, byteLength: 36 }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: "VEC3", min: [-1, 0, 0], max: [1, 1, 0] }], ...extra };
  const raw = Buffer.from(JSON.stringify(gltf));
  const json = Buffer.concat([raw, Buffer.alloc((4 - raw.length % 4) % 4, 32)]);
  const binary = Buffer.from(new Float32Array([-1, 0, 0, 1, 0, 0, 0, 1, 0]).buffer);
  const result = Buffer.alloc(12 + 8 + json.length + 8 + binary.length);
  result.write("glTF"); result.writeUInt32LE(2, 4); result.writeUInt32LE(result.length, 8);
  result.writeUInt32LE(json.length, 12); result.writeUInt32LE(0x4e4f534a, 16); json.copy(result, 20);
  result.writeUInt32LE(binary.length, 20 + json.length); result.writeUInt32LE(0x004e4942, 24 + json.length); binary.copy(result, 28 + json.length);
  return result;
}

test("Blender requires bundled Three.js behavior and protects the combined snapshot", async (t) => {
  const f = await fixture(t, "blender");
  assert.equal((await f.review({ action: "approve-image", id: f.image.id, sha256: f.image.sha256, revision: 1, engine: "blender" })).code, 200);
  const source = join(f.dir, "fixture.glb"); await writeFile(source, glbFixture());
  const input = { action: "add-model", file: source, title: "GLB fixture", reference: f.image.sha256 };
  assert.equal((await f.agent(input)).code, 400); // A bare asset is not the complete deliverable.
  input.behavior = join(f.dir, "behavior.ts");
  await writeFile(input.behavior, "export function wrongExport() {}");
  assert.equal((await f.agent(input)).code, 400);
  await writeFile(input.behavior, "export function createBehavior({root}){return {update(dt,time){root.rotation.y=time;},reset(){root.rotation.y=0;}}}");
  const submitted = await f.agent(input);
  assert.equal(submitted.code, 200, JSON.stringify(submitted.data));
  const candidate = submitted.data;
  assert.equal(candidate.files.length, 3);
  const snapshot = await readFile(join(f.dir, candidate.behavior), "utf8");
  await writeFile(input.behavior, "export function createBehavior(){return {};}");
  assert.equal(await readFile(join(f.dir, candidate.behavior), "utf8"), snapshot);
  assert.equal((await fetch(f.live.origin + "/motion.js")).status, 200);
  await f.post("/api/viewed", { id: candidate.id, sha256: candidate.sha256 }, { Origin: f.live.origin, "X-Review-Key": f.token });
  await writeFile(join(f.dir, candidate.behavior), snapshot + "\n// tampered");
  const decision = { action: "approve-model", id: candidate.id, sha256: candidate.sha256, revision: 3 };
  assert.equal((await f.review(decision)).code, 400);
  await writeFile(join(f.dir, candidate.behavior), snapshot);
  await writeFile(source, glbFixture({ images: [{ uri: "https://outside.example/image.png" }] }));
  assert.equal((await f.agent(input)).code, 400);
  await writeFile(source, glbFixture());
  await writeFile(join(f.dir, f.image.file), "tampered");
  await assert.rejects(addModel(f.dir, await load(f.dir), input), /changed on disk/);
  await writeFile(join(f.dir, f.image.file), png);
  assert.equal((await f.review(decision)).code, 200);
});
