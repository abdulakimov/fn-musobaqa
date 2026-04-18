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

## 8) One-off safe Typing registration (production)
`/api/register` oqimi orqali bitta ishtirokchini deadline vaqtincha ochib qo'shish uchun:

```bash
cd /opt/fn-musobaqa
chmod +x ./scripts/register-one-typing-prod.sh
DEADLINE_OVERRIDE=2026-04-18T23:59:59+05:00 ./scripts/register-one-typing-prod.sh
```

Skript avtomatik ravishda:
- `.env.production` backup oladi
- duplicate telefonni tekshiradi (bo'lsa to'xtaydi)
- `TYPING_REGISTRATION_DEADLINE_TASHKENT` ni vaqtincha qo'yadi
- `app`/`worker` ni restart qiladi
- `POST /api/register` chaqiradi
- deadline ni oldingi holatga qaytaradi
- audit va health check qiladi

## 9) Admin duplicate fix verification (soft-delete aware phone unique)
Migrationdan keyin quyidagilarni tekshiring:

```bash
docker exec -i fn-musobaqa-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT conname
FROM pg_constraint
WHERE conrelid = '\"Royxat\"'::regclass
  AND conname = 'Royxat_telefon_key';
"

docker exec -i fn-musobaqa-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename='Royxat'
  AND indexname='Royxat_telefon_active_unique';
"
```

Kutilgan holat:
- `Royxat_telefon_key` topilmasligi kerak.
- `Royxat_telefon_active_unique` mavjud bo'lishi va `WHERE ("deletedAt" IS NULL)` ni o'z ichiga olishi kerak.
