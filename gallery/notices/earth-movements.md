# Asset sources, licenses, and attribution

## NASA Blue Marble day texture

Source page:

```text
https://svs.gsfc.nasa.gov/2915/
```

Direct 2048×1024 asset:

```text
https://svs.gsfc.nasa.gov/vis/a000000/a002900/a002915/bluemarble-2048.png
```

Required credit:

```text
NASA/Goddard Space Flight Center Scientific Visualization Studio.
Blue Marble Next Generation data courtesy of Reto Stöckli, NASA/GSFC, and NASA Earth Observatory.
```

## NASA Earth at Night texture

Source page:

```text
https://svs.gsfc.nasa.gov/2916/
```

Direct 2048×1024 asset:

```text
https://svs.gsfc.nasa.gov/vis/a000000/a002900/a002916/earthatnight-2048.png
```

Required credit:

```text
Data courtesy Marc Imhoff, NASA/GSFC, and Christopher Elvidge, NOAA/NGDC.
Image by Craig Mayhew and Robert Simmon, NASA/GSFC.
```

## NASA usage guidance

```text
https://www.nasa.gov/nasa-brand-center/images-and-media/
```

NASA states that its images, audio, video, texture maps, and polygon data are generally available for educational and informational uses, subject to attribution, third-party markings, and no implied endorsement. Do not place NASA logos or identifiers into the lesson unless separately approved. Do not claim that NASA endorses Lab029s.

## Solar System Scope Moon texture

The compact Moon map is derived from `public/textures/satellites/moon.jpg` in Sanghel's MIT-licensed reference project at commit `c826ebef5762074e5c8ba696254bedb0d3694757`:

```text
https://github.com/Sanghel/solar-system-3d
https://www.solarsystemscope.com/textures/
```

The source project records the texture as Solar System Scope content licensed under CC BY 4.0. Lab029s downscales it to a 512x256 WebP and uses only a standard color map on the secondary Moon mesh.

Required credit:

```text
Moon texture © Solar System Scope, used under CC BY 4.0.
```

## Generated project models and fallback

The following files were generated specifically for this Lab029s lesson and may be modified by the project:

```text
models/classroom_globe.glb
models/flashlight.glb
models/observer_pin.glb
textures/earth_placeholder.png
```

They are development assets. `earth_placeholder.png` is deliberately stylized and geographically approximate, so it must not be described as an authoritative Earth map.

## GPT Image project assets

The following images were generated specifically for this Lab029s lesson from original prompts and optimized as WebP files for runtime use:

```text
onboarding/rotate.webp
onboarding/compare.webp
onboarding/complete.webp
observer/mountain-horizon.webp
observer/sun.webp
observer/moon.webp
assignment/earth-movement-diagram.webp
../screenshots/g4-earth/g4-earth-video-poster.jpg
```

They are visual-support assets, not scientific datasets. The cloud texture is used only as an illustrative alpha layer; cloud positions must not be interpreted as current weather data. The observer sprites and mountain strip provide visual identity and occlusion only; the lesson's deterministic time model owns every position and visibility state. The onboarding images teach interaction and do not replace model evidence.

## Optional streamed video

The Engage stage can stream the Google Drive video referenced by the supplied lesson deck:

```text
https://drive.google.com/file/d/12fZvdlMN-8nr5gmi9xmy5sZ3jqCs_v9M/preview
```

The video is not bundled, is optional for progression, and has a local poster/error-independent fallback. The curriculum owner must confirm sharing permission and long-term availability before a public release.

## Third-party asset rule

Do not download random Sketchfab, TurboSquid, Free3D, or marketplace models during the 48-hour build unless the exact license, author, source URL, modification permission, and commercial-use status are recorded in `ASSET_MANIFEST.json`. A model being downloadable does not make it reusable.

## Camera transition mechanism

The imperative camera handoff in this lesson is adapted at mechanism level from:

```text
https://github.com/Sanghel/solar-system-3d
```

The source project is MIT licensed. Lab029s ports only the easing, camera/look-at interpolation, control handoff, reset-bookmark behavior, and the documented Moon texture above. No React Three Fiber components or other scene assets are bundled.
