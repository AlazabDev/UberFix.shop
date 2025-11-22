#!/bin/bash

# UberFix.shop - Security Testing Script
# سكريبت فحص الأمان

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_step "🔒 Security Testing Suite"
echo ""

# تحديد مدير الحزم
PKG="npm"
if command -v npm run &> /dev/null && [ -f "pnpm-lock.yaml" ]; then
  PKG="pnpm"
fi

# 1. Check for exposed secrets
print_step "1️⃣  Checking for Exposed Secrets"
if grep -r "SUPABASE_ANON_KEY\|GOOGLE_MAPS_API_KEY" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "process.env" | grep -v "import.meta.env" | grep -q .; then
    print_error "Found hardcoded secrets in source code!"
    exit 1
else
    print_success "No hardcoded secrets found"
fi
echo ""

# 2. NPM/npm run Audit
print_step "2️⃣  Running Security Audit"
if [ "$PKG" = "pnpm" ]; then
    if npm run audit --audit-level=moderate; then
        print_success "No moderate or higher vulnerabilities found (pnpm)"
    else
        print_warning "Security vulnerabilities detected - review npm run audit"
    fi
else
    if npm audit --audit-level=moderate; then
        print_success "No moderate or higher vulnerabilities found (npm)"
    else
        print_warning "Security vulnerabilities detected - review npm audit"
    fi
fi
echo ""

# 3. Check for console.log in production code
print_step "3️⃣  Checking for Debug Code"
DEBUG_COUNT=$(grep -r "console.log\|console.debug" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "// TODO\|// FIXME\|test" | wc -l || echo "0")
if [ "$DEBUG_COUNT" = "0" ]; then
    print_success "No debug console statements found"
else
    print_warning "Found console.log/debug statements - consider removing for production"
    grep -r "console.log\|console.debug" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "// TODO\|// FIXME\|test" | head -10
fi
echo ""

# 4. Supabase RLS Check
print_step "4️⃣  Checking Supabase RLS Policies"
if command -v supabase &> /dev/null; then
    if supabase db lint; then
        print_success "Supabase database lint passed"
    else
        print_error "Supabase linting issues found"
    fi
else
    print_warning "Supabase CLI not installed - skipping RLS check"
fi
echo ""

# 5. HTTPS/Security Headers Check
print_step "5️⃣  Checking Security Configuration"
if [ -f "vite.config.ts" ]; then
    if grep -qi "https" vite.config.ts; then
        print_success "HTTPS configuration reference found in vite.config.ts"
    else
        print_warning "No explicit HTTPS configuration in vite.config.ts"
    fi
fi
echo ""

# 6. Environment Variables Check
print_step "6️⃣  Validating Environment Variables"
if [ -f ".env.example" ]; then
    print_success ".env.example found"

    if [ -f ".env.local" ]; then
        print_success ".env.local found"

        while IFS= read -r line; do
            if [[ $line == *"="* ]] && [[ $line != \#* ]]; then
                var_name=$(echo "$line" | cut -d'=' -f1)
                if ! grep -q "^$var_name=" .env.local 2>/dev/null; then
                    print_warning "Missing environment variable: $var_name"
                fi
            fi
        done < .env.example
    else
        print_warning ".env.local not found - create from .env.example"
    fi
else
    print_warning ".env.example not found"
fi
echo ""

# 7. Check for TODO/FIXME in critical files
print_step "7️⃣  Checking for Pending Security TODOs"
if grep -r "TODO.*security\|FIXME.*security\|XXX.*security" src/ --include="*.ts" --include="*.tsx" -i 2>/dev/null | grep -q .; then
    print_warning "Found security-related TODOs"
    grep -r "TODO.*security\|FIXME.*security\|XXX.*security" src/ --include="*.ts" --include="*.tsx" -i 2>/dev/null | head -10
else
    print_success "No security TODOs found"
fi
echo ""

# 8. File Permissions Check
print_step "8️⃣  Checking File Permissions"
if find . \( -name "*.ts" -o -name "*.tsx" \) -type f -perm /go+w 2>/dev/null | grep -q .; then
    print_warning "Found world-writable source files"
    find . \( -name "*.ts" -o -name "*.tsx" \) -type f -perm /go+w 2>/dev/null | head -5
else
    print_success "File permissions are secure"
fi
echo ""

# Summary
print_step "📋 Security Test Summary"
echo ""
echo "Security scan completed at: $(date)"
echo ""
echo "⚠️  Remember to:"
echo "  1. Keep dependencies updated"
echo "  2. Review RLS policies regularly"
echo "  3. Never commit secrets to git"
echo "  4. Use environment variables for all sensitive data"
echo "  5. Enable HTTPS in production"
echo ""
print_success "Security testing completed!"
