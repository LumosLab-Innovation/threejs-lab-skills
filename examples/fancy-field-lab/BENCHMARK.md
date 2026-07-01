# Fancy Field Lab Benchmark

## Prompt

```text
Use $learning-lab-3d-creator, $threejs-model-creator, $threejs-physics-simulation, $threejs-performance-qa, and $learning-lab-qa-pm-reviewer to build a fancy electromagnetic field learning lab with live controls, units, pause/reset, fixed-step simulation, browser QA, and strict PM review.
```

## Skill Trace

- `$learning-lab-3d-creator`: lab contract, units, manipulated/measured variables, pause/reset, first-frame phenomenon.
- `$threejs-model-creator`: hero plasma core, electrodes, field tubes, particles, vector arrows, sprite labels, material hierarchy.
- `$threejs-physics-simulation`: deterministic seed, fixed timestep, bounded delta, calibrated readouts.
- `$threejs-performance-qa`: pixel-ratio cap, resize path, canvas check, static checker, browser screenshot.
- `$learning-lab-qa-pm-reviewer`: blocks if browser evidence, reset, units, controls, or visual hierarchy are missing.

## Lab Contract

- Lesson goal: show how field strength, particle flow, and turbulence change field flux and plasma energy.
- Manipulated variables: field strength in tesla, particle flow in m/s, turbulence from 0 to 1.
- Measured variables: field, flux percentage, energy in kJ.
- Scene objects: glass/emissive core, electrodes, field tubes, orbiting particles, vector arrows, labels, instrument console.
- Interactions: orbit/zoom, three presets, three sliders, pause/play, reset.
- Reset behavior: restores initial inputs, camera, palette, paused state, and simulation time.
- QA command: run `node examples/fancy-field-lab/self-check.mjs`, `node scripts/check-threejs-lab.mjs examples/fancy-field-lab/index.html`, and browser screenshot/probe checks.

## Evidence

- `node examples/fancy-field-lab/self-check.mjs`: pass.
- `node scripts/check-threejs-lab.mjs examples/fancy-field-lab/index.html`: pass.
- Chrome browser probe: no console/page errors, WebGL present, 4 lit canvas samples, slider changed field to `2.80 T` and flux to `100%`, pause changed to `Play`, reset restored `1.45 T` and `52%`, mobile panel width `366/390`.
- Screenshots: `screenshots/desktop.png`, `screenshots/mobile.png`.
