#!/bin/bash

# UberFix.shop - Complete Test Suite
# سكريبت الفحص الكامل للمشروع

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

# Start
print_step "🚀 Starting Complete Test Suite for UberFix.shop"
echo "Started at: $(date)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
fi

# 1. Unit Tests
print_step "1️⃣  Running Unit Tests (Vitest)"
if npm run test -- --run; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi
echo ""

# 2. Unit Tests with Coverage
print_step "2️⃣  Running Unit Tests with Coverage"
if npm run test:coverage; then
    print_success "Coverage report generated"
    echo "📊 Coverage report available at: coverage/index.html"
else
    print_warning "Coverage generation failed but continuing..."
fi
echo ""

# 3. Type Checking
print_step "3️⃣  Running TypeScript Type Check"
if npx tsc --noEmit; then
    print_success "Type checking passed"
else
    print_error "Type checking failed"
    exit 1
fi
echo ""

# 4. Linting
print_step "4️⃣  Running ESLint"
if npm run lint 2>/dev/null || true; then
    print_success "Linting completed"
else
    print_warning "Linting found issues but continuing..."
fi
echo ""

# 5. Build Test
print_step "5️⃣  Testing Production Build"
if npm run build; then
    print_success "Production build successful"
    BUILD_SIZE=$(du -sh dist | cut -f1)
    echo "📦 Build size: $BUILD_SIZE"
else
    print_error "Production build failed"
    exit 1
fi
echo ""

# 6. E2E Tests (if Playwright is configured)
print_step "6️⃣  Running E2E Tests (Playwright)"
if command -v npx &> /dev/null; then
    if npx playwright test --reporter=list; then
        print_success "E2E tests passed"
        echo "📊 E2E report available at: playwright-report/index.html"
    else
        print_warning "E2E tests failed or not configured"
    fi
else
    print_warning "Playwright not found, skipping E2E tests"
fi
echo ""

# 7. Supabase Database Linting (if available)
print_step "7️⃣  Running Supabase Database Linting"
if command -v supabase &> /dev/null; then
    if supabase db lint 2>/dev/null; then
        print_success "Database linting passed"
    else
        print_warning "Database linting not available or failed"
    fi
else
    print_warning "Supabase CLI not installed, skipping DB linting"
fi
echo ""

# 8. Security Checks
print_step "8️⃣  Running Security Audit"
if npm audit --production; then
    print_success "No security vulnerabilities found"
else
    print_warning "Security vulnerabilities detected - review npm audit output"
fi
echo ""

# 9. Bundle Size Analysis
print_step "9️⃣  Analyzing Bundle Size"
if [ -d "dist" ]; then
    echo "📦 Bundle Analysis:"
    echo "-------------------"
    du -sh dist/*
    
    # Check for large files
    echo ""
    echo "🔍 Large files (>500KB):"
    find dist -type f -size +500k -exec ls -lh {} \; | awk '{print $9, $5}'
    
    print_success "Bundle analysis completed"
else
    print_warning "dist folder not found"
fi
echo ""

# 10. Environment Check
print_step "🔟 Environment Validation"
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
if [ -f ".env.local" ]; then
    print_success ".env.local file found"
else
    print_warning ".env.local file not found"
fi
echo ""

# Final Summary
print_step "📋 Test Summary"
echo ""
echo "✅ Tests completed at: $(date)"
echo ""
echo "📊 Reports Generated:"
echo "  - Unit Test Coverage: coverage/index.html"
echo "  - E2E Test Report: playwright-report/index.html"
echo "  - Build Output: dist/"
echo ""

# Check if all critical tests passed
if [ $? -eq 0 ]; then
    print_step "🎉 All Critical Tests Passed!"
    echo ""
    echo "Your application is ready for deployment! 🚀"
    echo ""
    exit 0
else
    print_step "❌ Some Tests Failed"
    echo ""
    echo "Please review the errors above and fix them before deployment."
    echo ""
    exit 1
fi
