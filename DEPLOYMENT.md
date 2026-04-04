# Production Deployment (VPS)

## 1) Server prerequisites
- Ubuntu 22.04+ VPS
- Docker + Docker Compose plugin
- Domain A record -> VPS IP
- Open ports: `22`, `80`, `443`

## 2) Environment setup
1. Copy `.env.production.example` to `.env.production`.
2. Fill all secrets with strong values.
3. Keep `DOMAIN` and `LETSENCRYPT_EMAIL` correct.

## 3) First deploy
```bash
docker compose -f docker-compose.prod.yml build migrate app
docker compose -f docker-compose.prod.yml up -d postgres app nginx
docker compose -f docker-compose.prod.yml run --rm migrate
./scripts/init-letsencrypt.sh
```

## 4) Routine deploy
```bash
git pull
docker compose -f docker-compose.prod.yml build --pull migrate app
docker compose -f docker-compose.prod.yml run --rm migrate
NGINX_TEMPLATE=app-tls.conf.template docker compose -f docker-compose.prod.yml up -d postgres app nginx certbot
```

## 5) Health checks
- Liveness: `GET /api/healthz`
- Readiness: `GET /api/readyz`

## 6) Backup / restore
```bash
./scripts/backup-db.sh /opt/backups/fn-musobaqa
./scripts/restore-db.sh /opt/backups/fn-musobaqa/<file>.sql.gz
```

### Cron example (daily backup + retention)
```bash
0 2 * * * cd /opt/fn-musobaqa && ./scripts/backup-db.sh /opt/backups/fn-musobaqa >> /var/log/fn-musobaqa-backup.log 2>&1
30 2 * * * find /opt/backups/fn-musobaqa -type f -name "*.sql.gz" -mtime +30 -delete
```

## 7) Rollback
1. Checkout previous stable git tag.
2. Rebuild and run:
```bash
docker compose -f docker-compose.prod.yml build migrate app
docker compose -f docker-compose.prod.yml run --rm migrate
NGINX_TEMPLATE=app-tls.conf.template docker compose -f docker-compose.prod.yml up -d postgres app nginx certbot
```
