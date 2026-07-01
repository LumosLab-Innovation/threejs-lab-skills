# Coulomb Force Lab Benchmark

## Source Topic

Based on `services/frontend/src/components/simulations/coulombs/constants.ts` and `setupCoulombsScene.ts` in the A20 project: q1/q2/distance controls, Coulomb force, attractive/repulsive arrows, and pixel-ratio cap.

## Prompt

```text
Use $learning-lab-3d-creator, $threejs-model-creator, $threejs-physics-simulation, $threejs-performance-qa, and $learning-lab-qa-pm-reviewer to build a lean Coulomb benchmark lab from the A20 Coulomb experiment, with force arrows, units, reset, render metrics, texture metrics, state metrics, and browser QA.
```

## Benchmark Dimensions

- Learning state: q1, q2, distance, force, attractive/repulsive nature.
- Render state: draw calls, lines, geometries, textures, pixel ratio, canvas size.
- Runtime state: FPS average, p95 frame time, load time, resource transfer, control mutation latency, reset integrity.
- Visual QA: screenshots remain human-reviewed; script only checks canvas coverage and viewport bounds.
