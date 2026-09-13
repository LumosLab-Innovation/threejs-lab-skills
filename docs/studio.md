# Image → approved 3D, locally

## Install and start

Use the [one-command installer](../README.md#one-command-install), then start a new CLI session and ask it to use `threejs-studio`. Describe the object, intended use and whether you want Three.js source or a Blender asset. The agent opens the studio; you select an image, inspect the resulting model, and approve or request changes.

```text
Your prompt → host image tool or supplied image → YOUR IMAGE APPROVAL
                                                  ├─ Three.js geometry code
                                                  └─ Blender Python via MCP → GLB + .blend
                                                               ↓
                                      Three.js motion, deformation and interaction
                                                               ↓
                                      localhost review → YOUR MODEL APPROVAL → delivery
```

Changing the reference invalidates model approval. Every submitted revision is a snapshot; editing a working source cannot change an already-reviewed candidate. On resume, the agent reads `status`, including your feedback and the next required action.

## CLI compatibility

| Host | Installer flag | Project / global discovery | Generation requirements |
| --- | --- | --- | --- |
| Codex | `--agent codex` | `.agents/skills` / `~/.agents/skills` | Shell + existing image tool or supplied image; Blender MCP for assets |
| Claude Code | `--agent claude` | `.claude/skills` / `~/.claude/skills` | Same, subject to configured tools and permissions |
| OpenCode | `--agent opencode` | `.agents/skills` / `~/.agents/skills` | Same, subject to configured tools and permissions |
| Grok Build | `--agent grok` | `.agents/skills` / `~/.agents/skills` | Same; also accepts `--agent grok-build` |
| OMP (Oh My Pi) | `--agent omp` | `.agents/skills` / `~/.agents/skills` | Same; native agents discovery, not Oh My Posh |
| Another Agent Skills host | `--skills-dir <path>` | Host-specific | Must read SKILL.md and run Node commands; MCP/image support is not universal |

Discovery paths follow the official [Codex](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills), [Claude Code](https://code.claude.com/docs/en/skills#where-skills-live), [OpenCode](https://opencode.ai/docs/skills/#place-files), [Grok Build](https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-pager/docs/user-guide/08-skills.md) and [OMP](https://github.com/can1357/oh-my-pi/blob/main/docs/skills.md) documentation. `--agent all` installs into the shared `.agents/skills` and Claude's `.claude/skills` roots in one command. It does not modify CLI settings, enable disabled skills, remove higher-priority copies, or configure MCP. Installation compatibility does not guarantee that a host has image generation or Blender configured.

Install all 35 skills by default; `--only threejs-studio` installs the review core alone (optional specialist siblings will be absent). `--dry-run` performs no writes. Updates remove only unchanged, previously installer-managed files retired by this package; edited files stop the update for reconciliation. `--skip-runtime` copies instructions without running npm; later run `npm ci --omit=dev` inside the installed `threejs-studio` folder. Do not install duplicate copies in both a plugin and the same host's skills directory.

## Images: use the host first

The agent uses its native image-generation tool when available and registers the returned PNG/JPEG/WebP files with provenance. No provider key is needed by the studio for that path. You can also supply an existing image.

If the host cannot generate images, supply a reference or configure its existing image tool.
The package has no paid image-generation or image-to-3D API fallback. Host subscriptions and
image-tool charges/limits are separate; “local studio” does not mean every coding CLI is free.

## Blender: connect once

Follow [Blender MCP setup](../plugins/threejs-lab/skills/threejs-studio/references/blender-setup.md). The coding host must be able to inspect a scene, execute Blender Python and capture a viewport/render. Installing skills does not install Blender or enable its addon.

The agent authors geometry, named parts, rigs or shape keys in Blender Python, using the image as reference; it does not call an image-to-mesh service. The asset path uses an explicitly named collection. The bundled exporter writes a self-contained GLB and an editable `.blend` collection library without saving over your current scene. Existing output files are refused. Keep construction Python with the project; the `.blend` contains the asset collection, not unrelated scene contents. Then write a Three.js behavior module for the exported parts, deformation and controls. If MCP runs remotely, transfer its output through the host's supported file tools before registering it locally.

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
node <skill>/scripts/cli.mjs add-model --file model.glb --behavior behavior.ts --blend model.blend --title "Option A" --reference <approved-sha256>
node <skill>/scripts/cli.mjs stop
```

Use `--dir <project/session>` consistently to keep separate projects apart. `serve` reuses a running session and opens the default browser; `--no-open` suppresses opening. If the agent is remote/headless, forward the loopback port and open the reported URL through your development environment. Do not expose the studio to the public internet.

Both engines use [one Three.js controller contract](../plugins/threejs-lab/skills/threejs-studio/references/motion-interaction.md): timed motion, pause/reset, native parameter sliders and raycast interaction. Blender's `--behavior` module is required and snapshotted with its GLB. Three.js supports ESM JS/TS factories returning a group or `{root, ...controller}`. Local source modules and raster imports are bundled, with editable inputs in `sources.json` (base64 contents); working sources remain in the project.

**A GLB alone is not the interactive deliverable.** Download the model and its behavior/source. The viewer can export a static geometry/morph snapshot with standard materials; it cannot put JavaScript interactions into GLB. Custom shaders and skins need the original authoring exporter. Blender-generated GLB is available unchanged via **Tải GLB**. See [the source contract](../plugins/threejs-lab/skills/threejs-studio/references/threejs.md) and its runnable contraction examples.

## Boundaries and checks

- The local server binds `127.0.0.1`, rejects foreign-origin API requests and serves only registered artifacts. Models run in a sandboxed, opaque-origin iframe without access to review controls. Do not run untrusted generated code just because a preview is sandboxed: the CLI and Blender still have local code-execution authority.
- A live preview enables approval; it does not prove artistic quality. Only the requester approves a real task. Automated tests use clearly separate QA fixtures. This is a workflow guardrail, not protection against a malicious agent with full filesystem access.
- Session state and original snapshots live under your project, not in a cloud database. Add the session directory to your project's `.gitignore`; do not commit provider keys, session credentials, outputs or screenshots inadvertently.
- Images have a 25 MB input limit; self-contained GLB files have a 100 MB limit. External GLB buffers/textures are rejected; bake/embed them first. Draco/KTX decoder services and the full img2threejs/Vibe3D engines are not bundled.
- `npm test` checks gate sequencing, stale/repeated approvals, immutable model/behavior snapshots, origin/file boundaries, GLB validation, shared motion/reset behavior and safe installation. `npm run validate` checks packaged skill metadata and the pre-existing demo evidence files; it does not rerun those old graphics benchmarks.
- CI runs these checks on Windows and Linux. Before changing viewer behavior, also open a real browser: select an image, render Three.js and GLB, orbit/fixed views, export, request changes, reload, keyboard/mobile layout, console/network and failure paths. Actual Blender MCP generation must be checked with a running Blender addon; unit tests do not certify that connection.
