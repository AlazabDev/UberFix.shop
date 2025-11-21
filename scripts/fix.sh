#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "== FIX MODE (No Delete) =="

pnpm store prune || true
pnpm cache clean --force || true

if [ -f "pnpm-lock.yaml" ]; then
  pnpm install --frozen-lockfile
else
  pnpm install
fi

pnpm approve-builds --yes || true
pnpm doctor || true

pnpm run lint || true
pnpm run lint:fix || true
pnpm run format || true
pnpm run check || true

echo "✔ FIX COMPLETED"
