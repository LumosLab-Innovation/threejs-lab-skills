# Physics Simulation Patterns

## Core Pattern

Keep three layers separate:

1. Constants and state: mass, velocity, charge, volume, temperature, unit labels.
2. Solver: deterministic function that updates state.
3. View sync: transforms, labels, vectors, charts, sounds.

This makes reset, testing, and agent `state_snapshot` straightforward.

## Common Lab Models

- Density: `rho = m / V`; show mass, volume, ratio, material comparison.
- Coulomb: `F = k q1 q2 / r^2`; clamp `r` to avoid singularity in UI.
- Capacitance: `C = epsilon A / d`; show plate area, distance, dielectric.
- Lever: torque balance `tau = F * r`; show pivot, arm, force vector.
- Projectile: fixed-step `v += g*dt`, `x += v*dt`; show trail and range.
- Pendulum: small-angle or numerical; expose damping/calibration.
- Heat: lumped model for school labs; show energy, mass, specific heat, temperature.
- Optics: ray lines and intersections are clearer than full wave simulation.

## Engine Use

Use `cannon-es` when collision/contact matters:

- world gravity as explicit vector.
- fixed timestep.
- one physics body per moving object.
- copy body position/quaternion to mesh after stepping.
- dispose event listeners and remove bodies on teardown.

For Babylon physics in an existing app, follow the local `enableScenePhysics` pattern and avoid mixing Babylon and Three.js in the same viewport.

## Calibration

Real labs drift. Keep knobs such as:

- damping coefficient
- restitution
- friction
- sensor bias
- display rounding
- timestep cap

Mark deliberate approximations in code with a short `ponytail:` comment and the upgrade path.

## Validation

Add the smallest check that catches broken physics:

- assert formula outputs for known inputs.
- assert reset returns initial state.
- assert conserved/invariant quantity where applicable.
- assert collision body count equals rendered moving object count.

For visual-only effects, browser screenshot QA is still required.
