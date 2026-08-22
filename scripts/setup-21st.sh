#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required before installing the 21st CLI." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required before installing the 21st CLI." >&2
  exit 1
fi

printf '%s\n' "Installing @21st-dev/cli globally..."
npm install -g @21st-dev/cli@latest

printf '%s\n' ""
printf '%s\n' "21st CLI installed."
printf '%s\n' "Interactive setup:"
printf '%s\n' "  21st login"
printf '%s\n' ""
printf '%s\n' "Non-interactive / CI setup:"
printf '%s\n' "  export API_KEY_21ST='your-key'"
printf '%s\n' ""
printf '%s\n' "Useful AQUADUCT discovery commands:"
printf '%s\n' "  21st search '3D shader cyberpunk hero WebGL'"
printf '%s\n' "  21st search 'CRT scanline terminal hero'"
printf '%s\n' "  21st search 'spatial dashboard holographic HUD'"
printf '%s\n' "  21st search 'dock command palette cyberpunk'"
printf '%s\n' "  21st search 'react three fiber shader background'"
printf '%s\n' ""
printf '%s\n' "Install agent skills once if your coding agent supports them:"
printf '%s\n' "  npx @21st-dev/cli install-skill"
printf '%s\n' ""
printf '%s\n' "Unified MCP endpoint: https://21st.dev/api/mcp"
