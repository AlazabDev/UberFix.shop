#!/usr/bin/env bash
# ========================================
# UberFix Android AAB Build Script
# For Google Play Store deployment
# ========================================

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="$PROJECT_DIR/android"

echo "🤖 UberFix Android Build Script"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        exit 1
    fi
    print_success "Node.js: $(node -v)"
    
    # Check npm/pnpm
    if command -v pnpm &> /dev/null; then
        PKG_MANAGER="pnpm"
    else
        PKG_MANAGER="npm"
    fi
    print_success "Package manager: $PKG_MANAGER"
    
    # Check Java
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed! Install JDK 17+"
        exit 1
    fi
    print_success "Java: $(java -version 2>&1 | head -n 1)"
    
    # Check Android SDK
    if [ -z "${ANDROID_HOME:-}" ] && [ -z "${ANDROID_SDK_ROOT:-}" ]; then
        print_warning "ANDROID_HOME or ANDROID_SDK_ROOT not set"
        print_info "Make sure Android SDK is installed via Android Studio"
    else
        print_success "Android SDK found"
    fi
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    cd "$PROJECT_DIR"
    
    if [ "$PKG_MANAGER" = "pnpm" ]; then
        pnpm install
    else
        npm install
    fi
    
    print_success "Dependencies installed"
}

# Build web assets
build_web() {
    echo "🏗️  Building web assets..."
    cd "$PROJECT_DIR"
    
    # Set production environment
    export NODE_ENV=production
    
    if [ "$PKG_MANAGER" = "pnpm" ]; then
        pnpm build
    else
        npm run build
    fi
    
    print_success "Web assets built"
}

# Add Android platform if not exists
add_android() {
    echo "📱 Checking Android platform..."
    cd "$PROJECT_DIR"
    
    if [ ! -d "$ANDROID_DIR" ]; then
        print_info "Adding Android platform..."
        npx cap add android
    else
        print_success "Android platform exists"
    fi
}

# Sync Capacitor
sync_capacitor() {
    echo "🔄 Syncing Capacitor..."
    cd "$PROJECT_DIR"
    npx cap sync android
    print_success "Capacitor synced"
}

# Check for keystore
check_keystore() {
    echo "🔐 Checking keystore..."
    
    KEYSTORE_PATH="$PROJECT_DIR/android/app/uberfix-release-key.jks"
    
    if [ ! -f "$KEYSTORE_PATH" ]; then
        print_warning "Release keystore not found!"
        echo ""
        echo "To create a keystore, run:"
        echo "  keytool -genkey -v -keystore android/app/uberfix-release-key.jks \\"
        echo "    -keyalg RSA -keysize 2048 -validity 10000 \\"
        echo "    -alias uberfix-key"
        echo ""
        print_info "Building debug AAB instead..."
        return 1
    fi
    
    print_success "Keystore found"
    return 0
}

# Build AAB
build_aab() {
    echo "📦 Building AAB..."
    cd "$ANDROID_DIR"
    
    if check_keystore; then
        # Release build
        print_info "Building signed release AAB..."
        ./gradlew bundleRelease
        
        AAB_PATH="app/build/outputs/bundle/release/app-release.aab"
        if [ -f "$AAB_PATH" ]; then
            print_success "Release AAB created!"
            echo "   📍 Location: $ANDROID_DIR/$AAB_PATH"
        fi
    else
        # Debug build
        print_info "Building debug AAB..."
        ./gradlew bundleDebug
        
        AAB_PATH="app/build/outputs/bundle/debug/app-debug.aab"
        if [ -f "$AAB_PATH" ]; then
            print_success "Debug AAB created!"
            echo "   📍 Location: $ANDROID_DIR/$AAB_PATH"
        fi
    fi
}

# Build APK (for testing)
build_apk() {
    echo "📱 Building APK for testing..."
    cd "$ANDROID_DIR"
    
    ./gradlew assembleDebug
    
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        print_success "Debug APK created!"
        echo "   📍 Location: $ANDROID_DIR/$APK_PATH"
        echo "   Install with: adb install $ANDROID_DIR/$APK_PATH"
    fi
}

# Main menu
main() {
    check_prerequisites
    
    echo ""
    echo "Select build type:"
    echo "  1) Full build (web + sync + AAB)"
    echo "  2) AAB only (assumes web is already built)"
    echo "  3) APK for testing"
    echo "  4) Sync only"
    echo ""
    
    read -p "Enter choice [1-4]: " choice
    
    case $choice in
        1)
            install_dependencies
            build_web
            add_android
            sync_capacitor
            build_aab
            ;;
        2)
            sync_capacitor
            build_aab
            ;;
        3)
            sync_capacitor
            build_apk
            ;;
        4)
            sync_capacitor
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    echo ""
    echo "================================"
    print_success "Build completed!"
    echo ""
    echo "Next steps for Google Play:"
    echo "  1. Go to Google Play Console"
    echo "  2. Create new app or select existing"
    echo "  3. Go to Production > Create new release"
    echo "  4. Upload the AAB file"
    echo "  5. Complete store listing requirements"
    echo ""
}

main "$@"
