#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
hook_path="$repo_root/.git/hooks/pre-push"

mkdir -p "$(dirname "$hook_path")"
cat > "$hook_path" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail
repo_root="$(git rev-parse --show-toplevel)"
validate_path="$repo_root/scripts/validate.mjs"

if command -v node >/dev/null 2>&1; then
  node "$validate_path"
elif command -v node.exe >/dev/null 2>&1; then
  if command -v wslpath >/dev/null 2>&1; then
    validate_path="$(wslpath -w "$validate_path")"
  fi
  node.exe "$validate_path"
else
  echo "node not found; install Node.js or add it to PATH" >&2
  exit 1
fi
HOOK
chmod +x "$hook_path"
echo "Installed pre-push hook: $hook_path"
