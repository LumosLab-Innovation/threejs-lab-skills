# QA Checklist

## Static

- No placeholder markers in plugin/skill/lab code.
- Renderer has pixel ratio cap.
- Scene has resize path.
- Imperative scene has animation/render loop.
- Event listeners are removed in teardown.
- `OrbitControls`, renderers, materials, geometries, textures, CSS2D renderers are disposed.
- GLTF loads have error handling.

## Browser

- Console has no import, shader, WebGL, or asset errors.
- Canvas dimensions are nonzero.
- Canvas is nonblank and object is framed.
- Visual output has depth, material contrast, focal hierarchy, and a visible primary phenomenon.
- Desktop and mobile viewports do not overlap controls and labels.
- Control changes update both scene and numeric output.
- Reset restores scene and state.
- Loading progress reaches done; errors show fallback.

## Assets

- `.glb/.gltf/.bin/textures` are committed or served.
- Public paths work after production build.
- No absolute local filesystem paths.
- Model scale is sane and contact points are visible.

## Performance

- Check `renderer.info` when scene is heavy.
- Reuse material/geometry for repeated objects.
- Use `InstancedMesh` for many repeated objects.
- Remove unused postprocessing.
- Avoid expensive shadows on tiny props.

## Release Note

Report:

- commands run
- URL/viewport inspected
- changed scene files checked by script
- visual limitations or skipped browser checks
