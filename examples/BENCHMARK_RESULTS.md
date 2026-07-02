# Benchmark Results

Generated from `node scripts/benchmark-examples.mjs` on 2026-07-02 09:59 ICT.

All 24 benchmark profiles passed: 3 original demos plus 9 KHTN8 subject labs across desktop and mobile.

## Budgets

| Metric | Budget |
| --- | --- |
| Console errors | 0 |
| Average FPS | >= 55 |
| P95 frame time | <= 25 ms |
| Pixel ratio | <= 2 |
| Draw calls | <= 180 |
| Renderer textures | <= 16 |
| Resource transfer | <= 900 KB |
| Loaded local code/assets | <= 512 KB |
| Largest loaded model | <= 3 MB |
| Loaded texture assets | <= 4 MB |
| Canvas coverage | >= 2% sampled lit pixels |
| State | mutate changes state and reset restores initial state |
| Responsive UI | control panel remains inside viewport |
| FE text | no horizontal text overflow |
| FE touch targets | no target below 44 px wide or 28 px tall |
| Biology detail | `detailMarkers >= 20` for biology labs |

## How To Read These Numbers

Average FPS is a browser-frame pacing signal, not a maximum GPU-throughput score. The harness measures two warmed frame-pacing runs per viewport, disables headless background throttling, closes pages between profiles, and keeps the steadier run to avoid failing light scenes on transient headless/GC spikes. Use p95 frame time, renderer counts, loaded local size, model MB, texture MB, and state/reset integrity as the main optimization evidence.

## Results

| Demo | Profile | Pass | FPS | P95 Frame | Calls | Triangles | Textures | Local Size | Model | Texture Assets | FE |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `fancy-field-lab` | desktop | yes | 63 | 21.0 ms | 44 | 15,010 | 4 | 20.9 KB | 0 MB | 0 MB | ok |
| `fancy-field-lab` | mobile | yes | 144 | 7.1 ms | 33 | 14,730 | 4 | 20.9 KB | 0 MB | 0 MB | ok |
| `density-buoyancy-lab` | desktop | yes | 60 | 21.0 ms | 11 | 964 | 2 | 10.6 KB | 0 MB | 0 MB | ok |
| `density-buoyancy-lab` | mobile | yes | 126 | 13.9 ms | 10 | 836 | 2 | 10.6 KB | 0 MB | 0 MB | ok |
| `coulomb-force-lab` | desktop | yes | 129 | 13.9 ms | 22 | 4,820 | 1 | 10.5 KB | 0 MB | 0 MB | ok |
| `coulomb-force-lab` | mobile | yes | 144 | 7.1 ms | 22 | 4,820 | 1 | 10.5 KB | 0 MB | 0 MB | ok |
| `chem-reaction-gas` | desktop/mobile | yes | 104 / 144 | 14.0 / 7.1 ms | 45 | 8,858 | 4 | 72 KB | 0 MB | 0 MB | ok |
| `chem-acid-base` | desktop/mobile | yes | 123 / 144 | 14.0 / 7.1 ms | 37 | 6,826 | 4 | 72 KB | 0 MB | 0 MB | ok |
| `chem-catalyst-rate` | desktop/mobile | yes | 115 / 144 | 14.0 / 7.1 ms | 71 | 13,026 | 4 | 72 KB | 0 MB | 0 MB | ok |
| `phys-pressure` | desktop/mobile | yes | 119 / 144 | 14.0 / 7.0 ms | 27 | 2,348 | 1 | 72 KB | 0 MB | 0 MB | ok |
| `phys-lever` | desktop/mobile | yes | 122 / 144 | 14.0 / 7.1 ms | 22 | 926 | 1 | 72 KB | 0 MB | 0 MB | ok |
| `phys-circuit` | desktop/mobile | yes | 111 / 144 | 14.1 / 7.1 ms | 34 | 11,072 | 1 | 72 KB | 0 MB | 0 MB | ok |
| `bio-circulation` | desktop/mobile | yes | 98 / 144 | 14.1 / 7.1 ms | 87 | 62,030 | 4 | 72 KB | 0 MB | 0 MB | 71 details |
| `bio-respiration` | desktop/mobile | yes | 91 / 144 | 14.1 / 7.1 ms | 151 | 99,788 | 5 | 72 KB | 0 MB | 0 MB | 162 details |
| `bio-ecosystem` | desktop/mobile | yes | 77 / 144 | 20.9 / 7.1 ms | 110 | 94,986 | 6 | 72 KB | 0 MB | 0 MB | 644 details |

## Coverage

| Demo Group | Interaction Evidence | Simulation Evidence | Asset Evidence |
| --- | --- | --- | --- |
| Chemistry | sliders/toggles, orbit, reset, mutate/reset hook | gas amount, pH neutralization, catalyst/rate formulas | procedural apparatus, 72 KB local, 0 MB model, 0 MB textures |
| Physics | sliders/toggles, orbit, reset, mutate/reset hook | pressure, moment, circuit formulas | procedural apparatus, 72 KB local, 0 MB model, 0 MB textures |
| Biology | sliders, orbit, reset, mutate/reset hook, strict FE checks | circulation, respiration, ecosystem formulas | 71-644 detail markers, 72 KB local, 0 MB model, 0 MB textures |

## Evidence Files

- Machine-readable results: `examples/benchmark-results.json`
- KHTN screenshots: `examples/khtn8-subject-labs/screenshots/*-benchmark.png`
- Original screenshots:
  - `examples/fancy-field-lab/screenshots/desktop-benchmark.png`
  - `examples/fancy-field-lab/screenshots/mobile-benchmark.png`
  - `examples/density-buoyancy-lab/screenshots/desktop-benchmark.png`
  - `examples/density-buoyancy-lab/screenshots/mobile-benchmark.png`
  - `examples/coulomb-force-lab/screenshots/desktop-benchmark.png`
  - `examples/coulomb-force-lab/screenshots/mobile-benchmark.png`

Visual quality still needs human review. The benchmark checks objective render, runtime, state, resource, asset-size, and responsive-layout signals.
