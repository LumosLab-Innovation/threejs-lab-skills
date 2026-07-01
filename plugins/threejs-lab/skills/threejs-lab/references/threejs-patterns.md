# Three.js Lab Patterns

## Scene Setup

Use existing project helpers first. For plain Three.js, keep the setup boring:

```ts
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(4, 3, 6);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
```

Resize from the canvas parent, not always from `window.innerWidth`, when the lab sits inside a panel:

```ts
function resize() {
  const { clientWidth: width, clientHeight: height } = container;
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
resize();
```

## Materials And Lighting

- Use `MeshStandardMaterial` for most lab objects.
- Use `MeshPhysicalMaterial` only when glass, clearcoat, transmission, or sheen is visible and useful.
- Add one soft ambient/hemisphere light plus one directional/key light before adding extra lights.
- Enable shadows only when they help depth perception; configure map size and camera bounds intentionally.
- For environment lighting, load HDR/EXR only when already available or important to the result.

## Geometry

- Prefer built-in geometries for simple primitives and teaching aids.
- Use `BufferGeometry` only when vertices are data-driven or custom.
- Use `InstancedMesh` for repeated particles, molecules, field markers, bolts, or tiles.
- Keep lab scale consistent: pick a scene unit and use it in labels/readouts.

## GLTF/GLB Loading

```ts
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
try {
  const gltf = await loader.loadAsync("/models/example.glb");
  scene.add(gltf.scene);
} catch (error) {
  console.error("Failed to load model", error);
}
```

- Add `DRACOLoader` or `KTX2Loader` only when the asset actually uses that compression.
- Center and frame loaded models with `Box3`.
- If a model has animations, create one `AnimationMixer` per animated root and update it with clock delta.
- Keep public asset paths stable: `/models/foo.glb` for Vite/Next public folders, not relative imports unless the bundler pattern already exists.

## Animation

Use one clock and delta-based updates:

```ts
const clock = new THREE.Clock();
function frame() {
  const delta = clock.getDelta();
  controls.update();
  mixer?.update(delta);
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}
```

For React Three Fiber, use `useFrame` and project-local cleanup patterns. Do not add R3F to a project that already uses plain Three.js for one canvas.

## Interaction

- Use `Raycaster` for picking, hover, drag targets, and measurement probes.
- Convert pointer coordinates from the canvas bounding rect, not the full window.
- Keep selected/hovered state outside mesh material instances when possible; clone material only when a unique visual state needs it.
- Pause orbital controls while dragging scene objects.

## Shaders And Postprocessing

- Use shaders only when normal materials cannot express the effect.
- Keep uniforms stable and update values, not uniform object identities, every frame.
- Use `EffectComposer` only for visible payoff such as bloom, outline, SSAO, DOF, or color grading.
- Resize every pass/composer with the renderer.

## Lab-Specific Rules

- Put the scientific variable in code as a named parameter, not a magic number.
- Show current values and units near the controls or measurement overlay.
- Add reset to the initial state.
- For approximated physics, leave a calibration constant and comment its ceiling.
- For curriculum labs, prefer one reliable phenomenon over many half-working features.
