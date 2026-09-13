import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import catalog from './catalog.json';

export const models = catalog.models;
const decoder = new DRACOLoader().setDecoderPath('draco/').setDecoderConfig({ type: 'wasm' }).setWorkerLimit(1);
const loader = new GLTFLoader().setDRACOLoader(decoder);
export const disposeLoaders = () => decoder.dispose();

// Lab029s EarthMovementsScene: sphere, tilt, night-side overlay and Fresnel shell.
// Gallery adaptation removes lesson labels, orbit paths and assessment UI.
const vertexShader = `varying vec2 vUv; varying vec3 vNormal; varying vec3 vPosition;
void main(){vUv=uv;vNormal=normalize(mat3(modelMatrix)*normal);
vec4 world=modelMatrix*vec4(position,1.);vPosition=world.xyz;
gl_Position=projectionMatrix*viewMatrix*world;}`;
const sunDirection = new THREE.Vector3(-3, 2, 3).normalize();

export async function loadModel(id, renderer) {
  const spec = models.find(model => model.id === id);
  if (!spec) throw new Error('Unknown model');
  const resources = new Set();
  let mixer, animationRoot, activeClip;
  const clips = [];
  const own = (resource) => { resources.add(resource); return resource; };
  const dispose = () => {
    if (mixer) { mixer.stopAllAction(); mixer.uncacheRoot(animationRoot); }
    for (const r of resources) { r.dispose(); if (r.isTexture) r.source?.data?.close?.(); }
    resources.clear();
  };
  const texture = async (name) => {
    const map = own(await new THREE.TextureLoader().loadAsync(`assets/${name}`));
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return map;
  };
  const mesh = (geometry, material) => new THREE.Mesh(own(geometry), own(material));
  const root = new THREE.Group();
  const spin = new THREE.Group();
  root.add(spin);
  try {
    if (spec.kind === 'planet') {
      const map = await texture(spec.file);
      const surface = mesh(new THREE.SphereGeometry(1, 72, 48), new THREE.MeshStandardMaterial({ map, roughness: .78, metalness: 0, ...(id === 'sun' ? { emissiveMap: map, emissive: 0xff9d18, emissiveIntensity: 1.75, toneMapped: false } : {}) }));
      spin.add(surface);
      spin.rotation.y = id === 'earth' ? 2.8 : .5;
      root.rotation.z = id === 'earth' ? THREE.MathUtils.degToRad(23.5) : .08;
      // Ring geometry and proportions retained from the Grade 3 solar-system scene.
      if (id === 'saturn') {
        for (const [inner, outer, color, opacity] of [[1.28, 2.16, 0xe5c98a, .76], [1.08, 1.28, 0x9c7b48, .52]]) {
          const ring = mesh(new THREE.RingGeometry(inner, outer, 96), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }));
          ring.rotation.x = Math.PI / 2.13;
          root.add(ring);
        }
        root.rotation.z = -.3;
      }
      if (id === 'earth') {
        const nightMap = await texture('earth_night_nasa.webp');
        spin.add(mesh(new THREE.SphereGeometry(1.0025, 72, 48), new THREE.ShaderMaterial({
          uniforms: { nightMap: { value: nightMap }, sunDirection: { value: sunDirection } }, vertexShader,
          fragmentShader: `uniform sampler2D nightMap; uniform vec3 sunDirection; varying vec2 vUv; varying vec3 vNormal;
          void main(){float night=1.-smoothstep(-.13,.22,dot(normalize(vNormal),sunDirection));
          vec3 lights=texture2D(nightMap,vUv).rgb;float lum=dot(lights,vec3(.2126,.7152,.0722));
          gl_FragColor=vec4(lights*vec3(1.16,1.,.78)*1.18,smoothstep(.12,.62,lum)*night*.78);}`,
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
        })));
        root.add(mesh(new THREE.SphereGeometry(1.035, 64, 40), new THREE.ShaderMaterial({
          uniforms: { sunDirection: { value: sunDirection } }, vertexShader,
          fragmentShader: `uniform vec3 sunDirection; varying vec3 vNormal; varying vec3 vPosition;
          void main(){vec3 n=normalize(vNormal);vec3 view=normalize(cameraPosition-vPosition);
          float rim=pow(1.-max(dot(n,view),0.),3.);float lit=dot(n,sunDirection)*.5+.5;
          float intensity=rim*mix(.34,.78,lit);
          gl_FragColor=vec4(mix(vec3(.08,.36,1.),vec3(.25,.76,1.65),lit)*intensity*1.45,intensity*.72);}`,
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
        })));
      }
    } else {
      const gltf = await loader.loadAsync(`assets/${spec.file}`);
      const object = gltf.scene;
      object.traverse(part => {
        if (!part.isMesh) return;
        if (!part.geometry.getAttribute('normal')) {
          const original = part.geometry;
          part.geometry = toCreasedNormals(original, Math.PI / 4);
          original.dispose();
        }
        own(part.geometry);
        if (part.skeleton) own(part.skeleton);
        for (const material of Array.isArray(part.material) ? part.material : [part.material]) {
          own(material);
          for (const value of Object.values(material)) if (value?.isTexture) own(value);
        }
      });
      // Project exports are already Y-up; retain geometry and semantic names.
      if (id === 'globe') {
        const map = await texture('earth_day_nasa.webp');
        map.flipY = false; // glTF UVs use the opposite image origin from Three.js spheres.
        object.traverse(part => {
          if (!part.isMesh) return;
          part.material = own(new THREE.MeshStandardMaterial(part.name === 'GlobeSphere'
            // This legacy sphere has inward triangle winding; render its outer skin.
            ? { map, roughness: .68, side: THREE.BackSide }
            : { color: 0x32443d, metalness: .55, roughness: .3 }));
        });
      } else if (id === 'flashlight') {
        object.traverse(part => {
          if (!part.isMesh) return;
          const lens = part.name === 'FlashlightLens';
          part.material = own(new THREE.MeshStandardMaterial({
            color: lens ? 0xf5edd2 : part.name === 'FlashlightButton' ? 0xe4aa4f : 0x29353d,
            metalness: lens ? .2 : .45, roughness: lens ? .16 : .42,
            emissive: lens ? 0xffe4a5 : 0, emissiveIntensity: lens ? .3 : 0,
          }));
        });
        object.rotation.z = .2;
      }
      if (gltf.animations.length) {
        animationRoot = object;
        mixer = new THREE.AnimationMixer(object);
        clips.push(...gltf.animations);
        activeClip = mixer.clipAction(clips[0]);
        activeClip.play();
        mixer.setTime(0);
      }
      object.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      if (box.isEmpty() || !Number.isFinite(size.length()) || size.length() < .000001) throw new Error('Empty model');
      const scale = 2.4 / Math.max(size.x, size.y, size.z);
      object.position.sub(box.getCenter(new THREE.Vector3()));
      const normalized = new THREE.Group();
      normalized.add(object);
      normalized.scale.setScalar(scale);
      spin.add(normalized);
      spin.rotation.y = id === 'globe' ? -.35 : id === 'flashlight' ? -.5 : id === 'cute-robot' ? 1.3 : 0;
    }
    const initialRotation = spin.rotation.y;
    return {
      root, dispose,
      clips: clips.map((clip, index) => ({ index, name: clip.name || `Animation ${index + 1}` })),
      selectClip(index) {
        if (!Number.isInteger(index) || !clips[index]) throw new Error('Unknown animation');
        mixer.stopAllAction();
        activeClip = mixer.clipAction(clips[index]); activeClip.reset().play(); mixer.setTime(0);
      },
      reset() { if (mixer) { activeClip.reset().play(); mixer.setTime(0); } },
      update: (dt, elapsed) => { if (mixer) mixer.update(dt); else spin.rotation.y = initialRotation + elapsed * .18; },
    };
  } catch (error) { dispose(); throw error; }
}
