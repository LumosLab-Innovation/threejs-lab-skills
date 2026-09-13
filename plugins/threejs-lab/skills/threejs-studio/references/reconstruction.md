# Approved image → reconstruction

This is a small adaptation of the staged image analysis/review approach in img2threejs
(Apache-2.0; see `licenses/img2threejs.txt`) and the source/preview loop in Vibe3D
(MIT; see `licenses/vibe3d.txt`). It does not vendor or claim to execute img2threejs's Forge engine.

Write a compact `model-spec.json` beside the working source. Record:

- approved image ID/hash, units, front/up axes, target use and view;
- silhouette ratios, major components and negative spaces;
- a detail inventory: each distinctive seam, bevel, fastener, contour or marking mapped to
  a named geometry part or a material region;
- material identity, scale and palette; joints/pivots only where interaction requires them;
- uncertain hidden parts and the intended approximation;
- render budget appropriate to the target device, plus acceptance evidence.

Choose geometry from the shape. A continuous organic surface is not a pile of boxes. Use
code-native parametric/extruded geometry when it can carry the silhouette; choose Blender when
topology editing, sculpting, UV work or mesh cleanup is needed. Exact likeness may require more
views or an authored asset. A single image is not a complete physical specification.

Build in short visual passes: silhouette → structure → form/attachments → materials → motion
if requested → optimization. Render early from the same camera. Also inspect side/back views:
a good front screenshot can conceal floating parts, reversed winding or flattened geometry.

For each pass, name the largest mismatches and their causes (reference ambiguity, incorrect
spec, geometry, material or camera). Fix at most three meaningful issues, capture again and
retain the source. Record evidence filenames and uncertainties, not invented fidelity scores.
Use a bounded correction budget agreed for the task; default three autonomous fixes before
presenting the remaining representation/reference choice. Do not confuse this technical review
with the separate user approval of image and final model in the studio.

Avoid inferring true albedo, roughness or depth from shading in one photograph. Match materials
under neutral lighting and check close-up detail as well as the full silhouette. Postprocessing
cannot repair wrong proportions. Preserve semantic components and units in both output engines.
