#!/usr/bin/env bash
# Smoke test contra la API corriendo en local (username-status + link-status).
# No prueba finalize (hace falta un forumJwt real).
#
# Uso:
#   export L2MEMORIES_PARTNER_API_SECRET='mismo valor que en L2_PARTNER_API_KEYS para l2memories'
#   export BASE='http://127.0.0.1:8080/api/v1'   # opcional
#   bash scripts/smoke-partner-l2-local.sh
#
set -euo pipefail

BASE="${BASE:-http://127.0.0.1:8080/api/v1}"
SECRET="${L2MEMORIES_PARTNER_API_SECRET:-}"
if [[ -z "$SECRET" ]]; then
  echo "Definí L2MEMORIES_PARTNER_API_SECRET (debe coincidir con la entrada l2memories en L2_PARTNER_API_KEYS)." >&2
  exit 1
fi

L2ID="${L2_TEST_ACCOUNT_ID:-smoke-local-l2-user}"
QUERY_USER="${PARTNER_L2_TEST_USERNAME:-testuser}"

echo "== Health (sin auth partner) =="
curl -sS -o /dev/null -w "%{http_code}\n" "${BASE%/api/v1}/health" || true
echo ""

echo "== GET …/forum/username-status?memberName=${QUERY_USER} =="
curl -sS \
  -H "Authorization: Bearer ${SECRET}" \
  -H "X-Partner-Client-Id: l2memories" \
  "${BASE}/integrations/l2/forum/username-status?memberName=${QUERY_USER}"
echo -e "\n"

echo "== GET …/forum/link-status/${L2ID} =="
curl -sS \
  -H "Authorization: Bearer ${SECRET}" \
  -H "X-Partner-Client-Id: l2memories" \
  "${BASE}/integrations/l2/forum/link-status/${L2ID}"
echo -e "\n"

echo "Listo. Si ves 401, revisá el Bearer y X-Partner-Client-Id; si ves 503, L2_PART_* o integración apagada."
