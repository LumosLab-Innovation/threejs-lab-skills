# Gallery sources and licenses

These **43 models** are existing Lab029s assets adapted for isolated viewing, not newly generated image-to-mesh or Blender results. No lesson UI, student data or assessment content is copied.

Source: [LumosLab-Innovation/Lab029s](https://github.com/LumosLab-Innovation/Lab029s/tree/ead290a22869266df4f60483b67af5fd19ea576c), revision `ead290a22869266df4f60483b67af5fd19ea576c`. The source repository requires access; public viewer links use the copies/adapters in this repository.

## Collection and provenance

| Collection | Models |
| --- | --- |
| Anatomy | Heart, Brain, Lungs, Kidneys, Liver, Intestine, Eyeball, Skin, Pancreas, Inner ear (10) |
| Wind & weather | Wind turbine, Wind generator, Tree in the wind, House, Clouds, Dark clouds, Storm clouds (7) |
| Magnets | Bar magnet, Magnetic sorter, Material sample kit, Beverage can, Iron nail, Wooden plank (6) |
| Space & robotics | Domowik robot, YT-1300 cockpit, Rocket ship, Space rover, Crashed rocket (5) |
| Equipment | Power supply, Lab table, Virtual studio, Classroom globe, Flashlight (5) |
| Solar system | Earth, Moon, Sun, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune (10) |

[The catalog](catalog.json) records every source path, SHA-256, byte count and embedded credit. Imported GLBs and textures are byte-for-byte copies. Total model/texture payload: 29.61 MiB; only the selected model is loaded. Renders are separate lazy-loaded JPEG thumbnails.

Original source notices are retained unaltered:

- [Human anatomy](notices/human-anatomy.md)
- [Wind and weather](notices/wind-weather.md)
- [Earth movements](notices/earth-movements.md)
- [Solar system](notices/solar-system.md)

## Asset rights remain separate

This expanded showcase is published at the Lab029s project owner's explicit request. That request is **not** an independently verified grant of additional rights from third-party authors. The anatomy source notice records permission for the Lab029s non-commercial demo, not a general public asset license. The Inner Ear source was generated with Tripo; its applicable asset terms still govern. Other project-supplied assets without embedded licenses are not newly licensed by this gallery. Check the original terms/author before further reuse or redistribution.

The repository's GPL-3.0-only code license does not replace individual asset terms. No author endorsement is implied.

### Embedded CC BY 4.0 credits

The following original metadata is retained in both GLBs and the catalog. Their display scale, lighting and camera are adapted; meshes and animation data are unchanged. License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

| Model | Author | Original source |
| --- | --- | --- |
| `wind-turbine_2.glb` | Mylom (https://sketchfab.com/Mylom) | [wind-turbine 2](https://sketchfab.com/3d-models/wind-turbine-2-813c1f3b59654952929cbba1e6eab419) |
| `wind_generator.glb` | Krogager (https://sketchfab.com/Krogager) | [Wind Generator](https://sketchfab.com/3d-models/wind-generator-ad031f59d375457485afdcb449597523) |
| `cute_robot.glb` | Annelida (https://sketchfab.com/Annelida) | [Toy robot Domowik](https://sketchfab.com/3d-models/toy-robot-domowik-8f1f61ca0c844b978abfb43243513377) |
| `yt-1300_cockpit_version_2.glb` | MichaelEGA (https://sketchfab.com/MichaelEGA) | [YT-1300 Cockpit Version 2](https://sketchfab.com/3d-models/yt-1300-cockpit-version-2-244bc823ca954092bc6edd4b48760072) |

### Texture credits

- Earth day map: NASA/Goddard Space Flight Center Scientific Visualization Studio. Blue Marble Next Generation: Reto Stöckli, NASA/GSFC and NASA Earth Observatory. [Source](https://svs.gsfc.nasa.gov/2915/).
- Earth night map: data by Marc Imhoff, NASA/GSFC; Christopher Elvidge, NOAA/NGDC. Image by Craig Mayhew and Robert Simmon, NASA/GSFC. [Source](https://svs.gsfc.nasa.gov/2916/).
- Sun, Moon and other planets: © [Solar System Scope](https://www.solarsystemscope.com/textures/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Lab029s resized these to WebP via Sanghel/solar-system-3d; the original notices above record revisions and dimensions.
- NASA media is used for educational/informational display under [NASA media guidance](https://www.nasa.gov/nasa-brand-center/images-and-media/); no NASA endorsement.
- Classroom globe and flashlight were generated specifically for Lab029s with trimesh, not Blender. The globe's display map is replaced with the NASA day map.

## Viewer adaptations and limits

`models.js` adapts Earth sphere, axial tilt, night-side/atmosphere setup from `g4-earth/EarthMovementsScene.tsx`; Sun material and Saturn rings from `g3-sun-earth-moon/SunEarthMoonScene.tsx` at the pinned revision. Other planets use their original maps on spheres. These are display adaptations, not complete lesson simulations.

GLBs retain geometry, semantic names, materials and native animation clips. Geometry is centered/scaled for the viewer; missing normals are derived. The legacy globe has inward triangle winding, so its material displays back faces and retains glTF texture origin. Its and the flashlight's display materials are adjusted. Play runs a native animation if present, otherwise a turntable; it does not imply physiological contraction or scientific simulation. Power supply offers its six imported clips.

The largest source model is Domowik (~7.5 MiB); anatomy and the windy tree retain high-detail meshes. This preserves supplied fidelity rather than claiming every asset meets a small mobile asset budget. One model loads at a time and GPU resources are released on selection changes. Terrain/rocks, panorama/VR rooms, duplicate tree exports, lesson overlays and non-model media are outside this model-focused selection.

Three.js is MIT licensed; `THREE-LICENSE.txt` is included in the built site. The bundled local Draco decoder is covered by [its complete Apache-2.0 and third-party notices](notices/DRACO-LICENSE.txt). No runtime CDN or model-generation API is required.

## Reproduce the screenshots

Every `assets/showcase/lab029s/<model-id>.jpg` (published as `images/`) is a real canvas capture of the corresponding catalog model. No UI, mock screenshot or generated illustration is composited into it. Texture/model credits also apply to these renders.

Run `npm run setup`, `npm run gallery:build`, then serve `dist` on localhost. Open `/gallery/?capture=1#<model-id>` at 1440 × 1000, wait for `#viewer[data-state="ready"]` and capture `#canvas` paused with the default camera. The normal gallery supports category filters, orbit/zoom, Play, animation selection where available, Reset view and fullscreen; keyboard arrows, +/− and R are supported.
