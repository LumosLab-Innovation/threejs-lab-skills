# Sources

Reviewed while creating this plugin:

- https://github.com/mattzh72/articraft at `59eb5e0`
- https://github.com/CloudAI-X/threejs-skills at `b1c6230`
- https://github.com/cloudai-x/threejs-skills at `b1c6230`

The two `threejs-skills` URLs resolved to the same commit in this checkout.

Also inspected local Lab029s project structure in `E:\Projects\A20-App-029` for stack-specific conventions: Vite/React frontend, imperative Three.js simulation controllers, R3F/drei availability, Babylon/cannon-es physics, and existing simulation folders.

Additional web research:

- CloudAI-X/threejs-skills README: focused Three.js skill bundle covering fundamentals through interaction.
- Three.js manual/docs: baseline for current Three.js concepts and API behavior.
- React Three Fiber docs: R3F wraps Three.js without feature limits, but performance guidance warns against setState in render loops and recommends reuse/instancing.
- Babylon.js docs/site: Babylon is a full engine with built-in tooling and physics plugin patterns, useful for game-like scenes rather than every curriculum lab.
