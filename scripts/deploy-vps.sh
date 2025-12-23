#!/usr/bin/env bash
# ========================================
# UberFix VPS Deployment Script
# Usage: ./scripts/deploy-vps.sh [production|staging]
# ========================================

set -euo pipefail

ENVIRONMENT="${1:-production}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "🚀 UberFix Deployment - Environment: $ENVIRONMENT"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Check for required files
check_requirements() {
    echo "📋 Checking requirements..."
    
    if [ ! -f "$PROJECT_DIR/.env.production" ]; then
        print_error ".env.production not found!"
        echo "   Copy .env.production.example to .env.production and fill in your values"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed!"
        exit 1
    fi
    
    print_success "All requirements met"
}

# Load environment variables
load_env() {
    echo "📦 Loading environment variables..."
    set -a
    source "$PROJECT_DIR/.env.production"
    set +a
    print_success "Environment loaded"
}

# Build and deploy
deploy() {
    echo "🏗️  Building and deploying..."
    cd "$PROJECT_DIR"
    
    # Pull latest changes if git repo
    if [ -d ".git" ]; then
        echo "   Pulling latest changes..."
        git pull origin main || git pull origin master || true
    fi
    
    # Build and start containers
    if docker compose version &> /dev/null; then
        docker compose --env-file .env.production build --no-cache
        docker compose --env-file .env.production up -d
    else
        docker-compose --env-file .env.production build --no-cache
        docker-compose --env-file .env.production up -d
    fi
    
    print_success "Deployment complete!"
}

# Health check
health_check() {
    echo "🏥 Running health check..."
    sleep 5
    
    if curl -s http://localhost:80/health | grep -q "healthy"; then
        print_success "Application is healthy!"
    else
        print_warning "Health check failed - check logs with: docker logs uberfix-web"
    fi
}

# Cleanup old images
cleanup() {
    echo "🧹 Cleaning up old images..."
    docker image prune -f
    print_success "Cleanup complete"
}

# Main execution
main() {
    check_requirements
    load_env
    deploy
    health_check
    cleanup
    
    echo ""
    echo "=================================================="
    print_success "UberFix is now running!"
    echo "   View logs: docker logs -f uberfix-web"
    echo "   Stop: docker compose down"
    echo "   Restart: docker compose restart"
    echo "=================================================="
}

main
