#!/usr/bin/env bash
# ========================================
# UberFix SSL Setup Script
# Domain: uberfix.alazab.com
# Run ONCE before first deployment
# ========================================

set -euo pipefail

DOMAIN="uberfix.alazab.com"
EMAIL="admin@alazab.com"

echo "🔐 Setting up SSL for $DOMAIN"

if ! command -v certbot &>/dev/null; then
    echo "📦 Installing certbot..."
    apt-get update -qq
    apt-get install -y -qq certbot
fi

echo "📋 Stopping any services on port 80..."
docker compose down 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true

echo "🔑 Obtaining SSL certificate..."
certbot certonly --standalone \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --preferred-challenges http

echo "✅ SSL certificate obtained!"
echo "   Certificate: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "   Private Key: /etc/letsencrypt/live/$DOMAIN/privkey.pem"

echo ""
echo "🔄 Setting up auto-renewal cron..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'docker exec uberfix-proxy nginx -s reload'") | sort -u | crontab -

echo "✅ SSL setup complete! Now run: ./scripts/auto-deploy.sh"
