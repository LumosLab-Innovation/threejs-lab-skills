# One Three.js runtime for both engines

Choose the mechanism before coding: joint/pivot motion for rigid parts, morph targets for
localized contraction, bones for articulated tissue, particles/fields for flow. Never substitute
whole-object scaling or camera spin for a requested mechanism. Realism needs reference evidence,
correct structure, timing and feedback; a sine wave alone does not prove biological accuracy.

The Three.js factory returns `{root, ...controller}`. A Blender GLB needs a companion JS/TS
module exporting `createBehavior({THREE, root, animations, canvas, camera})`, returning a
controller for the loaded root. Do not create a second renderer or animation loop.

```js
// The same controller shape works with either geometry engine.
return {
  parameters: [{ id: 'rate', label: 'Nhịp/phút', min: 30, max: 150, step: 1, value: 60 }],
  setParameter(id, value) { /* update the named, validated model parameter */ },
  update(deltaSeconds, elapsedSeconds) { /* pose from rest state + simulation time */ },
  onPick(intersection) { /* respond to a raycast hit, with visible feedback */ },
  reset() { /* restore pose and interaction state; parameter defaults follow */ },
  dispose() { /* release resources/listeners owned by this controller */ },
};
```

This snippet explains the interface, not an acceptable implementation. Only supply callbacks
with real behavior; a deliberately static object can return an empty controller. For requested
motion, the agent must implement and exercise that behavior before asking for model approval.

- `update` receives seconds, pauses with the player, and starts at zero after reset. Frame delta
  is capped at 50 ms; hidden tabs suspend simulation instead of jumping ahead. Use rest transforms
  or morph weights, not cumulative `scale *= ...`. Use a fixed-step accumulator for physical
  integration and state units/approximations; do not mistake the preview clock for a physics solver.
- At most eight native sliders; descriptors require unique IDs, finite min/max/step/value and a
  `setParameter` callback. Choose meaningful ranges and units. Reset restores initial parameters.
- Picking is click/tap without an orbit drag; Enter/Space while the canvas is focused raycasts
  through its center. Provide sliders/buttons for essential actions, not pointer-only controls.
  More specialized dragging can bind to `canvas`; remove its listeners in `dispose`.
- For a Blender rig or baked clip, create your `THREE.AnimationMixer(root)` in the behavior,
  select the intended clip, advance it in `update`, and reset/uncache it explicitly. For shape
  keys, look up `mesh.morphTargetDictionary['semantic_name']` and set its influence. Fail clearly
  when required exported parts are missing rather than showing an inert asset.
- The viewer owns/disposes the loaded Blender root; its behavior disposes only additional owned
  resources/listeners/mixers. A procedural factory with `dispose` owns its entire root's cleanup.

## Runnable reference

`../assets/examples/pulse-model.mjs` builds a morphable model in Three.js and reuses
`pulse-behavior.mjs` for localized deformation, two parameters and picking. `blender-pulse.py`
authors equivalent Blender geometry with the `contract` shape key; export its returned collection
with the bundled exporter and register the GLB using the **same** `pulse-behavior.mjs`.
These are mechanical examples, not anatomically validated organs or user-approved designs.

## Delivery gate

Inspect both geometry and its requested motion on localhost: play/pause, full parameter range,
pick/tap, keyboard equivalent, reset, mobile layout, reload and disposal when switching options.
Test invariants of an actual simulation separately. Preserve source and `.blend` alongside GLB:
GLB carries geometry/rigs/morphs/baked clips, not the JavaScript interaction program. Approval
hashes bind the registered GLB and behavior together; changing either requires a new revision.
