# 3D Lab QA

## Build Checks

Use the app's existing commands. Common examples:

```bash
npm run typecheck
npm run lint
npm run build
```

Then run the skill script on changed Three.js files:

```bash
node <skill-dir>/scripts/check-threejs-lab.mjs src/path/to/Lab.tsx
```

## Browser Checks

Start the dev server and inspect with Playwright or the available browser tool:

- Desktop and mobile viewport load without console errors.
- Canvas is nonblank and contains non-background pixels.
- Camera frames the object after resize.
- Orbit/drag/click controls work.
- Lab controls change the 3D outcome and displayed value.
- Reset restores initial scene state.
- GLB/textures load from production-like public paths.

For canvas-heavy work, take a screenshot and sample pixels or compare image dimensions. A passing build with a black canvas is still a failed lab.

## Blank Canvas Triage

Check in this order:

1. Console errors from imports, asset paths, shader compile, or WebGL context.
2. Canvas/container width and height are nonzero.
3. Camera is pointed at the object and near/far planes include it.
4. Scene has lights when using lit materials.
5. Render loop is running.
6. Object scale is sane and not behind/inside the camera.
7. Textures/models resolve with HTTP 200.

## Asset QA

- Confirm `.glb`, `.gltf`, `.bin`, textures, and decoder files are committed or served from public storage.
- Do not reference local absolute paths.
- Keep model polycount and texture size reasonable for the target device.
- For articulated or animated models, test all primary joints/actions.

## Done Criteria

Report the exact commands run, URL inspected, and any known limitation. If visual inspection was skipped, say so explicitly.
