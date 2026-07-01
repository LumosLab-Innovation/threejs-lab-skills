# Three.js Lab Codex Plugin

Local Codex marketplace plugin for Lab029s-grade 3D model, Three.js lab, physics simulation, optimization, and QA work.

## Install

From any checkout of this repo:

```bash
node scripts/install.mjs
```

Start a new Codex thread after installing so the `$threejs-lab` skill is loaded.

## Skills

- `$threejs-lab`: router and baseline Three.js workflow.
- `$lab029s-3d-creator`: complete Lab029s lab creator workflow.
- `$threejs-model-creator`: procedural/GLB models, materials, assets.
- `$threejs-physics-simulation`: calibrated simulation and physics engines.
- `$threejs-performance-qa`: build, browser, canvas, asset, and performance QA.
- `$lab029s-qa-pm-reviewer`: strict PM/QA gate or subagent prompt.

## Engine Decision

Default new Lab029s school labs to Three.js for speed, bundle control, DOM/UI fit, and the existing simulation code style. Keep Babylon for existing game-like worlds or physics surfaces that already depend on Babylon architecture. Do not rewrite working Babylon scenes just to standardize.

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
- `plugins/threejs-lab/.codex-plugin/plugin.json`
- `plugins/threejs-lab/hooks/`
- `plugins/threejs-lab/skills/`
- `scripts/`
