# Benchmark Results

Generated from `node scripts/benchmark-examples.mjs` on 2026-07-02 00:32 ICT.

All benchmark budgets passed for desktop and mobile profiles.

## How To Read These Numbers

Average FPS is a browser-frame pacing signal, not a maximum GPU-throughput score. In headless Chrome, desktop runs can sit near the runtime cadence even when draw calls, triangles, textures, and transfer size are low. Use p95 frame time, renderer counts, texture count, transfer size, and state/reset integrity as the main optimization evidence.

## Budgets

| Metric | Budget |
| --- | --- |
| Console errors | 0 |
| Average FPS | >= 55 |
| P95 frame time | <= 25 ms |
| Pixel ratio | <= 2 |
| Draw calls | <= 180 |
| Textures | <= 16 |
| Resource transfer | <= 900 KB |
| Canvas coverage | >= 2% sampled lit pixels |
| State | mutate changes state and reset restores initial state |
| Responsive UI | control panel remains inside viewport |

## Results

| Demo | Profile | Pass | FPS | P95 Frame | Load | Draw Calls | Triangles | Points | Textures | Transfer | State |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `fancy-field-lab` | desktop | yes | 63 | 20.9 ms | 896 ms | 44 | 15,010 | 520 | 4 | 255 KB | mutate/reset ok |
| `fancy-field-lab` | mobile | yes | 143 | 7.1 ms | 346 ms | 33 | 14,730 | 520 | 4 | 0 KB | mutate/reset ok |
| `density-buoyancy-lab` | desktop | yes | 68 | 21.0 ms | 733 ms | 11 | 964 | 0 | 2 | 0 KB | mutate/reset ok |
| `density-buoyancy-lab` | mobile | yes | 137 | 13.2 ms | 458 ms | 10 | 836 | 0 | 2 | 0 KB | mutate/reset ok |
| `coulomb-force-lab` | desktop | yes | 113 | 14.3 ms | 217 ms | 22 | 4,820 | 0 | 1 | 0 KB | mutate/reset ok |
| `coulomb-force-lab` | mobile | yes | 145 | 7.0 ms | 288 ms | 22 | 4,820 | 0 | 1 | 0 KB | mutate/reset ok |

## Evidence Files

- Machine-readable results: `examples/benchmark-results.json`
- Screenshots:
  - `examples/fancy-field-lab/screenshots/desktop-benchmark.png`
  - `examples/fancy-field-lab/screenshots/mobile-benchmark.png`
  - `examples/density-buoyancy-lab/screenshots/desktop-benchmark.png`
  - `examples/density-buoyancy-lab/screenshots/mobile-benchmark.png`
  - `examples/coulomb-force-lab/screenshots/desktop-benchmark.png`
  - `examples/coulomb-force-lab/screenshots/mobile-benchmark.png`

Visual quality still needs human review. The benchmark only checks objective render, runtime, state, resource, and responsive-layout signals.

## Coverage

| Demo | Interaction Evidence | Physics/Simulation Evidence | Gap |
| --- | --- | --- | --- |
| `density-buoyancy-lab` | material selection, volume/liquid sliders, orbit, reset, mutate/reset hook | self-check covers mass, displaced volume, buoyant force, sink/float | no real fluid/contact solver |
| `coulomb-force-lab` | q1/q2/distance sliders, orbit, reset, mutate/reset hook | self-check covers signed Coulomb force for known inputs | no many-body solver or moving charge trajectories |
| `fancy-field-lab` | presets, strength/flow/turbulence sliders, pause/play, orbit, reset, mutate/reset hook | fixed-step animated field visualization and particle/vector cues | visual field model, not a calibrated electromagnetic solver |

Not covered yet: rigid bodies, joints, constraints, cloth/fluid simulation, GLB texture streaming, long-run memory stability, agent report flow, quiz/chatbot integration. Those should be separate benchmark demos, not hidden inside these small A20-style examples.
