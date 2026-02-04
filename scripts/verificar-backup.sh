#!/bin/bash
set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

MODE="${1:-local}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Verificar Backup - Underc0de Dashboard${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if [ "$MODE" = "remote" ]; then
    echo -e "${YELLOW}Datos de conexión:${NC}"
    read -p "IP: " VPS_HOST
    read -p "Usuario: " VPS_USER
    read -p "Puerto [5929]: " VPS_PORT
    VPS_PORT=${VPS_PORT:-5929}
    ssh -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" bash << 'REMOTE'
cd /var/www/underc0de-dashboard-service 2>/dev/null || cd ~/underc0de-dashboard-service 2>/dev/null || exit 1
[ -f .env ] && export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-underc0de_dashboard}"
DB_USERNAME="${DB_USERNAME:-postgres}"
[ -n "$DB_PASSWORD" ] && export PGPASSWORD="$DB_PASSWORD"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -c "\dt" 2>/dev/null
echo ""
echo "Registros:"
for t in Users AdminUsers Merchants Payments SubscriptionPlans PushNotifications; do
    c=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"$t\";" 2>/dev/null | tr -d ' ')
    echo "  $t: $c"
done
m=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"SequelizeMeta\";" 2>/dev/null | tr -d ' ')
echo "Migraciones: $m"
unset PGPASSWORD
REMOTE
else
    [ -f .env ] && export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-5432}"
    DB_NAME="${DB_NAME:-underc0de_dashboard}"
    DB_USERNAME="${DB_USERNAME:-postgres}"
    [ -n "$DB_PASSWORD" ] && export PGPASSWORD="$DB_PASSWORD"
    echo "Base de datos: $DB_NAME"
    echo ""
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -c "\dt" 2>/dev/null
    echo ""
    echo "Registros:"
    for t in Users AdminUsers Merchants Payments SubscriptionPlans PushNotifications; do
        c=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"$t\";" 2>/dev/null | tr -d ' ')
        echo "  $t: $c"
    done
    m=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"SequelizeMeta\";" 2>/dev/null | tr -d ' ')
    echo "Migraciones: $m"
    unset PGPASSWORD
fi
