#!/usr/bin/env sh
set -eu

if [ $# -lt 1 ]; then
  echo "Foydalanish: ./scripts/restore-db.sh <backup.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Fayl topilmadi: $BACKUP_FILE"
  exit 1
fi

set -a
. ./.env.production
set +a

gunzip -c "$BACKUP_FILE" | docker compose -f docker-compose.prod.yml exec -T postgres psql \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB"

echo "Restore yakunlandi: $BACKUP_FILE"
