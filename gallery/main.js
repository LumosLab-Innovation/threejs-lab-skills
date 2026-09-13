import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createPlayback } from '../plugins/threejs-lab/skills/threejs-studio/web/motion.js';
import { models, loadModel } from './models.js';

const $ = id => document.getElementById(id);
const capture = new URLSearchParams(location.search).get('capture') === '1';
document.body.classList.toggle('capture', capture);
for (const model of models) {
  const link = document.createElement('a');
  link.href = `#${model.id}`;
  link.dataset.model = model.id;
  const image = document.createElement('img');
  image.src = `images/${model.id}.jpg`;
  image.alt = '';
  image.width = 150; image.height = 78;
  const name = document.createElement('span');
  name.textContent = model.title;
  link.append(image, name);
  $('models').append(link);
}
for (const id of ['install', 'credits']) $(id).onclick = () => $(`${id}-dialog`).showModal();
$('copy').onclick = async () => {
  try { await navigator.clipboard.writeText($('command').value); $('copy-status').textContent = 'Copied'; }
  catch { $('command').select(); $('copy-status').textContent = 'Press Ctrl+C / ⌘C to copy.'; }
};
let restart;
$('retry').onclick = () => restart?.();
function showError(message) {
  $('viewer').dataset.state = 'error';
  $('status').textContent = message;
  $('retry').hidden = false;
  $('play').disabled = $('reset').disabled = true;
}
try {
  const renderer = new THREE.WebGLRenderer({ canvas: $('canvas'), antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .05, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  const hemisphere = new THREE.HemisphereLight(0xe6f3ff, 0x637368, .6);
  const key = new THREE.DirectionalLight(0xfff8ed, 3.5);
  key.position.set(-3, 2, 3);
  scene.add(hemisphere, key);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  room.dispose(); pmrem.dispose();
  let current, playback, generation = 0, lastFrame = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pause = () => { if (playback?.playing) playback.toggle(); syncPlay(); };
  const syncPlay = () => { $('play').textContent = playback?.playing ? 'Pause' : 'Play'; $('play').setAttribute('aria-pressed', String(Boolean(playback?.playing))); };
  function frame() {
    if (!current) return;
    const box = new THREE.Box3().setFromObject(current.root, true);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const distance = Math.max(size.y, size.x / camera.aspect) / (2 * Math.tan(camera.fov * Math.PI / 360)) * (capture ? 1.08 : 1.35) + size.z / 2;
    camera.position.copy(center).add(new THREE.Vector3(.12, .17, 1).normalize().multiplyScalar(distance));
    controls.target.copy(center);
    controls.minDistance = Math.max(size.x, size.y, size.z) * .65;
    controls.maxDistance = distance * 3;
    controls.update();
  }
  const resize = () => {
    const { width, height } = $('viewer').getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    frame();
  };
  const observer = new ResizeObserver(resize);
  observer.observe($('viewer'));
  function release() { if (current) { scene.remove(current.root); current.dispose(); current = null; } playback = null; }
  async function select() {
    const ticket = ++generation;
    release();
    const index = Math.max(0, models.findIndex(model => `#${model.id}` === location.hash));
    const spec = models[index];
    $('viewer').dataset.state = 'loading';
    $('viewer').dataset.model = spec.id;
    $('status').textContent = 'Loading model…';
    $('retry').hidden = true;
    $('play').disabled = $('reset').disabled = true;
    $('title').textContent = spec.title;
    $('collection').textContent = `LAB029S / MODEL ${String(index + 1).padStart(2, '0')}`;
    $('source').href = spec.source;
    $('format').textContent = spec.format;
    document.title = `${spec.title} — Three.js Lab Skills`;
    for (const link of $('models').children) link.setAttribute('aria-current', String(link.dataset.model === spec.id));
    try {
      const loaded = await loadModel(spec.id, renderer);
      if (ticket !== generation) { loaded.dispose(); return; }
      current = loaded;
      scene.add(current.root);
      scene.environment = spec.id === 'globe' || spec.id === 'flashlight' ? environment.texture : null;
      scene.environmentIntensity = .9;
      hemisphere.intensity = spec.id === 'earth' ? .12 : .65;
      playback = createPlayback(current);
      pause(); // Model motion is opt-in; orbit does not move the model itself.
      resize();
      renderer.render(scene, camera);
      $('status').textContent = '';
      $('viewer').dataset.state = 'ready';
      $('play').disabled = $('reset').disabled = false;
    } catch (error) { if (ticket === generation) { console.error(error); showError('Could not load the model. Check your connection and retry.'); } }
  }
  restart = select;
  window.addEventListener('hashchange', select);
  $('play').onclick = () => { playback?.toggle(); syncPlay(); };
  $('reset').onclick = () => { playback?.reset(); pause(); frame(); };
  $('fullscreen').hidden = !document.fullscreenEnabled;
  $('fullscreen').onclick = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await $('viewer').requestFullscreen(); }
    catch { $('status').textContent = 'Fullscreen is unavailable in this browser.'; }
  };
  document.addEventListener('fullscreenchange', () => $('fullscreen').setAttribute('aria-label', document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen'));
  $('canvas').addEventListener('keydown', event => {
    if (!current || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','r','R'].includes(event.key)) return;
    event.preventDefault();
    if (event.key.toLowerCase() === 'r') { $('reset').click(); return; }
    const orbit = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    if (event.key === 'ArrowLeft') orbit.theta -= .12;
    if (event.key === 'ArrowRight') orbit.theta += .12;
    if (event.key === 'ArrowUp') orbit.phi -= .12;
    if (event.key === 'ArrowDown') orbit.phi += .12;
    if (event.key === '+' || event.key === '=') orbit.radius *= .9;
    if (event.key === '-') orbit.radius *= 1.1;
    orbit.makeSafe(); orbit.radius = THREE.MathUtils.clamp(orbit.radius, controls.minDistance, controls.maxDistance);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(orbit)); controls.update();
  });
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); renderer.setAnimationLoop(null); restart = () => location.reload(); showError('3D rendering stopped. Retry to reload the viewer.'); });
  reduced.addEventListener('change', event => { if (event.matches) pause(); });
  document.addEventListener('visibilitychange', () => { lastFrame = 0; });
  renderer.setAnimationLoop(time => {
    if (document.hidden) { lastFrame = 0; return; }
    const delta = lastFrame ? (time - lastFrame) / 1000 : 0;
    lastFrame = time;
    playback?.step(delta);
    controls.update();
    renderer.render(scene, camera);
  });
  // Read-only inspection for reproducible browser checks; no mutable scene globals.
  window.galleryStats = () => ({ model: $('viewer').dataset.model, state: $('viewer').dataset.state, ...renderer.info.memory, ...renderer.info.render, playing: playback?.playing, elapsed: playback?.elapsed, camera: camera.position.toArray() });
  window.addEventListener('pagehide', event => {
    if (event.persisted) { pause(); return; }
    generation++; renderer.setAnimationLoop(null); observer.disconnect(); controls.dispose(); release(); environment.dispose(); renderer.dispose();
  });
  await select();
} catch (error) {
  console.error(error);
  restart = () => location.reload();
  showError('WebGL is unavailable. Enable hardware acceleration, then retry.');
}
