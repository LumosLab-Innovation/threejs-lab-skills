<div align="center">

# Three.js Lab Skills

**Choose an image. Build a model. Make it move.**

Three.js or Blender for geometry. Three.js for motion, contraction and interaction.

[![CI](https://github.com/LumosLab-Innovation/threejs-lab-skills/actions/workflows/validate.yml/badge.svg?branch=codex%2Funified-3d-studio)](https://github.com/LumosLab-Innovation/threejs-lab-skills/actions/workflows/validate.yml)
[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-466341)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent_Skills-35-466341)](plugins/threejs-lab/skills)
[![GitHub stars](https://img.shields.io/github/stars/LumosLab-Innovation/threejs-lab-skills?style=flat&color=466341)](https://github.com/LumosLab-Innovation/threejs-lab-skills/stargazers)

**Codex · Claude Code · Grok Build · OpenCode · OMP**

[Install](#one-command-install) · [Gallery](#reference--3d-gallery) · [How it works](#two-engines-one-runtime) · [Docs](docs/studio.md) · [Star History](#star-history)

</div>

| Choose the reference | Explore interactive 3D |
| :---: | :---: |
| ![Local studio with three image options](assets/showcase/studio-reference-board.jpg) | ![Aurora field lab running in Three.js](assets/showcase/aurora-field.jpg) |

*Real browser captures: the review studio and a bundled lab example. [Capture sources](#screenshot-sources).*

Your coding agent authors the model from the approved image, then codes its behavior. No paid image-to-3D service, hosted backend or second AI process. You choose the image and approve the result on localhost.

## One-Command Install

Requirements: Node.js 22+, npm, Git, and a coding CLI with local skills and shell access. The repository is public.

Install for all five CLIs (PowerShell, Bash or zsh):

```sh
npx --yes --package="github:LumosLab-Innovation/threejs-lab-skills#codex/unified-3d-studio" threejs-lab install --agent all --global
```

`all` uses two discovery roots, not five copies. To target one CLI, replace `all` with `codex`, `claude`, `grok`, `opencode` or `omp`. Omit `--global` for project-local installation. Other Agent Skills hosts can use `--skills-dir <their-supported-path>`; tool support still depends on the host.

This installs the working preview in [PR #1](https://github.com/LumosLab-Innovation/threejs-lab-skills/pull/1), not the older `main`. After merge, the `#codex/unified-3d-studio` suffix can be omitted.

Start a new CLI session and ask:

> Use threejs-studio. Create three image options for a jointed desk lamp and open localhost for my choice. Build it in Blender, then use Three.js for joint movement, controls and clicking the light on/off. Let me review the result.

Use `$threejs-studio` in Codex or `/threejs-studio` in Claude Code. Say **Three.js source** to code the geometry instead. Images come from the host's existing image tool or a reference you supply; no separate paid API fallback is bundled. Blender needs its connected addon/MCP server. CLI subscriptions and host image-tool limits remain separate.

The installer copies skills and installs the two studio dependencies. It stops before overwriting edited or unowned conflicting files; it never changes your MCP settings or replaces existing symlinked skills. Run it again to update, or use `--dry-run` to preview. Existing installations may need conflict reconciliation or a separate project-local destination.

For an existing checkout:

```bash
node scripts/install.mjs --agent codex --global
```

See [Studio quickstart and capability matrix](docs/studio.md) for image generation, Blender setup, resume, export and security boundaries; [source inventory](THIRD_PARTY_NOTICES.md) records what was reused and what was not.

## Two Engines, One Runtime

```text
Prompt → image options → YOU CHOOSE
                            ├─ Three.js: code the geometry
                            └─ Blender MCP: author the mesh, rig and shape keys
                                              ↓
                             Three.js motion + deformation + interaction
                                              ↓
                                localhost review → YOU APPROVE
```

| Geometry engine | Editable output | Shared runtime |
| --- | --- | --- |
| Three.js | JS/TS model factory + source modules | Animation, parameter controls, picking, pause/reset |
| Blender Python via MCP | GLB + `.blend` + construction Python + JS/TS behavior | The same Three.js controls, using named parts, bones or morph targets |

**A GLB is not the whole interaction program.** Keep its Three.js behavior/source alongside it. Blender requires a connected addon; no external image-to-mesh provider substitutes for it.

## Reference → 3D Gallery

Existing educational examples, freshly captured in the browser. These are simplified teaching models, **not claims of photorealistic reconstruction** or new Blender-generated assets.

| Example | Reference image | Running Three.js model |
| --- | :---: | :---: |
| **Circulation**<br>Heart rate, flow and vessel response | <a href="examples/khtn8-subject-labs/references/bio-circulation-reference.png"><img src="examples/khtn8-subject-labs/references/bio-circulation-reference.png" alt="Circulation concept reference" width="320"></a> | <a href="assets/showcase/bio-circulation.jpg"><img src="assets/showcase/bio-circulation.jpg" alt="Fresh browser capture of the circulation model" width="480"></a> |
| **Respiration**<br>Lung expansion, airflow and gas exchange | <a href="examples/khtn8-subject-labs/references/bio-respiration-reference.png"><img src="examples/khtn8-subject-labs/references/bio-respiration-reference.png" alt="Respiration concept reference" width="320"></a> | <a href="assets/showcase/bio-respiration.jpg"><img src="assets/showcase/bio-respiration.jpg" alt="Fresh browser capture of the respiration model" width="480"></a> |
| **Ecosystem**<br>Populations, pollution and balance | <a href="examples/khtn8-subject-labs/references/bio-ecosystem-reference.png"><img src="examples/khtn8-subject-labs/references/bio-ecosystem-reference.png" alt="Ecosystem concept reference" width="320"></a> | <a href="assets/showcase/bio-ecosystem.jpg"><img src="assets/showcase/bio-ecosystem.jpg" alt="Fresh browser capture of the ecosystem model" width="480"></a> |

[Browse the lab source](examples/khtn8-subject-labs/index.html) · [Original visual QA record](examples/khtn8-subject-labs/VISUAL_QA_LOG.md)

### Same Model, Different State

| At rest | Contracted by interaction |
| :---: | :---: |
| ![GLB morph example at rest in the local viewer](assets/showcase/model-rest.jpg) | ![Same GLB after interaction and amplitude change](assets/showcase/model-contracted.jpg) |

This mechanical example uses a named morph target, rate/amplitude sliders, picking and reset. Its [behavior module](plugins/threejs-lab/skills/threejs-studio/assets/examples/pulse-behavior.mjs) runs with the [procedural model](plugins/threejs-lab/skills/threejs-studio/assets/examples/pulse-model.mjs) and its exported/re-imported GLB. It is not an anatomical organ. The [Blender authoring example](plugins/threejs-lab/skills/threejs-studio/assets/examples/blender-pulse.py) produces the same named shape key; live Blender generation remains unverified until the addon connects.

### Screenshot Sources

<details>
<summary>Capture details and how to reproduce</summary>

All seven JPEGs in `assets/showcase/` are browser captures, not generated mock UI. Reference PNGs are retained repository assets. Showcase JPEGs are excluded from the installed skill package.

| Capture | Source / state |
| --- | --- |
| `studio-reference-board.jpg` | Local studio with the three retained biology references; no approval fabricated |
| `aurora-field.jpg` | `examples/fancy-field-lab/index.html`, Aurora preset, paused |
| `bio-circulation.jpg`, `bio-respiration.jpg`, `bio-ecosystem.jpg` | `examples/khtn8-subject-labs/index.html?lab=<id>`, default values, orbit zoom |
| `model-rest.jpg`, `model-contracted.jpg` | Exported/re-imported procedural GLB + `pulse-behavior.mjs`; paused/reset, then picked with amplitude 1 |

Serve the existing examples locally:

```sh
python -m http.server 8080 --bind 127.0.0.1 --directory examples
```

Open `http://127.0.0.1:8080/khtn8-subject-labs/index.html?lab=bio-respiration` or `/fancy-field-lab/`. These older demos load Three.js from a CDN. The new studio serves its installed Three.js locally; follow [its quickstart](docs/studio.md) to reproduce the review and motion examples.

</details>

## What Was Combined

| Source | Included here |
| --- | --- |
| Existing Three.js Lab skills | 11 lab, model, science, physics and QA skills, unchanged demo collection |
| Installed Awesome Graphics skills | 23 MIT skill/reference packages for geometry, materials, atmosphere, water, effects and validation |
| [img2threejs](https://github.com/img2threejs/img2threejs) | Adapted image-analysis → detail inventory → staged reconstruction → visual correction workflow; **not its Forge runtime** |
| [Vibe3D](https://github.com/vibe-stack/vibe3d) | Adapted hard-surface modeling rules and editable source/preview workflow; **not its registry or custom shader-baking exporter** |
| New `threejs-studio` | Cross-CLI installer, localhost approval, immutable snapshots, shared Three.js interaction/playback and Blender collection exporter |

## Develop the Studio

```sh
npm run setup
npm test
npm run validate
node scripts/cli.mjs init --prompt "Your model brief"
node scripts/cli.mjs serve --background
```

`serve` opens a loopback-only URL automatically. The CLI agent adds images/models with the commands in the skill; only the person using the studio approves them. The studio does not silently launch a second AI process.

## Star History

If this workflow helps, [star the repo](https://github.com/LumosLab-Innovation/threejs-lab-skills). Share a reference, a runnable model and what you improved in an [issue](https://github.com/LumosLab-Innovation/threejs-lab-skills/issues).

<a href="https://www.star-history.com/?repos=LumosLab-Innovation%2Fthreejs-lab-skills&amp;type=date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=LumosLab-Innovation/threejs-lab-skills&amp;type=date&amp;theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=LumosLab-Innovation/threejs-lab-skills&amp;type=date">
    <img alt="GitHub star history for LumosLab-Innovation/threejs-lab-skills" src="https://api.star-history.com/chart?repos=LumosLab-Innovation/threejs-lab-skills&amp;type=date" width="800">
  </picture>
</a>

Chart provided by [Star History](https://github.com/star-history/star-history); data comes from this repository, not an example growth curve.

<details>
<summary>Learning-lab toolkit, original examples and benchmark documentation</summary>

## Existing Learning-Lab Toolkit

The remaining sections document the original educational workflows and retained demo evidence, not fresh acceptance results for every imported skill.

## Why This Exists

Most 3D lab prompts fail in the same places: pretty canvas but weak learning goal, no units, no reset, broken mobile layout, missing asset path, fake physics, or no browser evidence. This plugin gives Codex a tighter workflow for shipping real learning-lab scenes instead of decorative demos.

## Skills

| Skill | Use It For | Main Effect |
| --- | --- | --- |
| `$threejs-lab` | Any 3D/canvas/Three.js lab prompt | Routes to the specific specialist skill and enforces baseline scene lifecycle. |
| `$learning-lab-3d-creator` | Full educational experiments, lesson scenes, agent-connected labs | Creates a lab contract, file split, controls, units, result loop, reset, and verification path. |
| `$science-model-director` | Science logic, causality, variable mapping, simplification risk | Blocks beautiful but scientifically weak scenes before implementation. |
| `$threejs-design-director` | 3D morphology, composition, reference interpretation, annotation-vs-object calls | Blocks generic shapes, copied sketch artifacts, and illogical 3D object choices. |
| `$threejs-art-director` | Reference likeness, material polish, composition, non-toy aesthetics | Blocks demos that benchmark well but still look crude or unlike the input reference. |
| `$visual-lab-qa-agent` | Fancy/demo visual quality, GPT Image/imagegen references, screenshot comparison | Runs before and after each demo: creates a visual target, compares benchmark screenshots, and loops on `FIX_REQUIRED`. |
| `$khtn8-biology-lab-creator` | KHTN8 biology, human body, ecology, dense small-detail scenes | Requires recognizable biological systems, detail-marker coverage, mobile FE checks, and stricter model/texture budgets. |
| `$threejs-model-creator` | Procedural models, GLB/GLTF, materials, apparatus, labels | Keeps models semantic, scaled, articulated, optimized, and disposable. |
| `$threejs-physics-simulation` | Forces, fields, collisions, particles, density, heat, optics, rigid bodies | Chooses formula/custom solver/`cannon-es`/Babylon physics with units and fixed timestep where needed. |
| `$threejs-performance-qa` | Blank canvas, asset 404s, slow scenes, release checks | Requires build, browser/canvas checks, responsive framing, cleanup, and performance budget. |
| `$learning-lab-qa-pm-reviewer` | Final review before merge/demo/shipping | Acts as the strict PM/QA gate: `PASS`, `PASS_WITH_NOTES`, or `BLOCKED`. |

## What It Does

- Routes 3D prompts to the right specialist skill through a Codex hook.
- Pushes new labs toward a clear contract: lesson goal, variables, units, controls, measured output, reset, QA command.
- Adds a locked visual QA loop: generate or write a reference target before coding, record prompt/reference/fix rounds, compare desktop/mobile benchmark screenshots after coding, and keep fixing until `PASS` or a concrete blocker.
- Keeps Three.js scene lifecycle boring and reliable: camera, renderer, loop, resize, asset loading, cleanup.
- Adds a strict reviewer gate so a lab is not "done" until build, browser, canvas, interaction, mobile, physics, and asset evidence exist.

## Expected Workflow

1. Ask Codex to use `$learning-lab-3d-creator` for a complete lab or `$threejs-model-creator` for a model-heavy asset.
2. Run `$science-model-director` to map controls -> visible changes -> measured outputs.
3. Run `$threejs-design-director` to choose real 3D objects, morphology anchors, camera composition, and annotation rules.
4. Run `$threejs-art-director` to block toy-like visuals, weak materials, poor composition, and low reference likeness.
5. Run `$visual-lab-qa-agent` start pass before coding the demo. If GPT Image/imagegen is available, it should create object-focused reference sheets; otherwise it writes a compact visual target spec.
6. Record the prompt/reference/screenshot/fix loop in demo notes, a PR summary, or an evidence file. Missing loop evidence blocks visual `PASS`.
7. Use `$threejs-physics-simulation` when the lab has real formulas, collisions, forces, fields, or solver behavior.
8. Run `$threejs-performance-qa` after code changes to generate benchmark screenshots and metrics.
9. Run `$visual-lab-qa-agent` end pass. If it returns `FIX_REQUIRED`, apply the smallest concrete fix set and repeat the end pass.
10. Run `$learning-lab-qa-pm-reviewer` before saying the lab is ready.

## Visual QA Loop

This is the guardrail for the exact failure mode where a demo benchmarks well but still looks weak. `$visual-lab-qa-agent` treats machine metrics as budget checks, not proof of beauty.

Required evidence per serious demo:

- A visual target prompt/spec before implementation.
- A prompt loop ledger with prompt/spec, reference path, science/design gate verdicts, screenshot path, benchmark path, fix set, and final verdict.
- Desktop and mobile benchmark screenshots after implementation.
- A `PASS`, `FIX_REQUIRED`, or `BLOCKED` visual QA verdict.
- For Chemistry: credible apparatus, visible reaction evidence, material separation, scale/measurement cues.
- For Biology: recognizable organ/specimen/ecosystem structure, dense small details, flow/signal markers, scale cues, and FE detail-marker budget.
- For every fix loop: concrete scene changes only, such as geometry, material, lighting, camera, label, interaction, or asset-budget action.

For the KHTN demo set, the loop ledger is `examples/khtn8-subject-labs/VISUAL_QA_LOG.md`.

## Engine Choice

Default new school/curriculum labs to Three.js for speed, bundle control, DOM/UI fit, and simple scene ownership. Keep Babylon for existing game-like worlds or physics surfaces that already depend on Babylon architecture. Do not rewrite working Babylon scenes just to standardize.

## Benchmark Demos

These demos are intentionally dependency-light: each is one HTML file plus Three.js from CDN. Visual quality is for human review; the benchmark script measures the parts machines can judge.

| Demo | Source Topic | What To Benchmark |
| --- | --- | --- |
| `examples/density-buoyancy-lab/` | A20 density/KHTN8 density and buoyancy | mass, displaced volume, buoyant force, sink/float state, render/resource metrics |
| `examples/coulomb-force-lab/` | A20 Coulomb simulation | q1/q2/r, force, attraction/repulsion, arrows, render/resource metrics |
| `examples/fancy-field-lab/` | stress/fancy field visualizer | particle/field visual load, glow/material polish, state/reset, render/resource metrics |
| `examples/khtn8-subject-labs/` | KHTN 8 KNTT chemistry, physics, biology chapters | 9 subject labs, FE detail checks, mesh/texture/model-size budgets |

### KHTN 8 Subject Labs

These are selected from the local `KHTN 8-KNTT.pdf` table of contents: chemistry reaction/acid-base/rate, physics pressure/moment/electricity, and biology circulation/respiration/ecosystem. Each lab has 3+ controls, 3 measured outputs, reset, browser benchmark hooks, and formula self-checks.

| Subject | Lab | URL | What It Teaches |
| --- | --- | --- | --- |
| Chemistry | Reaction Gas | `examples/khtn8-subject-labs/index.html?lab=chem-reaction-gas` | gas formation, limiting reagent, rate cues |
| Chemistry | Acid Base pH | `examples/khtn8-subject-labs/index.html?lab=chem-acid-base` | neutralization, pH, indicator color |
| Chemistry | Catalyst Rate | `examples/khtn8-subject-labs/index.html?lab=chem-catalyst-rate` | temperature, catalyst, surface area, reaction speed |
| Physics | Fluid Pressure | `examples/khtn8-subject-labs/index.html?lab=phys-pressure` | pressure, depth, density, force on area |
| Physics | Lever Moment | `examples/khtn8-subject-labs/index.html?lab=phys-lever` | moment of force, balance, torque direction |
| Physics | Electric Circuit | `examples/khtn8-subject-labs/index.html?lab=phys-circuit` | voltage, resistance, current, bulb brightness |
| Biology | Circulation | `examples/khtn8-subject-labs/index.html?lab=bio-circulation` | heart output, vessel resistance, pulse flow |
| Biology | Respiration | `examples/khtn8-subject-labs/index.html?lab=bio-respiration` | lung expansion, ventilation, oxygen uptake |
| Biology | Ecosystem Balance | `examples/khtn8-subject-labs/index.html?lab=bio-ecosystem` | producers, consumers, pollution, stability |

### Benchmark Screenshots

These screenshots are generated by `scripts/benchmark-examples.mjs` from the same desktop/mobile runs as the metrics.

| Demo | Desktop Benchmark | Mobile Benchmark |
| --- | --- | --- |
| Density buoyancy | <img src="examples/density-buoyancy-lab/screenshots/desktop-benchmark.png" alt="Density buoyancy desktop benchmark" width="360"> | <img src="examples/density-buoyancy-lab/screenshots/mobile-benchmark.png" alt="Density buoyancy mobile benchmark" width="180"> |
| Coulomb force | <img src="examples/coulomb-force-lab/screenshots/desktop-benchmark.png" alt="Coulomb force desktop benchmark" width="360"> | <img src="examples/coulomb-force-lab/screenshots/mobile-benchmark.png" alt="Coulomb force mobile benchmark" width="180"> |
| Fancy field | <img src="examples/fancy-field-lab/screenshots/desktop-benchmark.png" alt="Fancy field desktop benchmark" width="360"> | <img src="examples/fancy-field-lab/screenshots/mobile-benchmark.png" alt="Fancy field mobile benchmark" width="180"> |
| KHTN Chemistry gas | <img src="examples/khtn8-subject-labs/screenshots/chem-reaction-gas-desktop-benchmark.png" alt="Chemistry gas desktop benchmark" width="360"> | <img src="examples/khtn8-subject-labs/screenshots/chem-reaction-gas-mobile-benchmark.png" alt="Chemistry gas mobile benchmark" width="180"> |
| KHTN Physics circuit | <img src="examples/khtn8-subject-labs/screenshots/phys-circuit-desktop-benchmark.png" alt="Physics circuit desktop benchmark" width="360"> | <img src="examples/khtn8-subject-labs/screenshots/phys-circuit-mobile-benchmark.png" alt="Physics circuit mobile benchmark" width="180"> |
| KHTN Biology circulation | <img src="examples/khtn8-subject-labs/screenshots/bio-circulation-desktop-benchmark.png" alt="Biology circulation desktop benchmark" width="360"> | <img src="examples/khtn8-subject-labs/screenshots/bio-circulation-mobile-benchmark.png" alt="Biology circulation mobile benchmark" width="180"> |
| KHTN Biology respiration | <img src="examples/khtn8-subject-labs/screenshots/bio-respiration-desktop-benchmark.png" alt="Biology respiration desktop benchmark" width="360"> | <img src="examples/khtn8-subject-labs/screenshots/bio-respiration-mobile-benchmark.png" alt="Biology respiration mobile benchmark" width="180"> |
| KHTN Biology ecosystem | <img src="examples/khtn8-subject-labs/screenshots/bio-ecosystem-desktop-benchmark.png" alt="Biology ecosystem desktop benchmark" width="360"> | <img src="examples/khtn8-subject-labs/screenshots/bio-ecosystem-mobile-benchmark.png" alt="Biology ecosystem mobile benchmark" width="180"> |

### 2D Reference To 3D Biology Output

The biology demos keep the generated 2D input references next to the benchmark screenshots so reviewers can compare morphology, not just FPS. The full prompt/fix history is in `examples/khtn8-subject-labs/VISUAL_QA_LOG.md`.

| Lab | 2D Reference Input | 3D Desktop Output | 3D Mobile Output |
| --- | --- | --- | --- |
| Circulation | <img src="examples/khtn8-subject-labs/references/bio-circulation-reference.png" alt="Circulation 2D reference" width="220"> | <img src="examples/khtn8-subject-labs/screenshots/bio-circulation-desktop-benchmark.png" alt="Circulation 3D desktop output" width="300"> | <img src="examples/khtn8-subject-labs/screenshots/bio-circulation-mobile-benchmark.png" alt="Circulation 3D mobile output" width="150"> |
| Respiration | <img src="examples/khtn8-subject-labs/references/bio-respiration-reference.png" alt="Respiration 2D reference" width="220"> | <img src="examples/khtn8-subject-labs/screenshots/bio-respiration-desktop-benchmark.png" alt="Respiration 3D desktop output" width="300"> | <img src="examples/khtn8-subject-labs/screenshots/bio-respiration-mobile-benchmark.png" alt="Respiration 3D mobile output" width="150"> |
| Ecosystem | <img src="examples/khtn8-subject-labs/references/bio-ecosystem-reference.png" alt="Ecosystem 2D reference" width="220"> | <img src="examples/khtn8-subject-labs/screenshots/bio-ecosystem-desktop-benchmark.png" alt="Ecosystem 3D desktop output" width="300"> | <img src="examples/khtn8-subject-labs/screenshots/bio-ecosystem-mobile-benchmark.png" alt="Ecosystem 3D mobile output" width="150"> |

### Optimization Benchmark Highlights

Recorded demo run: 24/24 desktop/mobile benchmark profiles pass. The point is not just "pretty"; each demo proves render budget, state integrity, reset, responsive layout, local asset size, model size, texture size, and FE fit.

Read the FPS numbers as browser-frame pacing, not maximum GPU throughput. Headless Chrome and `requestAnimationFrame` can sit near the display/runtime cadence, so the stronger optimization signals are p95 frame time, draw calls, triangles, texture count, transfer size, and whether state mutation/reset stays deterministic. The benchmark takes two warmed frame-pacing runs per viewport, disables headless background throttling, closes pages between profiles, and keeps the steadier run to avoid false failures from transient headless/GC spikes.

| Demo Profile | FPS vs >=55 | P95 Frame vs <=25ms | Draw Calls vs <=180 | Geometry Load | Textures vs <=16 | Transfer vs <=900KB | State |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Fancy field desktop | 63 FPS (+15%) | 21.0 ms (16% under) | 44 (76% under) | 15,010 tris, 520 points | 4 (75% under) | 389 KB (57% under) | mutate/reset ok |
| Fancy field mobile | 144 FPS (+162%) | 7.1 ms (72% under) | 33 (82% under) | 14,730 tris, 520 points | 4 (75% under) | 0 KB | mutate/reset ok |
| Density buoyancy desktop | 60 FPS (+9%) | 21.0 ms (16% under) | 11 (94% under) | 964 tris | 2 (88% under) | 0 KB | mutate/reset ok |
| Density buoyancy mobile | 126 FPS (+129%) | 13.9 ms (44% under) | 10 (94% under) | 836 tris | 2 (88% under) | 0 KB | mutate/reset ok |
| Coulomb force desktop | 129 FPS (+135%) | 13.9 ms (44% under) | 22 (88% under) | 4,820 tris | 1 (94% under) | 0 KB | mutate/reset ok |
| Coulomb force mobile | 144 FPS (+162%) | 7.1 ms (72% under) | 22 (88% under) | 4,820 tris | 1 (94% under) | 0 KB | mutate/reset ok |

KHTN 8 subject labs are dependency-light: each profile loads `72 KB` of local code/assets, `0 MB` model assets, and `0 MB` texture assets because the apparatus is procedural. This is intentional for curriculum labs: use GLB only when shape fidelity teaches the concept.

| KHTN Lab | Desktop/Mobile FPS | P95 Frame | Draw Calls | Geometry | Local Size | Model / Texture |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Reaction Gas | 104 / 144 | 14.0 / 7.1 ms | 45 | 8,858 tris | 72 KB | 0 / 0 MB |
| Acid Base pH | 123 / 144 | 14.0 / 7.1 ms | 37 | 6,826 tris | 72 KB | 0 / 0 MB |
| Catalyst Rate | 115 / 144 | 14.0 / 7.1 ms | 71 | 13,026 tris | 72 KB | 0 / 0 MB |
| Fluid Pressure | 119 / 144 | 14.0 / 7.0 ms | 27 | 2,348 tris | 72 KB | 0 / 0 MB |
| Lever Moment | 122 / 144 | 14.0 / 7.1 ms | 22 | 926 tris | 72 KB | 0 / 0 MB |
| Electric Circuit | 111 / 144 | 14.1 / 7.1 ms | 34 | 11,072 tris | 72 KB | 0 / 0 MB |
| Circulation | 98 / 144 | 14.1 / 7.1 ms | 87 | 62,030 tris, 71 detail markers | 72 KB | 0 / 0 MB |
| Respiration | 91 / 144 | 14.1 / 7.1 ms | 151 | 99,788 tris, 162 detail markers | 72 KB | 0 / 0 MB |
| Ecosystem Balance | 77 / 144 | 20.9 / 7.1 ms | 110 | 94,986 tris, 644 detail markers | 72 KB | 0 / 0 MB |

What is deliberately optimized:

- Formula-based simulations for density and Coulomb force; no physics engine where equations are enough.
- Procedural Three.js geometry; no GLB/model payload for these curriculum labs.
- Capped pixel ratio, resize-safe canvas, and no heavy postprocessing in the stress demo.
- Low texture pressure: 1-6 renderer textures per demo, all under the 16-texture budget.
- Low draw-call pressure: 10-151 calls, all under the 180-call budget.
- Asset-size pressure is measured: local loaded code/assets <=512 KB, largest model <=3 MB, loaded textures <=4 MB.
- Biology FE is stricter: no text overflow, no small touch targets, and `detailMarkers >= 20` for dense biology scenes.
- Dense biology exceptions are explicit: respiration and ecosystem exceed the 60k default triangle guideline for morphology detail, but pass p95 frame, draw-call, texture, mobile, and asset-size budgets.
- State benchmark hooks: each demo exposes mutate/reset checks so controls must change measured output and reset must restore initial state.
- Desktop/mobile screenshots and panel-bounds checks come from the same benchmark run as the numbers.

### Interaction And Physics Coverage

| Demo | Interaction Covered | Physics/Simulation Covered | What This Proves | Not Yet Covered |
| --- | --- | --- | --- | --- |
| Density buoyancy | material buttons, volume slider, liquid-density slider, orbit, reset | `mass = density * volume`, displaced volume, buoyant force, sink/float branch | formula lab can stay small, measurable, and responsive | real fluid dynamics, collision/contact solver |
| Coulomb force | q1/q2 sliders, distance slider, orbit, reset | signed Coulomb force, attraction/repulsion, force arrows, distance clamp | force lab can expose units, result, sign, and vector feedback without a physics engine | many-body field solver, charge trajectories |
| Fancy field | presets, strength/flow/turbulence sliders, pause/play, orbit, reset | fixed-step animated field visualization, particles, vector cues | stress scene can keep visual richness under render/resource budgets | physically accurate electromagnetic solver |

Current benchmark suite is intentionally not a complete physics-engine benchmark. It does not yet prove rigid bodies, joints, constraints, cloth/fluid simulation, GLB texture streaming, long-run memory stability, agent report flow, or quiz/chatbot integration. Add those as separate demos when those capabilities matter; mixing them into these small A20-style labs would make the benchmark less readable.

Run the benchmark harness:

```bash
node scripts/benchmark-examples.mjs
```

Current benchmark evidence is summarized in `examples/BENCHMARK_RESULTS.md`; the full machine-readable output is `examples/benchmark-results.json`.

It reports:

- FPS average and p95 frame time.
- load time and resource transfer.
- renderer info: draw calls, triangles, points, lines, geometries, textures.
- asset size: loaded local code/assets KB, largest model MB, loaded texture MB.
- canvas size, pixel ratio, and sampled canvas coverage.
- state mutation latency and reset integrity.
- desktop/mobile panel bounds, touch target size, text overflow, and biology detail markers.

Physics correctness is covered by the tiny per-demo self-checks:

```bash
node examples/density-buoyancy-lab/self-check.mjs
node examples/coulomb-force-lab/self-check.mjs
node examples/fancy-field-lab/self-check.mjs
node examples/khtn8-subject-labs/self-check.mjs
```

Prompt shape that this repo is designed to support:

```text
Use $learning-lab-3d-creator and $threejs-physics-simulation to build an A20-style density or Coulomb lab with live controls, units, reset, render metrics, state metrics, browser QA, and strict PM review.
```

## Hooks

- Plugin hook: `plugins/threejs-lab/hooks/hooks.json` routes 3D/physics prompts toward the right skill.
- Git hook: run `bash scripts/setup_hooks.sh` once to install a pre-push validator.

## Add A Skill

```bash
node scripts/new-skill.mjs my-skill "Use when ..."
node scripts/validate.mjs
```

Then reinstall:

```bash
node scripts/install.mjs --agent codex --global
```

## Contents

- `.agents/plugins/marketplace.json`
- `examples/density-buoyancy-lab/`
- `examples/coulomb-force-lab/`
- `examples/fancy-field-lab/`
- `examples/khtn8-subject-labs/`
- `plugins/threejs-lab/.codex-plugin/plugin.json`
- `plugins/threejs-lab/hooks/`
- `plugins/threejs-lab/skills/`
- `scripts/`

## Validation

```bash
npm test
python tests/blender_export_test.py
npm run validate
npm run check:package
```

`plugins/threejs-lab/skills/threejs-lab/scripts/check-threejs-lab.mjs` is the small static checker for changed scene files. It catches missing camera/loop/resize/cleanup patterns and common GLB/physics omissions.
`scripts/validate.mjs` also checks the KHTN biology visual QA ledger, 2D references, desktop/mobile screenshots, and 24-profile benchmark JSON.

</details>
