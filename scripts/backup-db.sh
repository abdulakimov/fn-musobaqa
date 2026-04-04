#!/usr/bin/env sh
set -eu

BACKUP_DIR="${1:-./backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"

set -a
. ./.env.production
set +a

FILE="$BACKUP_DIR/fn-musobaqa-$TIMESTAMP.sql.gz"

docker compose -f docker-compose.prod.yml exec -T postgres pg_dump \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" | gzip > "$FILE"

echo "Backup created: $FILE"
