# Image options

Use the host's existing image tool first. Check its real input/output contract; tool names and
capabilities differ between Codex, Claude and other CLI hosts. Store each returned file as an
option with a short distinct title and the actual provider/model in `--provenance`.

Default direction: one isolated subject, neutral background, readable 3/4 view, full silhouette,
no text or UI chrome. Vary form/material direction rather than tiny camera differences. Respect
the user’s count and style. For anatomy or exact product likeness, provide additional views
only when they establish necessary shape evidence; unseen sides remain inferred.

After generation, visually inspect each image before registering it. Do not approve it.

```sh
node <skill>/scripts/cli.mjs add-image --file concept-a.png --title "Matte ceramic" --provenance "<actual image tool>"
node <skill>/scripts/cli.mjs add-image --file concept-b.png --title "Brushed aluminium" --provenance "<actual image tool>"
```

If the host cannot generate images, request a reference file or help configure its existing
image tool. There is no separate image API helper or paid fallback in this package. Host tools
may still have subscription limits or usage charges; do not promise every CLI generates images
for free. Local import and review require no provider key.

After a revision request, incorporate the latest feedback into the host image-tool prompt.
Tool failures are not permission to substitute mock pictures or skip the approval gate.
