#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK_FILE="$ROOT_DIR/.cache/workspace-dependencies.lock"

mkdir -p "$ROOT_DIR/.cache"

# Multiple artifact services can start together after a GitHub import. Only one
# of them should restore the shared pnpm store and node_modules at a time.
# flock releases automatically even if a process is interrupted, so a failed
# import cannot leave a stale directory lock that blocks future starts.
exec 9>"$LOCK_FILE"
flock 9

cd "$ROOT_DIR"

if [[ ! -x "$ROOT_DIR/artifacts/birla-school/node_modules/.bin/vite" ||
      ! -x "$ROOT_DIR/artifacts/api-server/node_modules/.bin/esbuild" ||
      ! -x "$ROOT_DIR/artifacts/mockup-sandbox/node_modules/.bin/vite" ]]; then
  echo "Workspace dependencies are missing; restoring them from pnpm-lock.yaml..."
  pnpm install --frozen-lockfile
fi