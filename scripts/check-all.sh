#!/usr/bin/env bash
set -euo pipefail

################################################################################
# UberFix.shop – check-all.sh
# يجمع كل الفحوصات الأساسية للمشروع في أمر واحد:
# - TypeScript type-check
# - ESLint lint
# - Vitest unit tests + optional coverage
# - Build
# - Playwright E2E (لو فيه إعداد)
################################################################################

# تحديد جذر المشروع بالنسبة لمجلد السكربت
ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# ألوان بسيطة للمخرجات
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# إعدادات افتراضية (تقدر تغيّرها بمتغيرات بيئة)
RUN_COVERAGE="${RUN_COVERAGE:-0}"   # 1 لتشغيل تغطية الاختبارات
RUN_E2E="${RUN_E2E:-1}"             # 0 لتعطيل Playwright من السكربت

###############################################################################
# دوال مساعدة
###############################################################################

log_step () {
  printf "\n${CYAN}%s${RESET}\n" "────────────────────── $1 ──────────────────────"
}

log_ok () {
  printf "${GREEN}✔ %s${RESET}\n" "$1"
}

log_warn () {
  printf "${YELLOW}⚠ %s${RESET}\n" "$1"
}

log_fail () {
  printf "${RED}✖ %s${RESET}\n" "$1"
}

check_command () {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    log_fail "الأمر '$cmd' غير موجود في PATH"
    exit 1
  fi
}

has_playwright_config () {
  # يتحقق هل يوجد ملف إعداد Playwright
  if ls "$ROOT_DIR"/playwright.config.* >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

###############################################################################
# فحص البيئة
###############################################################################

log_step "فحص البيئة والأساسيات"

check_command pnpm
log_ok "npm run موجود"

if [ ! -d "node_modules" ]; then
  log_warn "مجلد node_modules غير موجود. شغّل 'npm run install' أولاً."
  exit 1
fi

if [ ! -f "package.json" ]; then
  log_fail "لا يوجد package.json في $ROOT_DIR"
  exit 1
fi

###############################################################################
# TypeScript type-check
###############################################################################

if [ -f "tsconfig.json" ]; then
  log_step "TypeScript – فحص الأنواع (tsc --noEmit)"
  npm run exec tsc --noEmit
  log_ok "TypeScript type-check نجح"
else
  log_warn "لا يوجد tsconfig.json – تخطي فحص TypeScript"
fi

###############################################################################
# ESLint lint
###############################################################################

log_step "ESLint – فحص الكود"

if jq -e '.scripts.lint' package.json >/dev/null 2>&1; then
  # لو فيه سكربت lint في package.json
  npm run lint
else
  # fallback مباشر لو مفيش سكربت lint
  if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.cjs" ] || [ -f ".eslintrc.json" ] || [ -f ".eslintrc" ]; then
    npm run exec eslint "src/**/*.{ts,tsx,js,jsx}"
  else
    log_warn "لا يوجد سكربت lint ولا إعداد ESLint واضح – تم تخطي lint"
  fi
fi

log_ok "ESLint lint انتهى بدون أخطاء قاتلة"

###############################################################################
# Vitest – Unit Tests
###############################################################################

log_step "Vitest – اختبارات الوحدة"

if jq -e '.scripts.test' package.json >/dev/null 2>&1; then
  if [ "$RUN_COVERAGE" = "1" ]; then
    if jq -e '.scripts["test:coverage"]' package.json >/dev/null 2>&1; then
      npm run test:coverage
    else
      npm run test -- --coverage
    fi
  else
    npm run test
  fi
  log_ok "اختبارات Vitest نجحت"
else
  # fallback لو مفيش سكربت test
  if ls src/**/*.{test,spec}.{ts,tsx,js,jsx} >/dev/null 2>&1; then
    npm run exec vitest
    log_ok "اختبارات Vitest (بدون سكربت npm) نجحت"
  else
    log_warn "لا يوجد سكربت test ولا ملفات اختبار – تم تخطي Vitest"
  fi
fi

###############################################################################
# Build
###############################################################################

log_step "Vite – build"

if jq -e '.scripts.build' package.json >/dev/null 2>&1; then
  npm run build
  log_ok "بناء المشروع نجح"
else
  log_warn "لا يوجد سكربت build في package.json – تم تخطي build"
fi

###############################################################################
# Playwright – E2E
###############################################################################

if [ "$RUN_E2E" = "1" ]; then
  log_step "Playwright – اختبارات End-to-End"

  if has_playwright_config; then
    # نفضل استخدام سكربت npm لو موجود
    if jq -e '.scripts["test:e2e"]' package.json >/dev/null 2>&1; then
      npm run test:e2e
    else
      npm run exec playwright test
    fi
    log_ok "اختبارات Playwright E2E نجحت"
  else
    log_warn "لا يوجد playwright.config.* – تم تخطي اختبارات E2E"
  fi
else
  log_warn "RUN_E2E=0 – تم تعطيل Playwright E2E من هذا السكربت"
fi

###############################################################################
# Summary
###############################################################################

printf "\n${BOLD}${GREEN}✅ جميع الفحوصات الأساسية اكتملت بنجاح.${RESET}\n"
printf "${BOLD}المسار:${RESET} %s\n" "$ROOT_DIR"
