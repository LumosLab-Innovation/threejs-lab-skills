# Visual Rubric

Use this rubric after the benchmark screenshot pass. Score each item 1-5. Pass requires no score below 4 and no hard block.

| Area | Pass Signal | Fix Patterns |
| --- | --- | --- |
| Focal phenomenon | The learner sees the main reaction, force, organ flow, or field in the first 10 seconds. | Reframe camera, simplify background, enlarge the phenomenon, add one animated cue. |
| Subject fidelity | The scene matches the real object/apparatus/system, not a generic primitive substitute. | Add semantic parts, scale cues, labels, and subject-specific silhouette. |
| Materials and lighting | Glass, liquid, metal, tissue, plastic, field glow, or terrain read as distinct materials. | Use physical/standard materials, contact shadows, rim/fill lights, tone mapping. |
| Detail density | Details teach the topic without overwhelming mobile view. | Use instancing for repeated detail, labels only on active details, collapse secondary details on mobile. |
| Labels and readouts | Labels explain variables/results without blocking the model. | Move labels to anchors, shorten copy, add leader lines, reserve side panel for numbers. |
| Interaction clarity | Every control visibly changes scene state and measured output. | Bind controls to geometry/material/animation and result cards; add reset evidence. |
| Mobile fit | Canvas remains visible and controls are tappable. | Collapse panels, reduce label count, increase touch targets, adjust camera FOV. |
| Performance | Visual polish stays inside frame, draw-call, triangle, model, and texture budgets. | Merge/instance meshes, compress assets, replace textures with procedural materials, cap pixel ratio. |

## Image Reference Prompt Shape

Use object-focused prompts before implementation. Keep the image about the 3D model to build, not a mood background:

```text
Create an object-focused 3D model reference sheet for [subject/topic], designed for a grade 8 Three.js educational lab. Show the [apparatus/specimen/system] on a plain neutral background with front, side, top, and optional exploded/cutaway views. Emphasize the exact morphology and parts to model: [required parts]. Include only small labels attached to parts. Avoid room backgrounds, lab benches, decorative scenery, toy primitives, flat diagrams, generic sci-fi styling, and cluttered text.
```

Use a single scene concept only after the object shape is clear, and only to validate camera framing and UI composition.

## Morphology Anchor Check

Before accepting screenshots, list 4-8 required anchors from the reference. Each anchor must be visible or intentionally exposed through a cutaway/inset. If an anchor is represented only by a generic primitive, return `FIX_REQUIRED`.

Examples:

- Heart: four chamber cues, valve flaps, aorta arch, vena cava, pulmonary vessels, branching capillary bed.
- Lung: trachea rings, branching bronchi/bronchioles, lung lobes, diaphragm dome, alveoli inset, capillary wrap.
- Ecosystem: transparent terrarium boundary, visible soil layers, root network, producer leaves, herbivore insects, predator forms, decomposer fungi, pond/algae, food-web arrows.

## Chemistry Additions

Require at least four visible chemistry signals:

- Real glassware or lab vessel with thickness, rim, liquid level, and stand/base.
- Reaction evidence such as bubbles, precipitate, color gradient, vapor, heat glow, or particle trail.
- Measurement context: pH, temperature, gas volume, concentration, rate, or time.
- Safety/scale cues: dropper, probe, clamp, scale marks, burner/hot plate, or lab bench.
- Material separation: glass transparent, liquid refractive/translucent, solid powder/crystal, metal/plastic apparatus.

Common fixes: add meniscus/rim geometry, particle bubbles, indicator gradient, scale ticks, probe label, contact shadow, and a camera angle that reveals the vessel depth.

## Biology Additions

Require dense, recognizable small details:

- Biology reference images must define morphology anchors before scene work: silhouette, branching topology, layered anatomy, repeated microstructures, and scale cues.
- Human body systems need organ silhouette, branching vessels/airways/tubes, flow markers, pulse/breathing animation, and scale cue.
- Ecology scenes need producer/consumer/decomposer or stressor groups, population clusters, arrows/flows, and stability/risk readout.
- Cells/tissues need repeated structures through instancing or pooled geometry, with active-detail labels only.
- Dense biology demos should expose `benchmark.scene.detailMarkers` and meet the project threshold.

Common fixes: reshape blobs into lobe/chamber/sac silhouettes, add branching curves, instanced cells/alveoli/capillaries, directional flow particles, organ surface variation, layer labels, and reduce generic spheres/cylinders that do not map to a biological part.

## Stop Conditions

Return `BLOCKED` instead of looping forever when:

- The same visual defect remains after two focused fix attempts.
- Fixing the issue requires external paid/proprietary assets.
- The target art implies a GLB/texture payload beyond the stated budget and no procedural equivalent is available.
- Screenshots cannot be generated in the current environment.
