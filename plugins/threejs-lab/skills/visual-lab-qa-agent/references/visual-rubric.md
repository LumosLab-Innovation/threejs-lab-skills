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

Use one prompt per lab before implementation:

```text
Create a high-fidelity 3D educational lab concept image for [subject/topic], designed as an interactive Three.js learning instrument for grade 8. Show [primary phenomenon] clearly in the center, with realistic [apparatus/specimen/system parts], visible labels and measurement readouts, compact side controls, clean lighting, material contrast, and enough detail to guide a real implementation. Avoid toy-like primitives, flat diagrams, generic sci-fi styling, and cluttered text.
```

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

- Human body systems need organ silhouette, branching vessels/airways/tubes, flow markers, pulse/breathing animation, and scale cue.
- Ecology scenes need producer/consumer/decomposer or stressor groups, population clusters, arrows/flows, and stability/risk readout.
- Cells/tissues need repeated structures through instancing or pooled geometry, with active-detail labels only.
- Dense biology demos should expose `benchmark.scene.detailMarkers` and meet the project threshold.

Common fixes: add branching curves, instanced cells/alveoli/capillaries, directional flow particles, organ surface variation, layer labels, and reduce generic spheres/cylinders that do not map to a biological part.

## Stop Conditions

Return `BLOCKED` instead of looping forever when:

- The same visual defect remains after two focused fix attempts.
- Fixing the issue requires external paid/proprietary assets.
- The target art implies a GLB/texture payload beyond the stated budget and no procedural equivalent is available.
- Screenshots cannot be generated in the current environment.
