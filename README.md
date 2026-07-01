# Three.js Lab Codex Plugin

Local Codex marketplace plugin for production-grade 3D learning labs, Three.js models, physics simulation, optimization, and QA.

![Aurora Field Lab preview](examples/fancy-field-lab/screenshots/desktop.png)

## Why This Exists

Most 3D lab prompts fail in the same places: pretty canvas but weak learning goal, no units, no reset, broken mobile layout, missing asset path, fake physics, or no browser evidence. This plugin gives Codex a tighter workflow for shipping real learning-lab scenes instead of decorative demos.

## Install

From any checkout of this repo:

```bash
node scripts/install.mjs
```

Start a new Codex thread after installing so the skill metadata is loaded.

## Skills

| Skill | Use It For | Main Effect |
| --- | --- | --- |
| `$threejs-lab` | Any 3D/canvas/Three.js lab prompt | Routes to the specific specialist skill and enforces baseline scene lifecycle. |
| `$learning-lab-3d-creator` | Full educational experiments, lesson scenes, agent-connected labs | Creates a lab contract, file split, controls, units, result loop, reset, and verification path. |
| `$threejs-model-creator` | Procedural models, GLB/GLTF, materials, apparatus, labels | Keeps models semantic, scaled, articulated, optimized, and disposable. |
| `$threejs-physics-simulation` | Forces, fields, collisions, particles, density, heat, optics, rigid bodies | Chooses formula/custom solver/`cannon-es`/Babylon physics with units and fixed timestep where needed. |
| `$threejs-performance-qa` | Blank canvas, asset 404s, slow scenes, release checks | Requires build, browser/canvas checks, responsive framing, cleanup, and performance budget. |
| `$learning-lab-qa-pm-reviewer` | Final review before merge/demo/shipping | Acts as the strict PM/QA gate: `PASS`, `PASS_WITH_NOTES`, or `BLOCKED`. |

## What It Does

- Routes 3D prompts to the right specialist skill through a Codex hook.
- Pushes new labs toward a clear contract: lesson goal, variables, units, controls, measured output, reset, QA command.
- Keeps Three.js scene lifecycle boring and reliable: camera, renderer, loop, resize, asset loading, cleanup.
- Adds a strict reviewer gate so a lab is not "done" until build, browser, canvas, interaction, mobile, physics, and asset evidence exist.

## Expected Workflow

1. Ask Codex to use `$learning-lab-3d-creator` for a complete lab or `$threejs-model-creator` for a model-heavy asset.
2. Use `$threejs-physics-simulation` when the lab has real formulas, collisions, forces, fields, or solver behavior.
3. Run `$threejs-performance-qa` after code changes.
4. Run `$learning-lab-qa-pm-reviewer` before saying the lab is ready.

## Engine Choice

Default new school/curriculum labs to Three.js for speed, bundle control, DOM/UI fit, and simple scene ownership. Keep Babylon for existing game-like worlds or physics surfaces that already depend on Babylon architecture. Do not rewrite working Babylon scenes just to standardize.

## Example Product

Open `examples/fancy-field-lab/index.html` in a browser for a self-contained fancy demo scene: an interactive electromagnetic field lab with animated field lines, charged particles, live readings, and compact controls. It is intentionally dependency-light: one HTML file plus Three.js from CDN.

Prompt shape that this repo is designed to support:

```text
Use $learning-lab-3d-creator and $threejs-physics-simulation to build a fancy electromagnetic field lab with live controls, units, reset, browser QA, and strict PM review.
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
node scripts/install.mjs
```

## Contents

- `.agents/plugins/marketplace.json`
- `examples/fancy-field-lab/`
- `plugins/threejs-lab/.codex-plugin/plugin.json`
- `plugins/threejs-lab/hooks/`
- `plugins/threejs-lab/skills/`
- `scripts/`

## Validation

```bash
node scripts/validate.mjs
bash .git/hooks/pre-push
```

`scripts/check-threejs-lab.mjs` is the small static checker for changed scene files. It catches missing camera/loop/resize/cleanup patterns and common GLB/physics omissions.
