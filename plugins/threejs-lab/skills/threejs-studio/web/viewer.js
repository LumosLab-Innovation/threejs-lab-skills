import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

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
  renderer.domElement.setAttribute("aria-label", "Mô hình 3D: kéo để xoay, phím mũi tên để di chuyển");
  controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true;
  controls.listenToKeyEvents(window);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x667554, 2.5));
  for (const [position, intensity] of [[[4, 6, 5], 3], [[-4, 2, -3], 2]]) {
    const light = new THREE.DirectionalLight(0xffffff, intensity); light.position.set(...position); scene.add(light);
  }
  const ambient = new THREE.AmbientLight(0xffffff, .25); scene.add(ambient);
  if (params.get("kind") === "blender") {
    const loaded = await new GLTFLoader().loadAsync(entry);
    root = loaded.scene;
    if (loaded.animations.length) { mixer = new THREE.AnimationMixer(root); mixer.clipAction(loaded.animations[0]).play(); }
  } else {
    const module = await import(entry);
    controller = await module.createModel({ THREE });
    root = controller?.isObject3D ? controller : controller?.root;
  }
  if (!root?.isObject3D) throw new Error("createModel must return a THREE.Group or { root, update?, dispose? }");
  scene.add(root); root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  if (bounds.isEmpty() || ![...size].every(Number.isFinite) || size.length() < 1e-9) throw new Error("Model has no visible finite geometry");
  let meshCount = 0, portable = !mixer && typeof controller?.update !== "function";
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
  const view = (x, y, z) => { camera.position.copy(center).add(new THREE.Vector3(x, y, z).normalize().multiplyScalar(distance / Math.min(camera.aspect, 1))); controls.update(); };
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
  if (!portable) { $("note").hidden = false; $("note").textContent = "Shader/animation cần xuất từ source gốc; dùng tệp tải bên dưới."; }
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
    } catch (e) { $("note").hidden = false; $("note").textContent = "Xuất GLB thất bại: " + e.message; }
    finally { $("export").disabled = false; }
  };
  const observer = new ResizeObserver(() => {
    const width = innerWidth, height = innerHeight;
    renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix();
    view(1, .65, 1.4);
  });
  observer.observe(document.documentElement);
  renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); view(1, .65, 1.4);
  let last = performance.now(), first = true;
  renderer.setAnimationLoop((time) => {
    try {
      const delta = Math.min(Math.max((time - last) / 1000, 0), .05); last = time;
      mixer?.update(delta); controller?.update?.(delta, time / 1000); controls.update(); renderer.render(scene, camera);
      if (first) { first = false; notify("model-ready"); $("info").textContent = `${renderer.info.render.triangles.toLocaleString()} tris · ${renderer.info.render.calls} draw calls`; }
    } catch (e) { failure(e.message); }
  });
  renderer.domElement.addEventListener("webglcontextlost", (event) => { event.preventDefault(); failure("WebGL bị gián đoạn. Hãy tải lại bản xem."); });
  window.addEventListener("pagehide", () => {
    observer.disconnect(); renderer.setAnimationLoop(null); controls.dispose(); mixer?.stopAllAction();
    if (typeof controller?.dispose === "function") controller.dispose();
    else {
      const resources = new Set(); root.traverse((o) => { if (o.geometry) resources.add(o.geometry); });
      for (const [material] of materials) { resources.add(material); for (const value of Object.values(material)) if (value?.isTexture) resources.add(value); }
      for (const resource of resources) resource.dispose();
    }
    renderer.dispose(); renderer.forceContextLoss();
  }, { once: true });
} catch (e) { failure(e.message); }
