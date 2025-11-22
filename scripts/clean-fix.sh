#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "== CLEAN + FIX =="

# 1. حذف كامل
rm -rf node_modules
rm -f pnpm-lock.yaml

PNPM_STORE="$(npm run store path)"
rm -rf "$PNPM_STORE"

# 2. تنظيف الكاش
npm run store prune || true
npm run cache clean --force || true

# 3. إعادة التثبيت
npm run install

# 4. الموافقة على build scripts
npm run approve-builds --yes || true

# 5. فحص البيئة
npm run doctor || true

# 6. فحص الكود
npm run lint || true
npm run lint:fix || true
npm run format || true
npm run check || true

echo "✔ CLEAN & FIX COMPLETED"
