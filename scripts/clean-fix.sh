#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "== CLEAN + FIX =="

# 1. حذف كامل
rm -rf node_modules
rm -f pnpm-lock.yaml

PNPM_STORE="$(pnpm store path)"
rm -rf "$PNPM_STORE"

# 2. تنظيف الكاش
pnpm store prune || true
pnpm cache clean --force || true

# 3. إعادة التثبيت
pnpm install

# 4. الموافقة على build scripts
pnpm approve-builds --yes || true

# 5. فحص البيئة
pnpm doctor || true

# 6. فحص الكود
pnpm run lint || true
pnpm run lint:fix || true
pnpm run format || true
pnpm run check || true

echo "✔ CLEAN & FIX COMPLETED"
