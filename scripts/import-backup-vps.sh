#!/bin/bash
set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}Error: Debes proporcionar la ruta al archivo de backup${NC}"
    echo "Uso: ./scripts/import-backup-vps.sh <ruta-al-backup>"
    exit 1
fi

BACKUP_FILE="$1"
if [[ ! "$BACKUP_FILE" = /* ]]; then
    BACKUP_FILE="$(pwd)/$BACKUP_FILE"
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: El archivo no existe: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Importador de Backup - Underc0de Dashboard${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-underc0de_dashboard}"
DB_USERNAME="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"

echo -e "${YELLOW}Configuración:${NC}"
echo "  Host: $DB_HOST"
echo "  Puerto: $DB_PORT"
echo "  Base de datos: $DB_NAME"
echo "  Usuario: $DB_USERNAME"
echo "  Archivo: $BACKUP_FILE"
echo ""

if [ -n "$DB_PASSWORD" ]; then
    export PGPASSWORD="$DB_PASSWORD"
fi

if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}Error: No se pudo conectar a PostgreSQL${NC}"
    exit 1
fi

echo -e "${RED}⚠️  ADVERTENCIA: Esto sobrescribirá todos los datos${NC}"
read -p "Escribe 'SI' para confirmar: " -r
if [[ ! $REPLY =~ ^[Ss][Ii]$ ]]; then
    echo "Cancelado"
    exit 0
fi

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d postgres -c "CREATE DATABASE \"$DB_NAME\";" 2>/dev/null || true

echo "Importando..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -f "$BACKUP_FILE" > /dev/null 2>&1

if [ "$?" -eq 0 ] && [ -d "migrations" ]; then
    TEMP_SQL=$(mktemp)
    for file in migrations/*.cjs; do
        [ -f "$file" ] && echo "INSERT INTO \"SequelizeMeta\" (name) VALUES ('$(basename "$file" .cjs)') ON CONFLICT DO NOTHING;" >> "$TEMP_SQL"
    done
    [ -f "$TEMP_SQL" ] && psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -f "$TEMP_SQL" > /dev/null 2>&1
    rm -f "$TEMP_SQL"
fi

echo -e "${GREEN}✅ Backup importado exitosamente${NC}"
unset PGPASSWORD
