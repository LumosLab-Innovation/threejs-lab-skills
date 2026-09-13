---
name: threejs-studio
description: Create image options from a prompt, open a localhost review studio, then build the user-approved option as editable Three.js source or a Blender MCP asset. Use for prompt-to-3D, image-to-model, comparing visual options, or resuming an image/model approval workflow across coding agents.
---

# Three.js Studio

One workflow, two outputs: **Three.js source** or **Blender asset**. The coding agent generates;
the local studio displays options and records the user's decisions. It does not spawn an AI,
include model credits, or turn an image into exact hidden geometry by itself.

## Start or resume

Resolve `scripts/cli.mjs` relative to this SKILL.md; do not assume a checkout or home path.
Run commands from the user's project, with the same `--dir` throughout.
In a Git project, ensure that session directory is ignored without replacing existing ignore rules.

```sh
node <skill>/scripts/cli.mjs doctor
node <skill>/scripts/cli.mjs init --dir .threejs-studio --prompt "<user brief>" --engine threejs
node <skill>/scripts/cli.mjs serve --dir .threejs-studio --background
node <skill>/scripts/cli.mjs status --dir .threejs-studio
```

If `studio.json` already exists, skip `init` and read `status`. The installer supplies runtime
dependencies; for a raw plugin checkout, run `npm ci --omit=dev` in this skill folder if missing.
`serve` opens the browser automatically; reuse the reported URL, including its assigned port.
Open the URL through the host browser tool too when that helps the user see the studio.
If browser auto-open is unavailable, return the live URL. Never claim it opened unless it did.

## Follow `nextAction`

1. **generate_images**: read [image-options.md](references/image-options.md). Use the host's image
   tool to make 2–3 genuinely different options unless the user chose a count. Save separate
   PNG/JPEG/WebP files. Existing user images may be registered directly.
   `add-image --file <path> --title "Option A" --provenance "<provider/model or user file>"`.
2. **wait_for_user_image_approval**: keep the studio open and call `status --wait 55`. Continue
   other independent task work while waiting; if the user is away, hand back the live URL and
   resume on their next message. Do not click approval on their behalf, synthesize an approval,
   edit the journal to bypass it, or begin the model before this gate. A QA fixture is separate
   and must never be presented as a user-approved design.
3. **build_model**: read the chosen image from `imageApproval` and the latest feedback.
   Read [reconstruction.md](references/reconstruction.md), then only the selected engine:
   [threejs.md](references/threejs.md) or [blender.md](references/blender.md). Register each version
   with `add-model --file <model.ts|model.glb> --title "Option A" --reference <imageApproval.sha256>`.
   For Blender, include `--blend <asset.blend>` when exported. Do not silently switch engines.
4. **wait_for_user_model_approval**: inspect the live model, front/side/back views, keyboard,
   resize and console errors; compare silhouette, structure and materials against the reference.
   Use feedback to correct the current source, then add a new snapshot. The requester approves
   the model in the browser; agent QA scores do not constitute that approval.
5. **deliver**: report the approved candidate's source/asset paths and reference hash, any
   accepted approximations, and the studio URL. Integrate into the target project only if asked.

`--dir` is accepted by every command. Call `status` after a user decision or context reset.
Image/model IDs and hashes bind the selected design to the emitted artifact. New reference or
revision rounds invalidate previous approval; old files stay available as history.

## Scope and quality

- Start with the user's purpose, silhouette, scale, key details and intended camera. Use only
  relevant siblings from `../threejs-skill-router/SKILL.md` for advanced graphics.
- The existing lab/science/physics skills apply when the task is educational; ordinary asset
  work does not need curriculum text, artificial metrics or a mandatory subagent swarm.
- Never replace generated images with CSS/SVG mock art while calling them image-tool results.
  If the host lacks image generation, use the explicit OpenAI fallback in image-options.md or
  register the user's file. A missing provider is a real capability gap.
- Blender MCP is optional for Three.js. If Blender is unavailable, keep the approved image
  and explain the exact setup step; do not emit a dummy GLB or call a different paid service.
- Do not copy credentials into HTML, prompts, model source, `studio.json` or Git. Model preview
  scripts are isolated from review controls, but only run code belonging to the task.
- Keep UI copy to labels, controls and necessary status. All model options must be real files
  that can be opened; no fake progress, fake approval, or claimed physical accuracy from one image.
