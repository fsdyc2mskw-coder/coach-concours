#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="trail-coach-$(node -p "require('$ROOT/package.json').version")"
DEST="${1:-$ROOT/../$NAME.zip}"

cd "$ROOT/.."
rm -f "$DEST"
zip -qr "$DEST" "$(basename "$ROOT")" \
  -x '*/node_modules/*' '*/dist/*' '*/coverage/*' '*/.git/*' '*/.env' '*/.env.local' '*/ios/*' '*/android/*'

echo "$DEST"
