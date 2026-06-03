#!/usr/bin/env sh
set -eu

# One-off safe production registration for a Typing participant.
# Flow:
# 1) backup .env.production
# 2) duplicate pre-check (stop if phone already exists)
# 3) temporarily open Typing deadline
# 4) register via official /api/register API
# 5) restore previous deadline immediately
# 6) audit checks + health checks

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
TMP_KEY="TYPING_REGISTRATION_DEADLINE_TASHKENT"

ISM="${ISM:-Zuhriddin}"
FAMILIYA="${FAMILIYA:-Hakimjonov}"
OTASINING_ISMI="${OTASINING_ISMI:-Komiljon o'g'li}"
PHONE="${PHONE:-+998932714140}"
YONALISH="TYPING"
YOSH_GURUHI="YOSH_9_14"

# Keep this in the future when running the script.
DEADLINE_OVERRIDE="${DEADLINE_OVERRIDE:-2026-04-18T23:59:59+05:00}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Xato: $ENV_FILE topilmadi"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Xato: docker topilmadi"
  exit 1
fi

compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}

set -a
. "./$ENV_FILE"
set +a

TS="$(date +%Y%m%d-%H%M%S)"
ENV_BACKUP="$ENV_FILE.bak.$TS"

HAD_KEY="0"
ORIGINAL_LINE=""
ENV_TOUCHED="0"
RESTORED="0"

cleanup() {
  if [ "$RESTORED" = "1" ]; then
    return
  fi
  if [ "$ENV_TOUCHED" = "1" ]; then
    echo "[cleanup] Deadline qaytarilmoqda..."
    restore_deadline || true
    compose up -d app worker >/dev/null 2>&1 || true
  fi
}

restore_deadline() {
  TMP_FILE="$(mktemp)"
  awk -v key="$TMP_KEY" 'index($0, key "=") != 1 { print $0 }' "$ENV_FILE" > "$TMP_FILE"
  if [ "$HAD_KEY" = "1" ]; then
    printf '%s\n' "$ORIGINAL_LINE" >> "$TMP_FILE"
  fi
  mv "$TMP_FILE" "$ENV_FILE"
}

trap cleanup EXIT INT TERM

cp "$ENV_FILE" "$ENV_BACKUP"
echo "[1/8] Env backup olindi: $ENV_BACKUP"

if grep -q "^$TMP_KEY=" "$ENV_FILE"; then
  HAD_KEY="1"
  ORIGINAL_LINE="$(grep "^$TMP_KEY=" "$ENV_FILE" | tail -n 1)"
fi

echo "[2/8] Duplicate pre-check..."
DUP_COUNT="$(
  compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atqc \
    "SELECT COUNT(*) FROM \"Royxat\" WHERE telefon = '$PHONE' AND \"deletedAt\" IS NULL;"
)"

if [ "$DUP_COUNT" != "0" ]; then
  EXISTING="$(
    compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atqc \
      "SELECT COALESCE(\"participantId\", ''), id FROM \"Royxat\" WHERE telefon = '$PHONE' AND \"deletedAt\" IS NULL ORDER BY \"createdAt\" DESC LIMIT 1;"
  )"
  echo "TO'XTADI: telefon allaqachon mavjud. participantId|id: $EXISTING"
  exit 10
fi

echo "[3/8] Typing deadline vaqtincha ochilmoqda: $DEADLINE_OVERRIDE"
TMP_FILE="$(mktemp)"
awk -v key="$TMP_KEY" 'index($0, key "=") != 1 { print $0 }' "$ENV_FILE" > "$TMP_FILE"
printf '%s=%s\n' "$TMP_KEY" "$DEADLINE_OVERRIDE" >> "$TMP_FILE"
mv "$TMP_FILE" "$ENV_FILE"
ENV_TOUCHED="1"

echo "[4/8] app/worker restart..."
compose up -d app worker

echo "[5/8] /api/register chaqirilmoqda..."
REGISTER_RAW="$(
  REG_ISM="$ISM" \
  REG_FAMILIYA="$FAMILIYA" \
  REG_OTA="$OTASINING_ISMI" \
  REG_PHONE="$PHONE" \
  REG_YONALISH="$YONALISH" \
  REG_YOSH="$YOSH_GURUHI" \
  compose exec -T app node -e '
const payload = {
  ism: process.env.REG_ISM,
  familiya: process.env.REG_FAMILIYA,
  otasiningIsmi: process.env.REG_OTA,
  telefon: process.env.REG_PHONE,
  yonalish: process.env.REG_YONALISH,
  yoshGuruhi: process.env.REG_YOSH,
};
fetch("http://127.0.0.1:3000/api/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
})
  .then(async (res) => {
    const body = await res.text();
    process.stdout.write(String(res.status) + "\n" + body);
  })
  .catch((err) => {
    console.error(err?.stack || String(err));
    process.exit(1);
  });
'
)"

REG_STATUS="$(printf '%s\n' "$REGISTER_RAW" | awk 'NR==1 { print; exit }')"
REG_BODY="$(printf '%s\n' "$REGISTER_RAW" | awk 'NR>1 { print }')"

if [ "$REG_STATUS" != "201" ]; then
  echo "XATO: registration muvaffaqiyatsiz. status=$REG_STATUS"
  echo "$REG_BODY"
  exit 20
fi

PARTICIPANT_ID="$(printf '%s' "$REG_BODY" | sed -n 's/.*"participantId":"\([^"]*\)".*/\1/p')"
REG_ID="$(printf '%s' "$REG_BODY" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')"

if [ -z "$PARTICIPANT_ID" ] || [ -z "$REG_ID" ]; then
  echo "XATO: 201 qaytdi, lekin id/participantId topilmadi."
  echo "$REG_BODY"
  exit 21
fi

echo "Ro'yxatdan o'tdi: participantId=$PARTICIPANT_ID id=$REG_ID"

echo "[6/8] Deadline qaytarilmoqda..."
restore_deadline
compose up -d app worker
ENV_TOUCHED="0"
RESTORED="1"
trap - EXIT INT TERM

echo "[7/8] Audit tekshiruv..."
AUDIT_ROW="$(
  compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atqc \
    "SELECT id, COALESCE(\"participantId\", ''), yonalish, \"yoshGuruhi\", \"smsStatus\" FROM \"Royxat\" WHERE telefon = '$PHONE' AND \"deletedAt\" IS NULL ORDER BY \"createdAt\" DESC LIMIT 1;"
)"
AUDIT_COUNT="$(
  compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atqc \
    "SELECT COUNT(*) FROM \"Royxat\" WHERE telefon = '$PHONE' AND \"deletedAt\" IS NULL;"
)"

if [ "$AUDIT_COUNT" != "1" ]; then
  echo "XATO: audit count 1 emas. count=$AUDIT_COUNT"
  exit 30
fi

echo "Audit (id|participantId|yonalish|yoshGuruhi|smsStatus): $AUDIT_ROW"

echo "[8/8] Health checks..."
compose exec -T app node -e '
Promise.all([
  fetch("http://127.0.0.1:3000/api/healthz"),
  fetch("http://127.0.0.1:3000/api/readyz"),
]).then(async ([h, r]) => {
  console.log("healthz=" + h.status);
  console.log("readyz=" + r.status);
  if (h.status !== 200 || r.status !== 200) process.exit(2);
}).catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
'

echo "Yakunlandi."
echo "participantId=$PARTICIPANT_ID"
echo "registrationId=$REG_ID"
