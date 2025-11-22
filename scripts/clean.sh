#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "== CLEAN MODE =="

rm -rf node_modules
rm -f pnpm-lock.yaml

PNPM_STORE="$(npm run store path)"
rm -rf "$PNPM_STORE"

echo "✔ CLEAN COMPLETED"
