"""Run in Blender (including through execute_blender_code), not a normal Python process.

Export only the named collection to portable GLB and an editable asset .blend.
Existing files, unrelated objects, the open file and selection are preserved.
"""
from pathlib import Path
import re


def export_collection(collection_name, output_dir, basename="model"):
    import bpy

    if not re.fullmatch(r"[A-Za-z0-9_-]+", basename):
        raise ValueError("Use a simple output basename")
    collection = bpy.data.collections.get(collection_name)
    if collection is None or not any(obj.type == "MESH" for obj in collection.all_objects):
        raise ValueError("Named asset collection must contain a mesh")
    if bpy.context.mode != "OBJECT":
        raise ValueError("Switch Blender to Object Mode before export")
    out = Path(output_dir).expanduser().resolve()
    glb, blend = out / f"{basename}.glb", out / f"{basename}.blend"
    if glb.exists() or blend.exists():
        raise FileExistsError("Output exists; use a new revision basename")
    out.mkdir(parents=True, exist_ok=True)
    selected = list(bpy.context.selected_objects)
    active = bpy.context.view_layer.objects.active
    try:
        bpy.ops.object.select_all(action="DESELECT")
        objects = [obj for obj in collection.all_objects if obj.type in {"MESH", "EMPTY", "ARMATURE"}]
        for obj in objects:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = next(obj for obj in objects if obj.type == "MESH")
        result = bpy.ops.export_scene.gltf(
            filepath=str(glb), export_format="GLB", use_selection=True,
            export_yup=True, export_extras=True,
        )
        if "FINISHED" not in result or not glb.exists():
            raise RuntimeError("GLB export did not finish")
        # Write a library containing just the asset collection, not the user's open project.
        bpy.data.libraries.write(str(blend), {collection}, fake_user=True, compress=False)
    finally:
        bpy.ops.object.select_all(action="DESELECT")
        for obj in selected:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = active
    return {"glb": str(glb), "blend": str(blend), "collection": collection_name}
