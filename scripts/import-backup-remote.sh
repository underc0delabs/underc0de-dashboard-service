#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Importar Backup en VPS - Underc0de Dashboard${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

BACKUP_FILE=""
if [ -f ~/Desktop/dump-underc0deDashboard.sql ]; then
    BACKUP_FILE=~/Desktop/dump-underc0deDashboard.sql
elif [ -f ./dump-underc0deDashboard.sql ]; then
    BACKUP_FILE=./dump-underc0deDashboard.sql
elif [ -n "$1" ]; then
    BACKUP_FILE="$1"
else
    echo -e "${RED}No se encontró el archivo de backup${NC}"
    echo "Uso: ./scripts/import-backup-remote.sh [ruta-al-backup]"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: El archivo no existe: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Archivo encontrado: $BACKUP_FILE${NC}"
echo ""

echo -e "${YELLOW}Datos de conexión a tu VPS:${NC}"
read -p "IP o dominio: " VPS_HOST
read -p "Usuario SSH (ej: root): " VPS_USER
read -p "Puerto SSH [5929]: " VPS_PORT
VPS_PORT=${VPS_PORT:-5929}

echo ""
read -p "¿Continuar? (s/N): " -n 1 -r
echo ""
[[ ! $REPLY =~ ^[Ss]$ ]] && exit 0

echo -e "${YELLOW}📤 Transfiriendo archivo...${NC}"
scp -P "$VPS_PORT" "$BACKUP_FILE" "$VPS_USER@$VPS_HOST:/tmp/dump-underc0deDashboard.sql" || exit 1

echo -e "${YELLOW}📥 Importando en la VPS...${NC}"
ssh -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" bash << 'REMOTE'
cd /var/www/underc0de-dashboard-service 2>/dev/null || cd ~/underc0de-dashboard-service 2>/dev/null || { echo "Error: No se encontró el proyecto"; exit 1; }
[ -f .env ] && export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-underc0de_dashboard}"
DB_USERNAME="${DB_USERNAME:-postgres}"
[ -n "$DB_PASSWORD" ] && export PGPASSWORD="$DB_PASSWORD"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d postgres -c "CREATE DATABASE \"$DB_NAME\";" 2>/dev/null || true
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -f /tmp/dump-underc0deDashboard.sql > /dev/null 2>&1
if [ -d migrations ]; then
    TEMP=$(mktemp)
    for f in migrations/*.cjs; do [ -f "$f" ] && echo "INSERT INTO \"SequelizeMeta\" (name) VALUES ('$(basename "$f" .cjs)') ON CONFLICT DO NOTHING;" >> "$TEMP"; done
    [ -f "$TEMP" ] && psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -f "$TEMP" > /dev/null 2>&1
    rm -f "$TEMP"
fi
rm -f /tmp/dump-underc0deDashboard.sql
echo "✅ Completado"
REMOTE

echo ""
echo -e "${GREEN}✅ ¡Backup importado exitosamente!${NC}"
