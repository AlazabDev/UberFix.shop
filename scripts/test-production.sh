#!/bin/bash

# UberFix.shop - Production Readiness Test Script
# سكريبت فحص الجاهزية للإنتاج

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Counters
PASS=0
FAIL=0
WARN=0

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    ((PASS++))
}

print_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    ((FAIL++))
}

print_warn() {
    echo -e "${YELLOW}⚠️  WARN: $1${NC}"
    ((WARN++))
}

print_info() {
    echo -e "${PURPLE}ℹ️  INFO: $1${NC}"
}

# Start
clear
print_header "🚀 UberFix.shop - Production Readiness Check"
echo "Started at: $(date)"
echo ""

# ============================================
# 1. Environment Check
# ============================================
print_header "1️⃣  Environment Validation"

if [ -f "package.json" ]; then
    print_pass "package.json exists"
else
    print_fail "package.json not found"
fi

if [ -f "package-lock.json" ]; then
    print_pass "package-lock.json exists"
else
    print_fail "package-lock.json missing (CRITICAL - run: npm install)"
fi

if [ -f ".env.local" ]; then
    print_pass ".env.local exists"
else
    print_warn ".env.local not found"
fi

echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# ============================================
# 2. Dependencies Check
# ============================================
print_header "2️⃣  Dependencies Check"

if [ -d "node_modules" ]; then
    print_pass "node_modules directory exists"
    
    # Check for critical dependencies
    if [ -d "node_modules/react" ]; then
        print_pass "React installed"
    else
        print_fail "React not installed"
    fi
    
    if [ -d "node_modules/@supabase/supabase-js" ]; then
        print_pass "Supabase client installed"
    else
        print_fail "Supabase client not installed"
    fi
else
    print_fail "node_modules not found - run: npm install"
fi
echo ""

# ============================================
# 3. Build Test
# ============================================
print_header "3️⃣  Production Build Test"

print_info "Building for production..."
if npm run build > /dev/null 2>&1; then
    print_pass "Production build successful"
    
    if [ -d "dist" ]; then
        BUILD_SIZE=$(du -sh dist | cut -f1)
        print_info "Build size: $BUILD_SIZE"
        
        # Check for index.html
        if [ -f "dist/index.html" ]; then
            print_pass "dist/index.html generated"
        else
            print_fail "dist/index.html not found"
        fi
    fi
else
    print_fail "Production build failed"
fi
echo ""

# ============================================
# 4. TypeScript Check
# ============================================
print_header "4️⃣  TypeScript Type Check"

print_info "Running TypeScript compiler..."
if npx tsc --noEmit; then
    print_pass "No TypeScript errors"
else
    print_fail "TypeScript errors found"
fi
echo ""

# ============================================
# 5. Linting
# ============================================
print_header "5️⃣  Code Linting"

print_info "Running ESLint..."
if npm run lint 2>/dev/null; then
    print_pass "Linting passed"
else
    print_warn "Linting found issues (review recommended)"
fi
echo ""

# ============================================
# 6. Unit Tests
# ============================================
print_header "6️⃣  Unit Tests"

print_info "Running unit tests..."
if npm run test -- --run 2>/dev/null; then
    print_pass "Unit tests passed"
else
    print_warn "Unit tests failed or not configured"
fi
echo ""

# ============================================
# 7. E2E Tests (if configured)
# ============================================
print_header "7️⃣  E2E Tests (Playwright)"

if command -v npx playwright &> /dev/null; then
    print_info "Running E2E tests..."
    if npx playwright test --reporter=list 2>/dev/null; then
        print_pass "E2E tests passed"
    else
        print_warn "E2E tests failed or incomplete"
    fi
else
    print_warn "Playwright not found - skipping E2E tests"
fi
echo ""

# ============================================
# 8. Security Audit
# ============================================
print_header "8️⃣  Security Audit"

print_info "Running npm audit..."
if npm audit --production --audit-level=high; then
    print_pass "No high-severity vulnerabilities"
else
    print_warn "Security vulnerabilities detected"
fi
echo ""

# ============================================
# 9. File Structure Check
# ============================================
print_header "9️⃣  Critical Files Check"

CRITICAL_FILES=(
    "src/main.tsx"
    "src/App.tsx"
    "src/integrations/supabase/client.ts"
    "index.html"
    "vite.config.ts"
    "tsconfig.json"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_pass "$file exists"
    else
        print_fail "$file missing"
    fi
done
echo ""

# ============================================
# 10. Supabase Configuration Check
# ============================================
print_header "🔟 Supabase Configuration"

if [ -f "src/integrations/supabase/client.ts" ]; then
    if grep -q "SUPABASE_URL" src/integrations/supabase/client.ts; then
        print_pass "Supabase URL configured"
    else
        print_fail "Supabase URL not configured"
    fi
    
    if grep -q "SUPABASE_PUBLISHABLE_KEY" src/integrations/supabase/client.ts; then
        print_pass "Supabase key configured"
    else
        print_fail "Supabase key not configured"
    fi
fi
echo ""

# ============================================
# 11. Bundle Size Analysis
# ============================================
print_header "1️⃣1️⃣  Bundle Analysis"

if [ -d "dist" ]; then
    print_info "Analyzing bundle size..."
    
    LARGE_FILES=$(find dist -type f -size +500k 2>/dev/null)
    if [ -n "$LARGE_FILES" ]; then
        print_warn "Large files detected (>500KB):"
        echo "$LARGE_FILES" | while read file; do
            SIZE=$(du -h "$file" | cut -f1)
            echo "  - $file ($SIZE)"
        done
    else
        print_pass "No excessively large files"
    fi
fi
echo ""

# ============================================
# 12. Manual Checklist Reminder
# ============================================
print_header "1️⃣2️⃣  Manual Checks Required"

echo ""
print_info "Please verify manually:"
echo "  1. ⚠️  Database RLS policies (especially 'appointments' table)"
echo "  2. ⚠️  Edge Functions authentication (send-whatsapp-notification)"
echo "  3. ⚠️  CAPTCHA on public forms (QuickRequestForm)"
echo "  4. ⚠️  Rate limiting on API endpoints"
echo "  5. ⚠️  Storage bucket permissions"
echo "  6. ⚠️  Environment variables in production"
echo "  7. ⚠️  Supabase project limits and quotas"
echo "  8. ⚠️  Domain configuration and SSL"
echo "  9. ⚠️  Error tracking setup (e.g., Sentry)"
echo "  10. ⚠️  Backup and recovery procedures"
echo ""

# ============================================
# Final Summary
# ============================================
print_header "📊 Test Summary"

echo ""
echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARN${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"
echo ""

# Determine overall status
if [ $FAIL -eq 0 ]; then
    if [ $WARN -eq 0 ]; then
        print_header "🎉 Production Ready!"
        echo ""
        echo "All automated checks passed!"
        echo "Don't forget to complete the manual checks above."
        echo ""
        exit 0
    else
        print_header "⚠️  Ready with Warnings"
        echo ""
        echo "Automated checks passed with warnings."
        echo "Review warnings and complete manual checks before deploying."
        echo ""
        exit 0
    fi
else
    print_header "❌ NOT Production Ready"
    echo ""
    echo "Critical issues detected. Fix all failures before deploying."
    echo ""
    exit 1
fi
