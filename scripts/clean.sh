#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "== CLEAN MODE =="

rm -rf node_modules
rm -f pnpm-lock.yaml

if command -v pnpm >/dev/null 2>&1; then
  PNPM_STORE="$(pnpm store path)"
  rm -rf "$PNPM_STORE"
else
  echo "pnpm not installed; skipping pnpm store cleanup"
fi

echo "✔ CLEAN COMPLETED"
