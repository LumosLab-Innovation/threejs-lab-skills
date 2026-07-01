---
name: threejs-performance-qa
description: Verify and optimize Three.js, React Three Fiber, Babylon, and Lab029s 3D labs before shipping. Use for visual QA, blank canvas debugging, WebGL performance, memory cleanup, responsive canvas checks, build/lint verification, Playwright screenshots, canvas pixel checks, GLB asset failures, and release readiness.
---

# Three.js Performance QA

A 3D lab is not complete when TypeScript passes. It is complete when the learner can see, manipulate, reset, and understand it on the target viewport.

## Checks

1. Build/lint with the repo's scripts.
2. Run static Three.js checks on changed scene files.
3. Start the app and inspect desktop and mobile.
4. Check console errors, asset 404s, nonblank canvas, camera framing, controls, reset, and performance.
5. Run `$lab029s-qa-pm-reviewer` for non-trivial Lab029s 3D labs before claiming done.
6. Report skipped visual checks explicitly.

## Lab029s Defaults

```bash
npm --prefix services/frontend run build
npm --prefix services/frontend run lint
```

Run the plugin static check from a target repo:

```bash
node <plugin-root>/scripts/check-threejs-lab.mjs <changed-scene-file.tsx>
```

## Budgets

- Pixel ratio cap: 1.5 for dense lab pages, 2 max for showcase scenes.
- First visible lab frame: under 2 seconds on dev machine.
- Repeated markers/particles: use instancing or pooled objects.
- Dispose everything on unmount.
- No mobile panel overlap that hides the main phenomenon.

## References

Read `references/qa-checklist.md` for browser triage, asset QA, and release criteria.
