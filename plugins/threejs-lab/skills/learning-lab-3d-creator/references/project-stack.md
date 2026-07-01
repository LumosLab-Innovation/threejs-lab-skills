# Project Stack Notes

Observed stack in `E:\Projects\A20-App-029`:

- Frontend: Vite, React 19, TypeScript, Tailwind 4.
- 3D deps: `three@0.183`, `@react-three/fiber`, `@react-three/drei`, `cannon-es`, Babylon core/loaders.
- Common 3D folders: `services/frontend/src/components/simulations/*`, `features/game/*/scene`, `components/atoms`.
- Existing simulation pattern: React component owns state; `setup<Name>Scene.ts` owns imperative Three.js lifecycle; control panel and shared chatbot/report/question components sit above the scene.
- Existing QA scripts: `npm --prefix services/frontend run build`, `npm --prefix services/frontend run lint`.

Prefer these local surfaces:

- New KHTN8 lesson: `components/simulations/khtn8`.
- New full experiment: sibling folder under `components/simulations/<topic>`.
- Shared 3D lab room/robot ideas: inspect `components/simulations/shared/labEnvironment.ts` and `robotAssistant.ts`.
- Agent-connected flow: inspect `DensityLab.tsx` and `ElectricityCoulombsLaw.tsx`.
- Physics/Babylon flow: inspect `features/game/mars-mission/scene/physicsSetup.ts`.

Do not add a second scene framework inside one lab. If the lab starts in Three.js, keep the feature in Three.js unless there is a strong reason to move a whole surface.
