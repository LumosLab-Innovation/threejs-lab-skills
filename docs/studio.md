# Image → approved 3D, locally

## Install and start

Use the [one-command installer](../README.md#one-command-install), then start a new CLI session and ask it to use `threejs-studio`. Describe the object, intended use and whether you want Three.js source or a Blender asset. The agent opens the studio; you select an image, inspect the resulting model, and approve or request changes.

```text
Your prompt → image options → YOUR IMAGE APPROVAL
                                    ├─ Three.js source → live WebGL + static GLB export
                                    └─ Blender MCP → self-contained GLB + editable .blend
                                                      ↓
                                 localhost comparison → YOUR MODEL APPROVAL → delivery
```

Changing the reference invalidates model approval. Every submitted revision is a snapshot; editing a working source cannot change an already-reviewed candidate. On resume, the agent reads `status`, including your feedback and the next required action.

## CLI compatibility

| Host | Installer flag | Project / global discovery | Generation requirements |
| --- | --- | --- | --- |
| Codex | `--agent codex` | `.agents/skills` / `~/.agents/skills` | Shell + host image tool or optional image API; Blender MCP for assets |
| Claude Code | `--agent claude` | `.claude/skills` / `~/.claude/skills` | Shell + image-capable tool or optional image API; Blender MCP for assets |
| OpenCode | `--agent opencode` | `.agents/skills` / `~/.agents/skills` | Same, subject to configured tools and permissions |
| Another Agent Skills host | `--skills-dir <path>` | Host-specific | Must read SKILL.md and run Node commands; MCP/image support is not universal |

Discovery paths follow the official [Codex](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills), [Claude Code](https://code.claude.com/docs/en/skills#where-skills-live) and [OpenCode](https://opencode.ai/docs/skills/#place-files) documentation. Installation compatibility does not guarantee that a host has image generation, a browser tool, or Blender configured.

Install all 35 skills by default; `--only threejs-studio` installs the review core alone (optional specialist siblings will be absent). `--dry-run` performs no writes. `--skip-runtime` copies instructions without running npm; later run `npm ci --omit=dev` inside the installed `threejs-studio` folder. Do not install duplicate copies in both a plugin and the same host's skills directory.

## Images: use the host first

The agent uses its native image-generation tool when available and registers the returned PNG/JPEG/WebP files with provenance. No provider key is needed by the studio for that path. You can also supply an existing image.

For a CLI without image generation, an optional OpenAI Images API helper is included. Set `OPENAI_API_KEY` and `OPENAI_IMAGE_MODEL` privately in the agent process environment; choose an image-generation model available to your account. The helper sends the brief to OpenAI and incurs that provider's API charges, separate from a coding-assistant subscription. It never auto-retries paid requests or falls back to another provider.

```sh
node <installed-threejs-studio>/scripts/cli.mjs generate-images --count 3
```

Run after `init` and `serve`, before approving a reference. Use `--dir` if your session is not `.threejs-studio`. For provider details see [OpenAI image generation](https://developers.openai.com/api/docs/guides/image-generation). No live paid image request is part of the automated test suite.

## Blender: connect once

Follow [Blender MCP setup](../plugins/threejs-lab/skills/threejs-studio/references/blender-setup.md). The coding host must be able to inspect a scene, execute Blender Python and capture a viewport/render. Installing skills does not install Blender or enable its addon.

The asset path uses an explicitly named collection. The bundled exporter writes a self-contained GLB and an editable `.blend` collection library without saving over your current scene. Existing output files are refused. Keep the construction Python with the project; the `.blend` contains the asset collection, not the whole unrelated working scene. If MCP runs on another machine, transfer its output through the host's supported file tools before registering it locally.

## Manual commands and exports

The agent normally runs these. Replace `<skill>` with the installed folder, not a hard-coded machine path.

```sh
node <skill>/scripts/cli.mjs doctor
node <skill>/scripts/cli.mjs init --prompt "Your brief" --engine threejs
node <skill>/scripts/cli.mjs serve --background
node <skill>/scripts/cli.mjs add-image --file option.png --title "Option A" --provenance "Provider/model or user file"
node <skill>/scripts/cli.mjs status --wait 55
# The person now approves an image in the browser. Read imageApproval.sha256 from status.
node <skill>/scripts/cli.mjs add-model --file model.ts --title "Option A" --reference <approved-sha256>
# Or, for a Blender session:
node <skill>/scripts/cli.mjs add-model --file model.glb --blend model.blend --title "Option A" --reference <approved-sha256>
node <skill>/scripts/cli.mjs stop
```

Use `--dir <project/session>` consistently to keep separate projects apart. `serve` reuses a running session and opens the default browser; `--no-open` suppresses opening. If the agent is remote/headless, forward the loopback port and open the reported URL through your development environment. Do not expose the studio to the public internet.

Three.js supports ESM JS/TS factories returning a `THREE.Group` or `{root, update, dispose}`. Local source modules and imported raster textures are bundled into the preview, with editable inputs retained in `sources.json` (base64 contents). The working source is also left in your project. Exported GLB contains the authored object, not the viewer lights or inspection controls. Static standard materials export directly; custom shaders, skins and scripted animation require authoring/baking/export from the original source. Blender-generated GLB is available unchanged via **Tải GLB**. See [the source contract](../plugins/threejs-lab/skills/threejs-studio/references/threejs.md).

## Boundaries and checks

- The local server binds `127.0.0.1`, rejects foreign-origin API requests and serves only registered artifacts. Models run in a sandboxed, opaque-origin iframe without access to review controls. Do not run untrusted generated code just because a preview is sandboxed: the CLI and Blender still have local code-execution authority.
- A live preview enables approval; it does not prove artistic quality. Only the requester approves a real task. Automated tests use clearly separate QA fixtures. This is a workflow guardrail, not protection against a malicious agent with full filesystem access.
- Session state and original snapshots live under your project, not in a cloud database. Add the session directory to your project's `.gitignore`; do not commit provider keys, session credentials, outputs or screenshots inadvertently.
- Images have a 25 MB input limit; self-contained GLB files have a 100 MB limit. External GLB buffers/textures are rejected; bake/embed them first. Draco/KTX decoder services and the full img2threejs/Vibe3D engines are not bundled.
- `npm test` checks gate sequencing, stale/repeated approvals, immutable snapshots, origin/file boundaries, GLB validation, optional image API behavior and safe installation. `npm run validate` checks packaged skill metadata and the pre-existing demo evidence files; it does not rerun those old graphics benchmarks.
- CI runs these checks on Windows and Linux. Before changing viewer behavior, also open a real browser: select an image, render Three.js and GLB, orbit/fixed views, export, request changes, reload, keyboard/mobile layout, console/network and failure paths. Actual Blender MCP generation must be checked with a running Blender addon; unit tests do not certify that connection.
