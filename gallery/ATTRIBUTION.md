# Gallery sources and licenses

These four models are adapted from **Lab029s**, not a claim of new image-to-mesh reconstruction or newly generated Blender assets. Only the models are presented; no lesson UI, student data or assessment content is copied.

Source repository: [LumosLab-Innovation/Lab029s](https://github.com/LumosLab-Innovation/Lab029s/tree/ead290a22869266df4f60483b67af5fd19ea576c), revision `ead290a22869266df4f60483b67af5fd19ea576c`.

Lab029s is private; that provenance link requires repository access. The gallery's Model source links point to the public adaptations in this skill repository, not the private application.

All imported files are byte-for-byte copies from `services/frontend/src/assets/earth-movements/`. `models.js` adapts the sphere, axial tilt, night-side and atmosphere material setup from `services/frontend/src/components/simulations/g4-earth/EarthMovementsScene.tsx`. Camera, display lighting and materials are adjusted for isolated model viewing, not a full lesson or physically calibrated simulation.

The two GLBs omit normals; the viewer derives creased normals. The globe sphere has inward triangle winding, so its material displays back faces; its glTF texture origin is retained. No source GLB is rewritten.

| Gallery file | Lab029s source | Credit / terms |
| --- | --- | --- |
| `assets/earth_day_nasa.webp` | `textures/earth_day_nasa.webp` | NASA/Goddard Space Flight Center Scientific Visualization Studio. Blue Marble Next Generation data: Reto Stöckli, NASA/GSFC and NASA Earth Observatory. [Source](https://svs.gsfc.nasa.gov/2915/). |
| `assets/earth_night_nasa.webp` | `textures/earth_night_nasa.webp` | Data: Marc Imhoff, NASA/GSFC; Christopher Elvidge, NOAA/NGDC. Image: Craig Mayhew and Robert Simmon, NASA/GSFC. [Source](https://svs.gsfc.nasa.gov/2916/). |
| `assets/moon-solar-system-scope.webp` | `textures/moon-solar-system-scope.webp` | Moon texture © [Solar System Scope](https://www.solarsystemscope.com/textures/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Lab029s resized to 512 × 256 WebP from Sanghel/solar-system-3d revision `c826ebef5762074e5c8ba696254bedb0d3694757`. |
| `assets/classroom_globe.glb` | `models/classroom_globe.glb` | Generated specifically for Lab029s, imported at the project owner's request. GLB generator: trimesh, not Blender. The original approximate map is replaced at display time with the NASA map above. |
| `assets/flashlight.glb` | `models/flashlight.glb` | Generated specifically for Lab029s, imported at the project owner's request. GLB generator: trimesh, not Blender. Original geometry retained; display materials adjusted. |

NASA imagery is used for educational/informational display under [NASA media guidance](https://www.nasa.gov/nasa-brand-center/images-and-media/). No endorsement is implied. These media notices are separate from the repository's GPL-3.0-only code license. Three.js is MIT licensed; its notice is included in the built site.

Human-anatomy assets are **not** included: their recorded permission covers the Lab029s demo, not public redistribution in this repository. Assets with unclear origins are also excluded.

## Screenshots

`assets/showcase/lab029s/{earth,moon,globe,flashlight}.jpg` in the repository (published as `images/`) are actual canvas captures of these same models, with no lesson UI, reference illustration, or generated mock screenshot. Third-party texture credits above also apply to the renders.

Reproduce: `npm run setup`, `npm run gallery:build`, then serve `dist/gallery` on localhost. Open `?capture=1#earth` (or `moon`, `globe`, `flashlight`) at 1440 × 1000, wait for `#viewer[data-state="ready"]`, and capture `#canvas` without changing the default camera or pressing Play. Normal gallery: select model, orbit/zoom, Play, Reset view; keyboard arrows, +/− and R are supported.
