import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, rename, realpath } from "node:fs/promises";
import { join, resolve, relative, isAbsolute, extname } from "node:path";

export function requireValue(value, message) {
  if (!value) throw new Error(message);
}
export function text(value, name, limit = 4000) {
  requireValue(typeof value === "string" && value.trim() && value.length <= limit, `Invalid ${name}`);
  return value.trim();
}
export function engine(value) {
  requireValue(["threejs", "blender"].includes(value), "Engine must be threejs or blender");
  return value;
}
export const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
export const load = async (dir) => JSON.parse(await readFile(join(dir, "studio.json"), "utf8"));

export async function save(dir, state) {
  const pending = join(dir, `.${randomUUID()}.json`);
  await writeFile(pending, JSON.stringify(state, null, 2) + "\n", { mode: 0o600 });
  await rename(pending, join(dir, "studio.json"));
}

export async function init(dir, prompt, selectedEngine = "threejs") {
  const state = {
    schemaVersion: 1, id: randomUUID(), prompt: text(prompt, "prompt"), engine: engine(selectedEngine),
    revision: 0, stage: "awaiting_images", imageRound: 1, modelRound: 1,
    images: [], models: [], imageApproval: null, modelApproval: null, feedback: [],
  };
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "studio.json"), JSON.stringify(state, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  return state;
}

// Serve only registered snapshots, never an arbitrary project directory or a symlink escape.
export async function artifactPath(dir, file) {
  requireValue(typeof file === "string" && !file.includes("\\") && !isAbsolute(file), "Invalid artifact path");
  const root = await realpath(dir);
  const result = await realpath(resolve(root, file));
  const rel = relative(root, result);
  requireValue(rel && !rel.startsWith("..") && !isAbsolute(rel), "Artifact escaped workspace");
  return result;
}

async function snapshot(dir, id, name, bytes) {
  requireValue(/^[\w./-]+$/.test(name) && !name.split("/").includes(".."), "Invalid snapshot name");
  const file = `artifacts/${id}/${name}`;
  await mkdir(join(dir, "artifacts", id), { recursive: true });
  const destination = resolve(dir, file);
  // No existing paths are overwritten, even when the agent reuses an input filename.
  await writeFile(destination, bytes, { flag: "wx" });
  return { file, sha256: hash(bytes), bytes: bytes.length };
}

function imageExtension(bytes) {
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return ".png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return ".jpg";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return ".webp";
  throw new Error("Image must be PNG, JPEG or WebP (SVG/HTML are not accepted)");
}

export async function addImage(dir, state, input) {
  requireValue(!state.imageApproval, "Reference is already approved; request a new reference in the studio first");
  const bytes = await readFile(text(input.file, "file"));
  requireValue(bytes.length <= 25 * 1024 * 1024, "Image exceeds 25 MB");
  const extension = imageExtension(bytes);
  const id = randomUUID();
  const item = { id, title: text(input.title, "title", 120), round: state.imageRound,
    provenance: text(input.provenance, "image provenance", 1000),
    ...await snapshot(dir, id, `reference${extension}`, bytes) };
  state.images.push(item);
  state.stage = "image_review";
  state.revision++;
  await save(dir, state);
  return item;
}

export async function approvedReference(dir, state) {
  requireValue(state.imageApproval, "Approve a reference image in the browser before building 3D");
  const item = state.images.find((image) => image.id === state.imageApproval.id);
  requireValue(item && hash(await readFile(await artifactPath(dir, item.file))) === state.imageApproval.sha256,
    "Approved reference changed on disk; restore it or request a new reference");
  return item;
}

export async function addModel(dir, state, input) {
  const reference = await approvedReference(dir, state);
  requireValue(input.reference === reference.sha256, "Model reference hash does not match the approved image");
  requireValue(["building", "model_review"].includes(state.stage), "Request changes before adding another model");
  const title = text(input.title, "title", 120);
  const source = text(input.file, "file");
  const id = randomUUID();
  const files = [];
  let entry;
  if (state.engine === "threejs") {
    requireValue([".mjs", ".js", ".ts"].includes(extname(source)), "Three.js input must be an ESM JS/TS module exporting createModel");
    const { build } = await import("esbuild");
    const result = await build({ entryPoints: [resolve(source)], bundle: true, write: false,
      format: "esm", platform: "browser", external: ["three", "three/*"], metafile: true,
      loader: { ".png": "dataurl", ".jpg": "dataurl", ".webp": "dataurl" }, logLevel: "silent" });
    requireValue(result.metafile.outputs[Object.keys(result.metafile.outputs)[0]].exports.includes("createModel"),
      "Module must export createModel");
    entry = await snapshot(dir, id, "model.mjs", result.outputFiles[0].contents);
    files.push(entry);
    // Preserve every compiled source for editing/export, without serving the user's other files.
    const sources = {};
    for (const filename of Object.keys(result.metafile.inputs)) {
      requireValue(!filename.includes("node_modules"), "Keep model dependencies to Three.js and local source files");
      sources[filename] = (await readFile(resolve(filename))).toString("base64");
    }
    files.push(await snapshot(dir, id, "sources.json", Buffer.from(JSON.stringify(sources, null, 2))));
  } else {
    const bytes = await readFile(source);
    requireValue(bytes.length <= 100 * 1024 * 1024 && bytes.length >= 20 &&
      bytes.toString("ascii", 0, 4) === "glTF" && bytes.readUInt32LE(4) === 2 &&
      bytes.readUInt32LE(8) === bytes.length, "Expected a valid GLB v2, at most 100 MB");
    const jsonLength = bytes.readUInt32LE(12);
    requireValue(bytes.readUInt32LE(16) === 0x4e4f534a && jsonLength <= bytes.length - 20, "Invalid GLB JSON chunk");
    const gltf = JSON.parse(bytes.toString("utf8", 20, 20 + jsonLength));
    requireValue([...(gltf.buffers || []), ...(gltf.images || [])].every((part) => !part.uri || part.uri.startsWith("data:")),
      "GLB must embed buffers/textures; external URLs are not allowed");
    entry = await snapshot(dir, id, "model.glb", bytes);
    files.push(entry);
    if (input.blend) {
      const blend = await readFile(input.blend);
      requireValue(blend.toString("ascii", 0, 7) === "BLENDER", "Invalid uncompressed .blend file");
      files.push(await snapshot(dir, id, "model.blend", blend));
    }
  }
  const item = { id, title, engine: state.engine, round: state.modelRound,
    reference: reference.sha256, entry: entry.file, sha256: entry.sha256, files };
  state.models.push(item);
  state.stage = "model_review";
  state.revision++;
  await save(dir, state);
  return item;
}

export async function decide(dir, state, input, viewed) {
  requireValue(input.revision === state.revision, "Studio changed; refresh before deciding");
  if (input.action === "approve-image") {
    requireValue(state.stage === "image_review", "No image awaiting approval");
    const item = state.images.find((x) => x.id === input.id && x.round === state.imageRound);
    requireValue(item && input.sha256 === item.sha256, "Image is not in this review round");
    requireValue(hash(await readFile(await artifactPath(dir, item.file))) === item.sha256, "Image changed on disk");
    state.imageApproval = { id: item.id, sha256: item.sha256, at: new Date().toISOString(), source: "browser" };
    state.engine = engine(input.engine);
    state.stage = "building";
  } else if (input.action === "approve-model") {
    requireValue(state.stage === "model_review", "No model awaiting approval");
    const item = state.models.find((x) => x.id === input.id && x.round === state.modelRound);
    requireValue(item && input.sha256 === item.sha256 && viewed.has(item.id), "Open a working 3D preview before approving");
    await approvedReference(dir, state);
    for (const file of item.files) requireValue(hash(await readFile(await artifactPath(dir, file.file))) === file.sha256, "Model changed on disk");
    state.modelApproval = { id: item.id, sha256: item.sha256, at: new Date().toISOString(), source: "browser" };
    state.stage = "accepted";
  } else if (input.action === "revise") {
    requireValue(["image_review", "building", "model_review", "accepted"].includes(state.stage), "Nothing to revise yet");
    requireValue(["image", "model"].includes(input.target), "Select image or model");
    state.feedback.push({ target: input.target, note: text(input.note, "feedback", 2000), at: new Date().toISOString() });
    if (input.target === "image") {
      state.imageRound++;
      state.imageApproval = null;
      state.stage = "awaiting_images";
    } else {
      requireValue(state.imageApproval, "Approve an image first");
      state.stage = "building";
    }
    state.modelRound++;
    state.modelApproval = null;
  } else throw new Error("Unknown decision");
  state.revision++;
  await save(dir, state);
}

export function next(state) {
  const actions = { awaiting_images: "generate_images", image_review: "wait_for_user_image_approval",
    building: "build_model", model_review: "wait_for_user_model_approval", accepted: "deliver" };
  return { ...state, nextAction: actions[state.stage] };
}
