import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { createPlayback } from "./motion.js";

const params = new URLSearchParams(location.search);
const id = params.get("id");
const $ = (id) => document.getElementById(id);
const notify = (type, message) => parent.postMessage({ type, id, message }, location.origin);
let renderer, controls, controller, root, mixer;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, .01, 1000);
const materials = new Map();
function failure(message) {
  $("failure").hidden = false; $("failure").textContent = message;
  $("info").textContent = "Không tải được"; $("export").disabled = true;
  for (const element of document.querySelectorAll("#playback button, #parameters input")) element.disabled = true;
  renderer?.setAnimationLoop(null); notify("model-error", message);
}
try {
  const entry = params.get("entry");
  if (!/^\/artifacts\/[a-f\d-]+\/model\.(mjs|glb)$/.test(entry)) throw new Error("Invalid model URL");
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0xe9ede3);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  document.body.prepend(renderer.domElement);
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute("aria-label", "Mô hình 3D: kéo để xoay, mũi tên để di chuyển, Enter để tương tác ở tâm");
  controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true;
  controls.listenToKeyEvents(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x667554, 2.5));
  for (const [position, intensity] of [[[4, 6, 5], 3], [[-4, 2, -3], 2]]) {
    const light = new THREE.DirectionalLight(0xffffff, intensity); light.position.set(...position); scene.add(light);
  }
  const ambient = new THREE.AmbientLight(0xffffff, .25); scene.add(ambient);
  if (params.get("kind") === "blender") {
    const loaded = await new GLTFLoader().loadAsync(entry);
    root = loaded.scene;
    const behavior = params.get("behavior");
    if (behavior) {
      if (behavior !== entry.replace(/model\.glb$/, "behavior.mjs")) throw new Error("Behavior must belong to this model snapshot");
      const module = await import(behavior);
      controller = await module.createBehavior({ THREE, root, animations: loaded.animations, canvas: renderer.domElement, camera });
      if (!controller || typeof controller !== "object") throw new Error("createBehavior must return a controller");
    } else if (loaded.animations.length) {
      // Legacy asset-only snapshots remain readable; new Blender submissions require behavior source.
      mixer = new THREE.AnimationMixer(root); mixer.clipAction(loaded.animations[0]).play();
    }
  } else {
    const module = await import(entry);
    controller = await module.createModel({ THREE, canvas: renderer.domElement, camera });
    root = controller?.isObject3D ? controller : controller?.root;
  }
  if (!root?.isObject3D) throw new Error("createModel must return a THREE.Group or { root, update?, dispose? }");
  scene.add(root); root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  if (bounds.isEmpty() || ![...size].every(Number.isFinite) || size.length() < 1e-9) throw new Error("Model has no visible finite geometry");
  const playback = createPlayback(controller, mixer);
  playback.reset();
  const parameterInputs = [];
  $("playback").hidden = !playback.active && !controller?.onPick && !playback.parameters.length;
  $("play").hidden = !playback.active;
  $("play").onclick = () => { $("play").textContent = playback.toggle() ? "Tạm dừng" : "Tiếp tục"; };
  $("restart").onclick = () => {
    try { playback.reset(); for (const [input, output, p] of parameterInputs) { input.value = p.value; output.value = p.value; } }
    catch (e) { failure(e.message); }
  };
  for (const p of playback.parameters) {
    const label = document.createElement("label"), input = document.createElement("input"), output = document.createElement("output");
    const title = document.createElement("span"); title.textContent = p.label;
    input.type = "range"; input.min = p.min; input.max = p.max; input.step = p.step; input.value = p.value;
    input.setAttribute("aria-label", p.label); output.value = p.value;
    input.oninput = () => { try { playback.setParameter(p.id, Number(input.value)); output.value = input.value; } catch (e) { failure(e.message); } };
    label.append(title, input, output); $("parameters").append(label); parameterInputs.push([input, output, p]);
  }
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  let pointerStart;
  const pick = (x, y) => {
    if (!controller?.onPick) return;
    try {
      pointer.set(x, y); raycaster.setFromCamera(pointer, camera); root.updateMatrixWorld(true);
      const hit = raycaster.intersectObject(root, true)[0]; if (hit) controller.onPick(hit);
    } catch (e) { failure(e.message); }
  };
  renderer.domElement.addEventListener("pointerdown", e => { pointerStart = { x: e.clientX, y: e.clientY, id: e.pointerId, button: e.button }; });
  renderer.domElement.addEventListener("pointerup", e => {
    if (pointerStart?.id === e.pointerId && pointerStart.button === 0 && Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) < 5) {
      const rect = renderer.domElement.getBoundingClientRect(); pick((e.clientX - rect.left) / rect.width * 2 - 1, 1 - (e.clientY - rect.top) / rect.height * 2);
    }
    pointerStart = undefined;
  });
  renderer.domElement.addEventListener("pointercancel", () => { pointerStart = undefined; });
  renderer.domElement.addEventListener("keydown", e => { if (["Enter", " "].includes(e.key)) { e.preventDefault(); pick(0, 0); } });
  let meshCount = 0, portable = !mixer;
  root.traverse((object) => {
    if (!object.isMesh) return;
    if (object.isSkinnedMesh) portable = false;
    meshCount++;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.set(material, material.wireframe);
      if (material.isShaderMaterial || material.isRawShaderMaterial || material.userData?.requiresBaking || material.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile) portable = false;
    }
  });
  if (!meshCount) throw new Error("Model contains no meshes");
  controls.target.copy(center);
  const distance = Math.max(size.x, size.y, size.z) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  camera.near = Math.max(distance / 1000, .00001); camera.far = distance * 100;
  let framingScale = 1;
  const view = (x, y, z) => { camera.position.copy(center).add(new THREE.Vector3(x, y, z).normalize().multiplyScalar(distance * framingScale)); controls.update(); };
  $("front").onclick = () => view(0, .08, 1);
  $("side").onclick = () => view(1, .08, 0);
  $("back").onclick = () => view(0, .08, -1);
  $("reset").onclick = () => view(1, .65, 1.4);
  $("wire").onclick = () => {
    const enabled = $("wire").getAttribute("aria-pressed") !== "true";
    for (const [material, original] of materials) material.wireframe = enabled || original;
    $("wire").setAttribute("aria-pressed", String(enabled));
  };
  $("rotate").onclick = () => { controls.autoRotate = !controls.autoRotate; $("rotate").setAttribute("aria-pressed", String(controls.autoRotate)); };
  $("fullscreen").onclick = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { $("note").hidden = false; $("note").textContent = "Trình duyệt không cho phép toàn màn hình."; }
  };
  document.addEventListener("fullscreenchange", () => $("fullscreen").setAttribute("aria-label", document.fullscreenElement ? "Thoát toàn màn hình" : "Toàn màn hình"));
  $("export").disabled = !portable;
  const interactive = playback.active || controller?.onPick || playback.parameters.length;
  $("export").textContent = interactive ? "GLB tĩnh ↓" : "GLB ↓";
  if (!portable) { $("note").hidden = false; $("note").textContent = "Shader/rig cần xuất từ source gốc."; }
  $("export").onclick = async () => {
    $("export").disabled = true;
    try {
      // Export only authored content; lights, floor and inspection helpers remain in the viewer.
      const output = root.clone(true);
      const omitted = []; output.traverse((o) => { if (o.userData.excludeFromExport) omitted.push(o); });
      for (const o of omitted) o.removeFromParent();
      const bytes = await new GLTFExporter().parseAsync(output, { binary: true });
      const url = URL.createObjectURL(new Blob([bytes], { type: "model/gltf-binary" }));
      const a = document.createElement("a"); a.href = url; a.download = "model.glb"; a.hidden = true;
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (interactive) { $("note").hidden = false; $("note").textContent = "GLB tĩnh đã xuất; tải thêm source để giữ tương tác."; }
    } catch (e) { $("note").hidden = false; $("note").textContent = "Xuất GLB thất bại: " + e.message; }
    finally { $("export").disabled = false; }
  };
  const resize = () => {
    const width = innerWidth, height = innerHeight;
    const top = $("tools").getBoundingClientRect().bottom + 12;
    const bottom = height - $("bottom").getBoundingClientRect().top + 12;
    const available = Math.max(height - top - bottom, height * .2);
    // Fit within the unobscured 80% of the viewport, including wrapped mobile controls.
    framingScale = Math.max(height / available, height / width) / (2 * .8);
    renderer.setSize(width, height); camera.aspect = width / height;
    camera.setViewOffset(width, height, 0, (bottom - top) / 2, width, height);
    view(1, .65, 1.4);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(document.documentElement);
  observer.observe($("tools")); observer.observe($("bottom"));
  resize();
  let last = performance.now(), first = true;
  renderer.setAnimationLoop((time) => {
    try {
      const delta = Math.min(Math.max((time - last) / 1000, 0), .05); last = time;
      if (!document.hidden) playback.step(delta);
      controls.update(); renderer.render(scene, camera);
      if (first) { first = false; notify("model-ready"); $("info").textContent = `${renderer.info.render.triangles.toLocaleString()} tris · ${renderer.info.render.calls} draw calls`; }
    } catch (e) { failure(e.message); }
  });
  renderer.domElement.addEventListener("webglcontextlost", (event) => { event.preventDefault(); failure("WebGL bị gián đoạn. Hãy tải lại bản xem."); });
  window.addEventListener("pagehide", () => {
    observer.disconnect(); renderer.setAnimationLoop(null); controls.dispose(); mixer?.stopAllAction();
    controller?.dispose?.();
    if (params.get("kind") === "blender" || typeof controller?.dispose !== "function") {
      const resources = new Set(); root.traverse((o) => { if (o.geometry) resources.add(o.geometry); });
      for (const [material] of materials) { resources.add(material); for (const value of Object.values(material)) if (value?.isTexture) resources.add(value); }
      for (const resource of resources) resource.dispose();
    }
    renderer.dispose(); renderer.forceContextLoss();
  }, { once: true });
} catch (e) { failure(e.message); }
