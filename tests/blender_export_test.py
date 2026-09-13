"""Exporter contract check with fake bpy; does not certify a live Blender connection."""
import runpy
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch


class ExportContract(unittest.TestCase):
    def test_scoped_export_preserves_selection_and_refuses_overwrite(self):
        export = runpy.run_path(str(Path(__file__).resolve().parents[1] /
            "plugins/threejs-lab/skills/threejs-studio/scripts/blender_export.py"))["export_collection"]
        mesh, unrelated = Mock(type="MESH"), Mock(type="MESH")
        collection = Mock(all_objects=[mesh])
        bpy = Mock()
        bpy.data.collections.get.return_value = collection
        bpy.context.mode = "OBJECT"
        bpy.context.selected_objects = [unrelated]
        bpy.context.view_layer.objects.active = unrelated

        def gltf(**kwargs):
            self.assertTrue(kwargs["use_selection"])
            self.assertEqual(kwargs["export_format"], "GLB")
            Path(kwargs["filepath"]).write_bytes(b"QA mock GLB, not a real asset")
            return {"FINISHED"}

        def library(path, collections, **kwargs):
            self.assertEqual(collections, {collection})
            self.assertFalse(kwargs["compress"])
            Path(path).write_bytes(b"QA mock library, not a real asset")

        bpy.ops.export_scene.gltf.side_effect = gltf
        bpy.data.libraries.write.side_effect = library
        with tempfile.TemporaryDirectory(prefix="threejs-blender-test-") as folder, patch.dict(sys.modules, {"bpy": bpy}):
            result = export("asset", folder)
            self.assertEqual(Path(result["glb"]).parent, Path(folder).resolve())
            self.assertIs(bpy.context.view_layer.objects.active, unrelated)
            mesh.select_set.assert_called_with(True)
            unrelated.select_set.assert_called_with(True)
            bpy.ops.wm.save_as_mainfile.assert_not_called()
            with self.assertRaises(FileExistsError):
                export("asset", folder)
            bpy.ops.export_scene.gltf.side_effect = RuntimeError("QA export failure")
            with self.assertRaisesRegex(RuntimeError, "QA export failure"):
                export("asset", folder, "failed-revision")
            self.assertIs(bpy.context.view_layer.objects.active, unrelated)
            unrelated.select_set.assert_called_with(True)
            with self.assertRaises(ValueError):
                export("asset", folder, "../escape")


if __name__ == "__main__":
    unittest.main()
