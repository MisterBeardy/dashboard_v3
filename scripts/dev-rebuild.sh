#!/usr/bin/env bash
set -euo pipefail

# Config
PORT="${PORT:-3000}"
PKILL_PATTERN="${PKILL_PATTERN:-pnpm dev}"

echo "[dev-rebuild] Checking if port :${PORT} is in use..."
if lsof -i tcp:"${PORT}" -sTCP:LISTEN > /dev/null 2>&1; then
  echo "[dev-rebuild] Port ${PORT} is in use. Killing process on port ${PORT}..."
  # Try to kill by port first (macOS/lsof)
  PIDS=$(lsof -ti tcp:"${PORT}" -sTCP:LISTEN || true)
  if [[ -n "${PIDS}" ]]; then
    echo "${PIDS}" | xargs -I {} bash -c 'echo "[dev-rebuild] Killing PID {}"; kill -9 {}'
  fi
else
  echo "[dev-rebuild] Port ${PORT} is free."
fi

echo "[dev-rebuild] Killing any running dev processes matching pattern: ${PKILL_PATTERN}"
# Kill any stray dev processes as a fallback
pkill -f "${PKILL_PATTERN}" 2>/dev/null || true

echo "[dev-rebuild] Installing deps (pnpm i)..."
pnpm install

echo "[dev-rebuild] Building (pnpm build)..."
pnpm build

echo "[dev-rebuild] Starting dev server on port ${PORT} (pnpm dev)..."
# Use exec to replace the shell with the dev process (so terminal shows live logs)
exec pnpm dev