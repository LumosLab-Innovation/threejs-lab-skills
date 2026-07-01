# Model Standards

## Procedural Apparatus

Use boxes, cylinders, curves, lines, tubes, sprites, and CanvasTexture labels before reaching for custom mesh code.

Good lab primitives:

- `BoxGeometry`: tables, sliders, meter housings, plates, blocks.
- `CylinderGeometry`: weights, rods, pivots, wires, tubes, beakers, pistons.
- `SphereGeometry`: charges, atoms, particles, lenses, joints.
- `TubeGeometry`/`Line`: wires, trajectories, field lines, rays.
- `CanvasTexture`: displays, meters, labels, formula cards.

Keep helper functions small and local: `addBox`, `addCylinder`, `makeLabel`, `disposeObject`.

## Materials

- Metal: `MeshStandardMaterial({ metalness: .3-.7, roughness: .2-.5 })`.
- Plastic/paint: low metalness, medium roughness.
- Glass/liquid: transparent material with opacity; avoid heavy refraction unless required.
- Heat/light/current: emissive material plus label or field marker, not just color.
- Field/force vectors: arrows or lines with legends.

## GLB/GLTF

- Serve from a public path such as `/models/name.glb`.
- Keep dependent `.bin` and textures beside `.gltf` when not using `.glb`.
- Add loading progress and error fallback.
- Center and scale with `Box3`.
- If using animations, keep one `AnimationMixer` per animated root and update with clock delta.
- Use Draco/KTX2 only when the asset actually uses them.

## Optimization

- Reuse geometry/material instances for repeated parts.
- Use `InstancedMesh` for many similar particles/markers.
- Keep labels in HTML/CSS2D when text must stay sharp.
- Cap pixel ratio at 1.5 or 2.
- Avoid high-poly GLB for simple lab equipment.
- Texture sizes should match viewport use; do not ship 4K textures for small props.

## Visual Polish

- Add bevel illusion with bevelled geometry only where visible; otherwise use material/lighting.
- Use shadows as depth cues, not as a performance tax everywhere.
- Frame model with camera target and distance limits.
- Add subtle animation only when it explains state or draws attention to the active part.
- Use bloom, transparent glass, emissive accents, or particles only when they clarify energy, field, flow, heat, or motion.
- Avoid "primitive soup": repeated spheres/boxes need a lab apparatus, surface, scale cue, labels, and a measured readout.
