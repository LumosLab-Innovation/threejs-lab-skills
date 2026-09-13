# Connect Blender once

Prerequisites: Blender and [uv](https://docs.astral.sh/uv/getting-started/installation/).
Use the existing MCP server if configured. Do not duplicate it or replace unrelated MCP config.

```sh
uvx blender-mcp install-addon
```

Open Blender → Edit → Preferences → Add-ons, enable the installed Blender MCP addon.
In the 3D viewport press **N**, open its MCP tab and select **Start MCP Server**.
Keep this connection on localhost. Then register it in the coding host if not already present:

```sh
# Codex
codex mcp add blender -- uvx blender-mcp
# Claude Code
claude mcp add blender -- uvx blender-mcp
```

For other hosts, add a stdio MCP entry with command `uvx` and arguments `["blender-mcp"]`
using that host's supported configuration. Use the full `uvx` path if the host cannot find it.
Restart the host session, discover scene-info/code-execution tools, and check the addon version.
Keep the addon and server versions matched; installing the Python package alone does not
activate Blender's addon. Review the addon’s telemetry/data settings during setup.

Source: [Blender MCP setup](https://github.com/ahujasid/blender-mcp#quickstart).
