# Density Buoyancy Lab Benchmark

## Source Topic

Based on `services/frontend/src/components/simulations/density/constants.ts` in the A20 project: density materials, mass = density * volume, and KHTN8 density/buoyancy learning flow.

## Prompt

```text
Use $learning-lab-3d-creator, $threejs-model-creator, $threejs-physics-simulation, $threejs-performance-qa, and $learning-lab-qa-pm-reviewer to build a lean density/buoyancy benchmark lab from the A20 density experiment, with units, sink/float behavior, state reset, render metrics, texture metrics, and browser QA.
```

## Benchmark Dimensions

- Learning state: material, volume, liquid density, mass, displaced volume, buoyant force, sink/float.
- Render state: draw calls, triangles, geometries, textures, pixel ratio, canvas size.
- Runtime state: FPS average, p95 frame time, load time, resource transfer, control mutation latency, reset integrity.
- Visual QA: screenshots remain human-reviewed; script only checks canvas coverage and viewport bounds.
