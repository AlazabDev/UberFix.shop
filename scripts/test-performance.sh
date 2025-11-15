#!/bin/bash

# UberFix.shop - Performance Testing Script
# سكريبت فحص الأداء

set -e

# Colors
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

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_step "⚡ Performance Testing Suite"
echo ""

# 1. Build Analysis
print_step "1️⃣  Analyzing Production Build"
if [ ! -d "dist" ]; then
    echo "Building production version..."
    npm run build
fi

echo "📦 Build Size Analysis:"
echo "----------------------"
du -sh dist
du -sh dist/assets/* 2>/dev/null || echo "No assets found"
echo ""

# Check bundle sizes
print_step "2️⃣  Checking Bundle Sizes"
TOTAL_JS_SIZE=$(find dist/assets -name "*.js" -exec du -b {} + | awk '{sum+=$1} END {print sum/1024/1024}')
TOTAL_CSS_SIZE=$(find dist/assets -name "*.css" -exec du -b {} + | awk '{sum+=$1} END {print sum/1024/1024}')

echo "Total JavaScript: ${TOTAL_JS_SIZE} MB"
echo "Total CSS: ${TOTAL_CSS_SIZE} MB"
echo ""

# Warn if bundles are too large
if (( $(echo "$TOTAL_JS_SIZE > 2" | bc -l) )); then
    print_warning "JavaScript bundle size is large (>2MB)"
else
    print_success "JavaScript bundle size is acceptable"
fi

if (( $(echo "$TOTAL_CSS_SIZE > 0.5" | bc -l) )); then
    print_warning "CSS bundle size is large (>500KB)"
else
    print_success "CSS bundle size is acceptable"
fi
echo ""

# 3. Large Files Check
print_step "3️⃣  Identifying Large Files (>500KB)"
find dist -type f -size +500k -exec ls -lh {} \; | awk '{print $9, $5}' | while read file; do
    print_warning "Large file: $file"
done
echo ""

# 4. Image Optimization Check
print_step "4️⃣  Checking Image Optimization"
if find dist -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" \) | grep -q .; then
    echo "Images found:"
    find dist -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" \) -exec ls -lh {} \; | awk '{print $9, $5}'
    print_warning "Consider optimizing images with WebP format"
else
    print_success "No unoptimized images found"
fi
echo ""

# 5. Compression Check
print_step "5️⃣  Checking Gzip Compression"
if command -v gzip &> /dev/null; then
    echo "Testing gzip compression on main bundle..."
    MAIN_JS=$(find dist/assets -name "index-*.js" | head -1)
    if [ -n "$MAIN_JS" ]; then
        ORIGINAL_SIZE=$(du -b "$MAIN_JS" | cut -f1)
        gzip -c "$MAIN_JS" > /tmp/test.js.gz
        COMPRESSED_SIZE=$(du -b /tmp/test.js.gz | cut -f1)
        COMPRESSION_RATIO=$(echo "scale=2; (1 - $COMPRESSED_SIZE/$ORIGINAL_SIZE) * 100" | bc)
        
        echo "Original: $(echo "scale=2; $ORIGINAL_SIZE/1024" | bc) KB"
        echo "Compressed: $(echo "scale=2; $COMPRESSED_SIZE/1024" | bc) KB"
        echo "Compression: ${COMPRESSION_RATIO}%"
        
        rm /tmp/test.js.gz
        print_success "Gzip compression ratio: ${COMPRESSION_RATIO}%"
    fi
else
    print_warning "gzip not found - skipping compression test"
fi
echo ""

# 6. Code Splitting Check
print_step "6️⃣  Checking Code Splitting"
CHUNK_COUNT=$(find dist/assets -name "*.js" | wc -l)
echo "Number of JavaScript chunks: $CHUNK_COUNT"

if [ "$CHUNK_COUNT" -gt 5 ]; then
    print_success "Good code splitting detected ($CHUNK_COUNT chunks)"
else
    print_warning "Consider improving code splitting (only $CHUNK_COUNT chunks)"
fi
echo ""

# 7. Lighthouse CLI (if available)
print_step "7️⃣  Running Lighthouse (if available)"
if command -v lighthouse &> /dev/null; then
    echo "Starting dev server for Lighthouse..."
    npm run dev &
    DEV_PID=$!
    
    # Wait for server to start
    sleep 5
    
    echo "Running Lighthouse audit..."
    lighthouse http://localhost:8080 \
        --output=html \
        --output-path=./lighthouse-report.html \
        --chrome-flags="--headless" \
        --quiet
    
    # Kill dev server
    kill $DEV_PID
    
    print_success "Lighthouse report generated: lighthouse-report.html"
else
    print_warning "Lighthouse not installed - skipping"
    echo "Install with: npm install -g lighthouse"
fi
echo ""

# 8. Memory Usage Estimation
print_step "8️⃣  Estimating Memory Impact"
echo "Calculating estimated memory usage..."
TOTAL_SIZE=$(du -sb dist | cut -f1)
ESTIMATED_MEMORY=$(echo "scale=2; $TOTAL_SIZE/1024/1024 * 1.5" | bc)
echo "Estimated browser memory usage: ~${ESTIMATED_MEMORY} MB"

if (( $(echo "$ESTIMATED_MEMORY > 50" | bc -l) )); then
    print_warning "High memory usage expected"
else
    print_success "Memory usage within acceptable range"
fi
echo ""

# Summary
print_step "📋 Performance Test Summary"
echo ""
echo "Performance metrics:"
echo "  - Build size: $(du -sh dist | cut -f1)"
echo "  - JavaScript: ${TOTAL_JS_SIZE} MB"
echo "  - CSS: ${TOTAL_CSS_SIZE} MB"
echo "  - Code chunks: $CHUNK_COUNT"
echo ""
echo "Recommendations:"
echo "  ✓ Use code splitting for large components"
echo "  ✓ Lazy load routes and heavy dependencies"
echo "  ✓ Optimize images with WebP format"
echo "  ✓ Enable Gzip/Brotli compression on server"
echo "  ✓ Use CDN for static assets"
echo ""

print_success "Performance testing completed!"
