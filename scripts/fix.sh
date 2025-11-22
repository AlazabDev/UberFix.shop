#!/usr/bin/env bash
set -euo pipefail

echo "== FIX MODE (Windows Compatible) =="

# تحديد مجلد المشروع
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "[1/7] npm run store prune..."
npm run store prune || true

echo "[2/7] Cleaning npm run cache..."
npm run cache clean --force || true

echo "[3/7] Installing dependencies..."
if [ -f "pnpm-lock.yaml" ]; then
  npm run install --frozen-lockfile || npm run install
else
  npm run install
fi

echo "[4/7] Running npm run doctor..."
npm run doctor || true

echo "[5/7] Running ESLint..."
npm run lint || true

echo "[6/7] Running lint:fix..."
npm run lint:fix || true

echo "[7/7] Running prettier format..."
npm run format || true

echo "✔ FIX COMPLETED (Windows + Git Bash Ready)"
