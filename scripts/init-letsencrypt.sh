#!/usr/bin/env sh
set -eu

if [ ! -f ".env.production" ]; then
  echo ".env.production topilmadi"
  exit 1
fi

set -a
. ./.env.production
set +a

if [ -z "${DOMAIN:-}" ] || [ -z "${LETSENCRYPT_EMAIL:-}" ]; then
  echo "DOMAIN va LETSENCRYPT_EMAIL to'ldirilishi shart"
  exit 1
fi

echo "[1/4] HTTP-only nginx bilan stackni ishga tushirish"
NGINX_TEMPLATE=app-http-only.conf.template docker compose -f docker-compose.prod.yml up -d postgres app nginx

echo "[2/4] Let's Encrypt sertifikatini olish"
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  --email "$LETSENCRYPT_EMAIL" \
  -d "$DOMAIN" \
  --agree-tos --no-eff-email

echo "[3/4] TLS template ga o'tish"
NGINX_TEMPLATE=app-tls.conf.template docker compose -f docker-compose.prod.yml up -d nginx certbot

echo "[4/4] Tayyor"
echo "Nginx TLS yoqildi: https://$DOMAIN"
