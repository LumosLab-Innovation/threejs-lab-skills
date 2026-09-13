# Blender MCP asset engine

Use an existing connected Blender MCP server. Discover actual capabilities, then call scene
info before editing. An MCP server process being present does not prove Blender is connected.
If absent, use [setup](blender-setup.md); keep the approved image and pause this engine only.

1. Inspect the current scene and preserve unrelated work. Create a uniquely named collection
   for this asset and use that name in every code/export step. Never clear the user's scene.
2. Read the approved image. Translate its silhouette/parts into an explicit modeling recipe
   and save the Python source in the project. Execute it in bounded steps using the discovered
   Blender code tool. Persist corrections to that Python source, not only to ephemeral MCP calls.
3. Author reference-driven geometry with Blender Python: intentional bevels, materials, normals
   and UVs. Do not use image-to-mesh providers (Hunyuan, Rodin, Meshy, etc.). Name moving parts,
   joint pivots, bones and shape keys semantically. Build shape keys for localized contraction,
   rigs for articulated bodies, or separate rigid parts according to the requested mechanism.
4. Inspect Blender renders/viewport images, side/back geometry, scale, attachments and materials.
   Bake procedural shading to standard PBR before portable export. A static mesh is not rigged.
5. Export the named collection with `scripts/blender_export.py` through Blender's Python tool:

```python
import runpy
helper = runpy.run_path(r"<absolute skill path>/scripts/blender_export.py")
result = helper["export_collection"]("<asset collection>", r"<absolute project output>", "revision-1")
print(result)
```

The helper refuses to overwrite revisions, exports selected asset objects only, restores the
previous selection and writes an editable collection library `.blend`. Append that collection
into Blender when editing it; the user's currently open `.blend` file is not replaced.
Pack the asset's own image textures in Blender before writing that library; the helper does not
pack unrelated scene resources. Verify the saved library from a fresh Blender session, including textures.
The path must be readable on the Blender machine. For a remote MCP, transfer outputs through
the host's authorized artifact mechanism first; do not pretend local paths are remote paths.

```sh
node <skill>/scripts/cli.mjs add-model --file revision-1.glb --behavior behavior.ts --blend revision-1.blend --title "Revision 1" --reference <approved-hash>
```

Before registering, write `behavior.ts` exporting `createBehavior({THREE, root, animations,
canvas, camera})` using [the shared Three.js contract](motion-interaction.md). Connect the
exported bones, shape keys or named parts to actual movement, deformation and controls.
Only self-contained GLB v2 is accepted; external texture/buffer URLs are rejected. Review the
GLB **with its behavior** in the same studio before approval. Supply construction Python,
editable library, GLB, behavior source and known approximations. Asset-only submission is rejected.
