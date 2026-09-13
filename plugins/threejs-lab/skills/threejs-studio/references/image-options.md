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

## Optional OpenAI fallback

If the host cannot generate images and the user has configured `OPENAI_API_KEY` and
`OPENAI_IMAGE_MODEL` in the process environment, the bundled helper calls the Images API:

```sh
node <skill>/scripts/cli.mjs generate-images --count 2
```

This invokes a billed external API; only use it within the user's approved provider/budget.
Do not silently use it when a host-native image tool is already available. The helper makes one
request, has a five-minute timeout, and does not automatically retry a potentially billed call.
It expects base64 image results and leaves successfully generated files in the session even if
registration is interrupted. There is no embedded default model; use an image model actually
available to the configured account. No key is needed for local image import or preview.

After a revision request, include the latest feedback in `--prompt`; do not repeat the original
prompt unchanged. Technical API errors are not permission to substitute mock pictures.

Provider contract: [OpenAI image generation](https://developers.openai.com/api/docs/guides/image-generation).
