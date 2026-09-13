# Three.js source engine

Read only the relevant atomic sibling skills from `../../threejs-skill-router/SKILL.md`.
For hard-surface models, also read [hard-surface.md](hard-surface.md), adapted from Vibe3D.

Create an ESM `.ts`, `.js` or `.mjs` module exporting `createModel`. It returns a `THREE.Group`
or `{ root, ...controller }` from [the shared motion/interaction contract](motion-interaction.md).
The factory receives `{ THREE, canvas, camera }`. Import `three` normally; the
preview compiles TypeScript and local modules using esbuild and uses its pinned local Three.js.
Preview camera, renderer, lights and floor belong to the studio, outside the model factory.

```js
import * as THREE from 'three';
export function createModel() {
  const root = new THREE.Group();
  // Author the approved subject's geometry/materials here, using semantic part names.
  return root;
}
```

This illustrates the interface only; an empty group is rejected by the live viewer and cannot
be approved. Build the actual subject. Local source imports are bundled; raster imports are
inlined. Arbitrary `new URL('./texture.png', import.meta.url)` assets are not copied: use an
image import/data URL, or deliver a self-contained GLB through the asset engine.

The factory owns its resources. If it supplies `dispose`, release all of its geometries,
materials, textures and event listeners exactly once; otherwise the viewer disposes the root's
geometry/material/texture resources. Never dispose the viewer's camera, canvas or renderer.
Use stable semantic roots for moving parts. Pivots must sit at real joints. Keep bevel widths
in world units, budget repetition with instancing, inspect face winding and attachment gaps.

```sh
node <skill>/scripts/cli.mjs add-model --file ./model.ts --title "Revision 1" --reference <approved-hash>
```

The studio snapshots the compiled module and every compiled input into a downloadable
`sources.json` (relative input names with base64 file contents). Editing the working source does
not alter a submitted snapshot. Use a new snapshot for every revision. No Vibe3D registry,
Bun monorepo or second rendering app is needed for this flow.

The live viewer has fixed cameras, orbit, wireframe, fullscreen, playback, model parameters and
picking. Inspection rotation is not authored motion. GLB export supports standard materials and
morph targets but exports a static snapshot, **not JavaScript interactions**. Download the source
alongside it. Custom shaders, `onBeforeCompile`, skins or `material.userData.requiresBaking`
disable re-export until authored/baked through the source engine. Download an existing Blender GLB
unchanged from the parent studio. This is not Vibe3D's
full portable wear-baking exporter. Exclude preview-only nodes with `userData.excludeFromExport`.
Inspect the exported GLB again before delivery when export parity matters.
