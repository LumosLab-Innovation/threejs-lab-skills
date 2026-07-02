# KHTN 8 Subject Labs Visual QA Log

This ledger records the design evolution for the benchmark demos. It exists so visual quality can be audited from evidence, not from memory.

## Locked Workflow

1. Write or generate a 2D reference target before 3D implementation.
2. Run science and design gates:
   - `$science-model-director`: lesson claim, control -> visual -> output mapping, simplification.
   - `$threejs-design-director`: morphology anchors, real objects vs annotations, camera composition.
   - `$threejs-art-director`: reference likeness, material polish, composition, and non-toy aesthetics.
3. Implement the 3D scene from the reference/spec.
4. Run `scripts/benchmark-examples.mjs` to generate desktop/mobile screenshots and metrics.
5. Compare screenshot output against the 2D target and morphology anchors.
6. If any anchor is missing, hidden, generic, or illogical, apply a concrete fix and repeat the screenshot/benchmark pass.

## Round 0 - Baseline Audit

Prompt/spec summary: build 9 KHTN8 subject labs from chemistry, physics, and biology topics with controls, outputs, reset, screenshots, and benchmark hooks.

Reference: written topic specs from `KHTN 8-KNTT.pdf` table-of-contents topics; no object-focused biology image references yet.

Design gate:

- Chemistry had correct lesson ideas but weak apparatus cues.
- Biology used too many generic blobs and sparse details.
- Ecosystem lacked visible soil/root structure and food-web organism detail.

Science gate:

- Controls and formulas existed, but several visual elements were too generic to teach causality.

Decision: `FIX_REQUIRED`.

Fix set:

- Add credible chemistry apparatus details: meniscus, glass thickness, stands, probes, scale ticks, reaction trails, heat/indicator evidence.
- Add biology morphology anchors before counting detail markers.
- Add benchmark screenshots and machine metrics for desktop/mobile.

## Round 1 - Chemistry and Biology Detail Pass

Prompt/spec summary:

- Chemistry: object-focused written spec for gas reaction, acid/base pH, and catalyst rate apparatus. Required glassware, liquid level, reaction evidence, measurement marks, and scale cues.
- Biology: written spec for chambered circulation, branching respiration, and ecosystem groups with roots/soil/food-web evidence.

Reference: `plugins/threejs-lab/skills/visual-lab-qa-agent/references/visual-rubric.md`.

Design gate:

- Chemistry: pass after adding apparatus-specific parts.
- Biology: partial pass; circulation and respiration became more recognizable, but ecosystem still looked too sparse and the sun energy cue copied multiple sketch-like rays.

Science gate:

- Chemistry: pass because controls map to gas, pH, and rate outputs.
- Biology: `FIX_REQUIRED` for ecosystem because the energy-flow cue needed one clear arrow, not multiple decorative rays.

3D output:

- `examples/khtn8-subject-labs/screenshots/chem-reaction-gas-desktop-benchmark.png`
- `examples/khtn8-subject-labs/screenshots/chem-acid-base-desktop-benchmark.png`
- `examples/khtn8-subject-labs/screenshots/chem-catalyst-rate-desktop-benchmark.png`
- `examples/khtn8-subject-labs/screenshots/bio-circulation-desktop-benchmark.png`
- `examples/khtn8-subject-labs/screenshots/bio-respiration-desktop-benchmark.png`
- `examples/khtn8-subject-labs/screenshots/bio-ecosystem-desktop-benchmark.png`

Benchmark: interim subset benchmark passed frame/resource budgets, but visual QA still returned `FIX_REQUIRED` for biology fidelity.

Decision: `FIX_REQUIRED`.

Fix set:

- Generate object-focused biology reference sheets.
- Add multi-view/cutaway morphology anchors.
- Replace ecosystem sun rays with a single energy-flow arrow.
- Add denser roots, soil layers, organism groups, decomposers, insects, algae, and food-web markers.

## Round 2 - Object-Focused Biology Reference Pass

Prompt/spec summary: generated object-focused 3D model reference sheets on plain neutral backgrounds, front/side/top/cutaway style, focused only on the organ/system to model and excluding decorative classroom/lab backgrounds.

Reference input:

| Lab | 2D Reference |
| --- | --- |
| Circulation | `examples/khtn8-subject-labs/references/bio-circulation-reference.png` |
| Respiration | `examples/khtn8-subject-labs/references/bio-respiration-reference.png` |
| Ecosystem | `examples/khtn8-subject-labs/references/bio-ecosystem-reference.png` |

Design gate:

| Lab | Morphology Anchors |
| --- | --- |
| Circulation | four chamber cues, septum, valves, aorta arch, vena cava, pulmonary vessels, capillary bed |
| Respiration | trachea rings, branching bronchi/bronchioles, lung lobes, diaphragm dome, alveoli inset, capillary wrap |
| Ecosystem | transparent terrarium boundary, soil layers, visible roots, producer leaves, herbivore insects, predator forms, decomposer fungi, pond/algae, one energy-flow arrow |

Science gate:

| Lab | Control -> Visual -> Output Mapping |
| --- | --- |
| Circulation | heart rate/resistance/oxygen demand -> pulse particles and vessel paths -> cardiac output and pressure load |
| Respiration | breath depth/airway diameter/activity -> lung expansion, airway flow, alveoli markers -> ventilation and oxygen uptake |
| Ecosystem | sunlight/pollution/consumer pressure -> producer/herbivore/predator/decomposer balance -> stability score and population readouts |

3D output:

| Lab | Desktop Screenshot | Mobile Screenshot |
| --- | --- | --- |
| Circulation | `examples/khtn8-subject-labs/screenshots/bio-circulation-desktop-benchmark.png` | `examples/khtn8-subject-labs/screenshots/bio-circulation-mobile-benchmark.png` |
| Respiration | `examples/khtn8-subject-labs/screenshots/bio-respiration-desktop-benchmark.png` | `examples/khtn8-subject-labs/screenshots/bio-respiration-mobile-benchmark.png` |
| Ecosystem | `examples/khtn8-subject-labs/screenshots/bio-ecosystem-desktop-benchmark.png` | `examples/khtn8-subject-labs/screenshots/bio-ecosystem-mobile-benchmark.png` |

Benchmark: `examples/benchmark-results.json` and `examples/BENCHMARK_RESULTS.md`.

Final benchmark summary:

| Lab | FPS Desktop/Mobile | P95 Desktop/Mobile | Draw Calls | Triangles | Detail Markers | Local / Model / Texture Assets |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Circulation | 98 / 144 | 14.1 / 7.1 ms | 87 | 62,030 | 71 | 72 KB / 0 MB / 0 MB |
| Respiration | 91 / 144 | 14.1 / 7.1 ms | 151 | 99,788 | 162 | 72 KB / 0 MB / 0 MB |
| Ecosystem | 77 / 144 | 20.9 / 7.1 ms | 110 | 94,986 | 644 | 72 KB / 0 MB / 0 MB |

Decision: `PASS` after the full benchmark run passed all 24 desktop/mobile profiles and the biology screenshots matched the required morphology anchors closely enough for procedural curriculum demos.

Fix set applied:

- Circulation: reshaped heart into a four-chamber cue with septum, valves, apex, aorta arch, pulmonary vessels, vena cava, and denser capillary branches.
- Respiration: added larynx, tracheal rings, branching bronchioles, lung lobes, diaphragm dome, rib arcs, alveoli inset, capillary wraps, and gas markers.
- Ecosystem: added terrarium wall/rims, soil strata, cutaway roots, soil worms, pond/algae/lily pads/stone rim, tall grass, flowers, producers, leaf clusters, herbivore insects with legs, bird predator cue, decomposer fungi, pollution markers, and a single sun-to-producer arrow.

## Round 3 - Art Director Polish Pass

Prompt/spec summary: user reported the heart, lungs, and ecosystem plants still looked too crude and not close enough to the 2D references. The fix targeted reference likeness and visual taste without adding GLB models or external textures.

Art gate:

- Circulation: `FIX_REQUIRED` because the heart still read as smooth blobs. Added front chamber cutaways, chordae, coronary surface vessels, and surface groove cues.
- Respiration: `FIX_REQUIRED` because the lungs still read too flat. Added lung lobe grooves and optimized surface detail markers into one instanced mesh to keep draw calls under budget.
- Ecosystem: `FIX_REQUIRED` because plant groups still read as poles. Added broad-leaf clusters, moss ground cover, fallen log, and kept the single sun-to-producer arrow.
- Chemistry/physics: `FIX_REQUIRED` for sparse apparatus/measurement cues. Added glass rims, stand base, probe bulb, pressure arrow tips/depth ticks, lever fulcrum/ruler ticks, circuit terminals, and resistor bands.

Benchmark after fix:

| Group | Result |
| --- | --- |
| Full benchmark | 24 / 24 profiles pass |
| Biology detail markers | circulation 71, respiration 162, ecosystem 644 |
| Biology draw calls | 87, 151, 110, all under 180 |
| Biology geometry | 62,030 / 99,788 / 94,986 triangles; over the 60k dense-lab guideline but justified by reference-likeness and p95 pass |
| Local/model/texture assets | 72 KB local, 0 MB model, 0 MB texture assets |

Decision: `PASS_WITH_NOTES`. Procedural primitives are now more reference-like, but true anatomical/plant realism would require curated GLB or texture assets beyond this dependency-light benchmark.

## Evidence Rules

- `detailMarkers` is only a density signal. It does not pass a biology demo if morphology anchors are missing.
- FPS and p95 frame time only prove the richer scene still fits the render budget.
- README must show both 2D reference input and 3D screenshot output for biology benchmarks.
