# Engine Decision

Recommendation: default new school-lab simulations to imperative Three.js, but do not migrate every existing 3D surface blindly.

## Default Choices

- New curriculum/science lab: Three.js scene controller.
- Existing imperative Three.js lab: keep Three.js and improve lifecycle/performance.
- Existing Babylon game or world simulation: keep Babylon unless the task is already a planned rewrite.
- R3F/drei: use when a scene is naturally React-componentized or already written in R3F; avoid driving high-frequency physics through React state.
- Physics: formula/custom solver first, `cannon-es` for rigid-body/collision, Babylon physics only in Babylon scenes.

## Why

- The target app already has many Three.js simulation files, shared lab helpers, CSS2D labels, GLTF loading, and imperative setup/dispose patterns.
- The `CloudAI-X/threejs-skills` repo is valuable because it splits Three.js knowledge into focused areas: fundamentals, geometry, materials, lighting, textures, loaders, animation, shaders, postprocessing, and interaction.
- Three.js is enough for most school labs because the product needs controlled apparatus, labels, units, formulas, and visual clarity more than a full game engine.
- Babylon remains useful for game-like scenes, built-in physics integration, inspectors/tools, and existing Babylon surfaces.

## Migration Rule

Convert to Three.js only when at least one is true:

- The surface is a new lab.
- The current implementation is small and already isolated.
- The existing engine is the blocker for load time, maintainability, or visual consistency.
- The lab needs DOM/React UI integration more than engine-level game features.

Do not convert when:

- The Babylon scene already owns physics/game architecture.
- The rewrite would touch unrelated routing, UI, or agent flow.
- The user asked for one lab/bug and migration would delay delivery.

## Three.js Lab Standard

For new learning labs:

1. React component owns UI state and agent events.
2. `setup<Name>Scene.ts` owns Three.js scene lifecycle.
3. Scene state is plain data with units.
4. The solver is independent from meshes.
5. Visual sync mutates meshes from state.
6. QA includes build/lint plus browser canvas check.
