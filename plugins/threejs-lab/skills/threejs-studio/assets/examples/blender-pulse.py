"""Run in Blender as an isolated motion-contract example, not an anatomical model.

Creates one new collection; does not clear the current scene or call an external service.
Pair its exported GLB with pulse-behavior.mjs in Three.js.
"""
import bpy
from math import cos, sin, pi


def build_example():
    collection = bpy.data.collections.new("Studio deformation example")
    bpy.context.scene.collection.children.link(collection)
    # A UV sphere built as a mesh datablock keeps the user's mode and selection untouched.
    rings, segments = 32, 48
    vertices = [(0, 0, 1.3)]
    for ring in range(1, rings):
        theta = pi * ring / rings
        for segment in range(segments):
            phi = 2 * pi * segment / segments
            vertices.append((sin(theta) * cos(phi), .85 * sin(theta) * sin(phi), 1.3 * cos(theta)))
    bottom = len(vertices)
    vertices.append((0, 0, -1.3))
    faces = []
    for segment in range(segments):
        following = (segment + 1) % segments
        faces.append((0, 1 + segment, 1 + following))
        for ring in range(rings - 2):
            a, b = 1 + ring * segments + segment, 1 + ring * segments + following
            faces.append((a, a + segments, b + segments, b))
        a = 1 + (rings - 2) * segments
        faces.append((a + segment, bottom, a + following))
    mesh = bpy.data.meshes.new("Tissue geometry")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    tissue = bpy.data.objects.new("tissue", mesh)
    collection.objects.link(tissue)
    tissue.shape_key_add(name="Basis")
    target = tissue.shape_key_add(name="contract")
    for vertex in target.data:
        weight = max(0, 1 - (vertex.co.z / 1.3) ** 2)
        vertex.co.x *= 1 - .22 * weight
        vertex.co.y *= 1 - .22 * weight
        vertex.co.z *= 1 + .12 * weight
    material = bpy.data.materials.new("Soft copper")
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (.57, .18, .13, 1)
    shader.inputs["Roughness"].default_value = .42
    tissue.data.materials.append(material)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    return collection.name


if __name__ == "__main__":
    print(build_example())
