#!/usr/bin/env bash
set -euo pipefail

echo "== FIX MODE (Windows Compatible) =="

# تحديد مجلد المشروع
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "[1/7] PNPM store prune..."
pnpm store prune || true

echo "[2/7] Cleaning pnpm cache..."
pnpm cache clean --force || true

echo "[3/7] Installing dependencies..."
if [ -f "pnpm-lock.yaml" ]; then
  pnpm install --frozen-lockfile || pnpm install
else
  pnpm install
fi

echo "[4/7] Running pnpm doctor..."
pnpm doctor || true

echo "[5/7] Running ESLint..."
pnpm run lint || true

echo "[6/7] Running lint:fix..."
pnpm run lint:fix || true

echo "[7/7] Running prettier format..."
pnpm run format || true

echo "✔ FIX COMPLETED (Windows + Git Bash Ready)"
