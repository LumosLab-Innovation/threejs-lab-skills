---
name: threejs-lab
description: Build, fix, and verify interactive Three.js or React Three Fiber 3D lab experiences, including educational/science simulations, GLTF/GLB model viewers, articulated object demos, animation, shaders, lighting, materials, pointer interaction, and visual QA. Use when creating or debugging web-based 3D labs, canvas renderers, Three.js scenes, lab controls, model loading, or blank/incorrect 3D output.
---

# Three.js Lab

## Overview

Use this skill to ship a working 3D lab, not a decorative demo. Prefer the app's existing Three.js, React Three Fiber, Vite, Next, or testing patterns before adding anything new.

## Workflow

1. Define the lab surface first: learning goal, one primary 3D scene, 1-3 controls, visible measurement/output, reset, and pause/play when motion matters.
2. Inspect the project: package scripts, installed 3D deps, existing canvas/components/assets, route/layout conventions, and current build/test commands.
3. Pick the smallest renderer path that fits:
   - Use existing React Three Fiber if already installed and used.
   - Use imperative Three.js for a single embedded canvas or a non-React page.
   - Do not add physics, postprocessing, state, or control libraries unless the lab requires them.
4. Build the scene with stable basics: camera, renderer/canvas sizing, lights, objects/models, controls, animation loop, resize handling, and cleanup.
5. Add lab controls as real parameters, not prose. Show values, units, and measured outcome; keep explanatory copy short.
6. Verify in browser. A Three.js lab is not done until the canvas is nonblank, framed correctly, responsive, and interaction works.

## Must-Haves

- Clamp pixel ratio with `Math.min(window.devicePixelRatio, 2)`.
- Handle resize by updating renderer size, camera aspect/projection, and composer size if postprocessing exists.
- Use `requestAnimationFrame`, `renderer.setAnimationLoop`, or R3F `useFrame`; update `Clock`-based deltas for animation mixers.
- Use `three/addons/...` imports for loaders, controls, and postprocessing in current Three.js projects.
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
