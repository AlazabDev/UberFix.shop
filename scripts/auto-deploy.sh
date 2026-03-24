#!/usr/bin/env bash
# ========================================
# UberFix Auto-Deploy Script
# Domain: uberfix.alazab.com
# Usage: ./scripts/auto-deploy.sh
# ========================================

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="/var/log/uberfix-deploy.log"
DOMAIN="uberfix.alazab.com"
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
BACKUP_DIR="/var/backups/uberfix"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"; }
print_success() { log "${GREEN}✅ $1${NC}"; }
print_warning() { log "${YELLOW}⚠️  $1${NC}"; }
print_error() { log "${RED}❌ $1${NC}"; }
print_info() { log "${BLUE}ℹ️  $1${NC}"; }

mkdir -p "$BACKUP_DIR" "$(dirname "$LOG_FILE")"

echo ""
log "🚀 =========================================="
log "🚀 UberFix Auto-Deploy - $DOMAIN"
log "🚀 Timestamp: $TIMESTAMP"
log "🚀 =========================================="
echo ""

# ── Step 1: Pre-flight checks ──
preflight() {
    print_info "Running pre-flight checks..."

    if [ ! -f "$PROJECT_DIR/.env.production" ]; then
        print_error ".env.production not found! Copy .env.production.example and fill values."
        exit 1
    fi

    for cmd in docker git curl; do
        if ! command -v $cmd &>/dev/null; then
            print_error "$cmd is not installed!"
            exit 1
        fi
    done

    if ! docker compose version &>/dev/null 2>&1; then
        print_error "Docker Compose v2 is not available!"
        exit 1
    fi

    print_success "Pre-flight checks passed"
}

# ── Step 2: SSL certificate check ──
check_ssl() {
    print_info "Checking SSL certificates..."

    CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
    if [ ! -f "$CERT_PATH" ]; then
        print_warning "SSL cert not found at $CERT_PATH"
        print_info "Generating SSL certificate with certbot..."
        certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN" \
            --non-interactive --agree-tos --email admin@alazab.com \
            --preferred-challenges http || {
            print_error "Failed to generate SSL certificate"
            exit 1
        }
    fi

    EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_PATH" 2>/dev/null | cut -d= -f2)
    if [ -n "$EXPIRY" ]; then
        EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || echo 0)
        NOW_EPOCH=$(date +%s)
        DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
        if [ "$DAYS_LEFT" -lt 30 ]; then
            print_warning "SSL certificate expires in $DAYS_LEFT days - renewing..."
            certbot renew --quiet || print_warning "Renewal failed, will retry later"
        else
            print_success "SSL certificate valid for $DAYS_LEFT days"
        fi
    fi
}

# ── Step 3: Backup current deployment ──
backup() {
    print_info "Backing up current deployment..."

    if docker ps -q --filter "name=uberfix-web" | grep -q .; then
        docker compose -f "$PROJECT_DIR/docker-compose.yml" exec -T uberfix-web \
            tar -czf - /usr/share/nginx/html 2>/dev/null \
            > "$BACKUP_DIR/dist-$TIMESTAMP.tar.gz" || true
    fi

    cp -f "$PROJECT_DIR/.env.production" "$BACKUP_DIR/.env.production-$TIMESTAMP" 2>/dev/null || true

    # Keep only last 5 backups
    ls -t "$BACKUP_DIR"/dist-*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm -f

    print_success "Backup completed"
}

# ── Step 4: Pull latest code ──
pull_code() {
    print_info "Pulling latest code..."
    cd "$PROJECT_DIR"

    if [ -d ".git" ]; then
        CURRENT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
        git fetch origin main --quiet
        git reset --hard origin/main --quiet 2>/dev/null || git pull origin main --quiet
        NEW_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")

        if [ "$CURRENT_HASH" = "$NEW_HASH" ]; then
            print_info "No new changes (${CURRENT_HASH:0:8})"
        else
            print_success "Updated: ${CURRENT_HASH:0:8} → ${NEW_HASH:0:8}"
        fi
    else
        print_warning "Not a git repo - skipping pull"
    fi
}

# ── Step 5: Build and deploy ──
deploy() {
    print_info "Building and deploying..."
    cd "$PROJECT_DIR"

    docker compose --env-file .env.production build --no-cache --pull 2>&1 | tee -a "$LOG_FILE"

    print_info "Starting services with zero-downtime..."
    docker compose --env-file .env.production up -d --remove-orphans 2>&1 | tee -a "$LOG_FILE"

    print_success "Containers started"
}

# ── Step 6: Health check ──
health_check() {
    print_info "Running health checks..."

    local retries=15
    local wait=4

    for i in $(seq 1 $retries); do
        if curl -sf -o /dev/null "http://localhost:80/health" 2>/dev/null; then
            print_success "HTTP health check passed"
            break
        fi
        if [ $i -eq $retries ]; then
            print_error "HTTP health check failed after $retries attempts"
            print_info "Container logs:"
            docker logs --tail 30 uberfix-web 2>&1 | tee -a "$LOG_FILE"
            return 1
        fi
        sleep $wait
    done

    for i in $(seq 1 $retries); do
        if curl -sf -o /dev/null "https://$DOMAIN/health" 2>/dev/null; then
            print_success "HTTPS health check passed ($DOMAIN)"
            break
        fi
        if [ $i -eq $retries ]; then
            print_warning "HTTPS health check failed - check nginx-proxy logs"
            docker logs --tail 20 uberfix-proxy 2>&1 | tee -a "$LOG_FILE"
        fi
        sleep $wait
    done
}

# ── Step 7: Cleanup ──
cleanup() {
    print_info "Cleaning up..."
    docker image prune -f --filter "until=48h" 2>/dev/null || true
    docker volume prune -f 2>/dev/null || true
    print_success "Cleanup done"
}

# ── Step 8: Security scan ──
security_scan() {
    print_info "Running basic security scan..."

    # Check for exposed .env files
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/.env" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "404" ]; then
        print_success ".env file is blocked ($HTTP_CODE)"
    else
        print_error ".env file may be accessible! (HTTP $HTTP_CODE)"
    fi

    # Check for .git exposure
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/.git/config" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "404" ]; then
        print_success ".git directory is blocked ($HTTP_CODE)"
    else
        print_error ".git directory may be accessible! (HTTP $HTTP_CODE)"
    fi

    # Check HSTS header
    if curl -sI "https://$DOMAIN" 2>/dev/null | grep -qi "strict-transport-security"; then
        print_success "HSTS header present"
    else
        print_warning "HSTS header missing"
    fi

    # Check X-Frame-Options
    if curl -sI "https://$DOMAIN" 2>/dev/null | grep -qi "x-frame-options"; then
        print_success "X-Frame-Options header present"
    else
        print_warning "X-Frame-Options header missing"
    fi
}

# ── Step 9: Report ──
report() {
    echo ""
    log "=========================================="
    log "📊 Deployment Report"
    log "=========================================="
    log "Domain:    https://$DOMAIN"
    log "Timestamp: $TIMESTAMP"
    log "Log file:  $LOG_FILE"
    echo ""

    docker ps --filter "name=uberfix" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | tee -a "$LOG_FILE"

    echo ""
    print_success "Deployment complete! 🎉"
    echo ""
    log "  📋 Logs:    docker logs -f uberfix-web"
    log "  🔄 Restart: docker compose restart"
    log "  ⏹  Stop:    docker compose down"
    log "  🔍 Health:  curl https://$DOMAIN/health"
    log "=========================================="
}

# ── Main ──
main() {
    preflight
    check_ssl
    backup
    pull_code
    deploy
    health_check
    cleanup
    security_scan
    report
}

main "$@"
