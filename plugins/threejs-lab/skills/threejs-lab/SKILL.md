---
name: threejs-lab
description: Router and baseline workflow for Three.js lab work. Use when the user asks for any web 3D lab, learning simulation, model viewer, Three.js scene, GLB/GLTF asset flow, physics demo, canvas bug, visual QA, or performance pass and a more specific plugin skill may apply.
---

# Three.js Lab

## Route First

Load the most specific skill before building:

- Product lab, curriculum scene, agent-connected simulation, or reusable 3D lesson: use `$learning-lab-3d-creator`.
- 3D model, procedural object, materials, GLB/GLTF, texture, articulation, or asset optimization: use `$threejs-model-creator`.
- Physics, force, collision, rigid body, particle, fluid-like, field, motion, numerical simulation, or calibration: use `$threejs-physics-simulation`.
- Blank canvas, slow scene, WebGL budget, responsive framing, screenshot QA, or release verification: use `$threejs-performance-qa`.
- Strict product/QA gate before claiming done: use `$learning-lab-qa-pm-reviewer`.

## Workflow

1. Define the lab surface first: learning goal, one primary 3D scene, 1-3 controls, visible measurement/output, reset, and pause/play when motion matters.
2. Inspect the project: package scripts, installed 3D deps, existing canvas/components/assets, route/layout conventions, and current build/test commands.
3. Pick the smallest renderer path that fits:
   - Use existing React Three Fiber if already installed and used.
   - Use imperative Three.js for a single embedded canvas or a non-React page.
   - Do not add physics, postprocessing, state, or control libraries unless the lab requires them.
4. Build with stable scene lifecycle: camera, renderer/canvas sizing, lights, objects/models, controls, animation loop, resize handling, and cleanup.
5. Add real lab controls: variables, units, measured output, reset, and a short result readout.
6. Verify in browser. A Three.js lab is not done until the canvas is nonblank, framed correctly, responsive, and interaction works.

## Must-Haves

- Clamp pixel ratio with `Math.min(window.devicePixelRatio, 2)`.
- Handle resize by updating renderer size, camera aspect/projection, and composer size if postprocessing exists.
- Use `requestAnimationFrame`, `renderer.setAnimationLoop`, or R3F `useFrame`; update `Clock`-based deltas for animation mixers.
- Use the import style already present in the project. For fresh Three.js code, prefer `three/addons/...`; keep local consistency unless modernizing a whole surface.
- Use `MeshStandardMaterial`/`MeshPhysicalMaterial` with lights or environment maps for realistic labs; use `MeshBasicMaterial` only for unlit UI/debug visuals.
- Load GLB/GLTF assets from the app's public/static path; add loading and error states.
- Reuse/dispose geometries, materials, textures, controls, renderers, and event listeners on unmount.
- Use `InstancedMesh` or merged geometry for many repeated objects.
- For physics/science labs, expose calibration constants when approximations or real-world drift matter.

## References

Read only what the task needs:

- `references/threejs-patterns.md`: API patterns for scene setup, assets, interaction, animation, shaders, postprocessing, and R3F.
- `references/lab-qa.md`: browser/build QA checklist and blank-canvas triage.
- `references/sources.md`: source repos reviewed while creating this skill.

## Script

Run the lightweight static check after editing Three.js files:

```bash
node <skill-dir>/scripts/check-threejs-lab.mjs <changed-file.tsx> [more files]
```

The script catches missing render loops, resize handling, common asset-loading omissions, and similar failures. It is not a replacement for a browser screenshot.
