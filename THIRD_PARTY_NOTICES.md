# Sources and licensing

The repository's existing [GPL-3.0 license](LICENSE) is retained. New studio/installer code is GPL-3.0-only. This release corrects the old plugin manifest's conflicting MIT label; it does not relicense third-party source. Individual MIT/Apache notices remain applicable to their components. This file is an inventory, not legal advice about generated assets or a consumer's distribution obligations.

| Source | Reviewed revision | Used here | License |
| --- | --- | --- | --- |
| [LumosLab Three.js Lab](https://github.com/LumosLab-Innovation/threejs-lab-skills) | `bddd3ad` | Existing 11 learning-lab skills, hooks, checks and examples retained | Repository GPL-3.0 |
| [Scott Sun's Awesome Graphics skills](https://github.com/scottstts/Threejs-Awesome-Graphics-Agent-Skills) | `31bf12e7b76b76a2650735e02d554a04fb2d2f8b` | 23 skill entrypoints, reference Markdown and Codex metadata from the installed checkout | MIT, Copyright 2026 Scott Sun |
| [img2threejs](https://github.com/img2threejs/img2threejs) | `6e60b5e22419464b4853e01ddb6c0e6f6659a733` | Adapted staged analysis, detail inventory and visual correction instructions in studio references | Apache-2.0, Copyright 2026 hoainho |
| [Vibe3D](https://github.com/vibe-stack/vibe3d) | `d8f86a02469eb862220c2fa4b2bb1fe4d03b41a3` | Adapted hard-surface rules, source/preview iteration and export-boundary guidance | MIT, Copyright 2026 Vibe3D contributors |
| [Blender MCP](https://github.com/ahujasid/blender-mcp) | External optional integration, not vendored | Documented connection and existing tool contract; new collection exporter authored here | Upstream code not redistributed |

## Included adaptations

Awesome Graphics content lives in `plugins/threejs-lab/skills/threejs-*`: atmosphere, bloom, camera, exposure, image pipeline, precipitation, procedural animation/architecture/fields/geometry/materials/planets/vegetation/VFX, raymarched space, SSAO, router, ocean, temporal surfaces, visual validation, clouds, and water optics. Every imported package retains its own MIT `LICENSE`. Each entrypoint marks the adaptation. Heavy example assets were not copied; example links point to the pinned upstream revision instead. Instruction/reference Markdown and `agents/openai.yaml` are bundled.

The studio's `references/reconstruction.md` and `references/hard-surface.md` identify their adaptations. Complete upstream licenses are included at:

- [img2threejs Apache-2.0](plugins/threejs-lab/skills/threejs-studio/references/licenses/img2threejs.txt)
- [Vibe3D MIT](plugins/threejs-lab/skills/threejs-studio/references/licenses/vibe3d.txt)

No img2threejs Forge runtime, Vibe3D asset registry, shader wear-baking exporter, upstream generated model collection or paid image service is bundled. The installed legacy Object Sculptor workflow informed source selection; its old reconstruction pipeline was not copied alongside the newer unified path. Locally installed skills outside 3D/graphics are not imported.

## Runtime dependencies

The studio installs pinned `three` and `esbuild` from npm under their MIT licenses. Their package licenses remain in `node_modules`; the lockfile records exact dependency integrity. Image generation providers and Blender MCP are optional external tools, not redistributed model weights or included credits. The installer includes the repository license in copied skills that do not already have a component-specific license.

Generated images/assets must be evaluated under the chosen provider's terms and the licenses of user-supplied references; this project does not grant rights to third-party input artwork.

## Public model gallery

The [GitHub Pages gallery](https://lumoslab-innovation.github.io/threejs-lab-skills/) and README renders reuse 43 Lab029s models from anatomy, wind/weather, magnetism, space/robotics, equipment and the solar system, at the project owner's request. [Gallery attribution](gallery/ATTRIBUTION.md) and its catalog record source revision, per-file hashes, display adaptations and original notices. Asset terms remain separate from the code license: the owner's request does not independently establish broader third-party rights, including anatomy's recorded demo-only permission. The local Draco decoder's full notices are bundled with the gallery. Model geometry and screenshot assets are not part of the installed skill package.
