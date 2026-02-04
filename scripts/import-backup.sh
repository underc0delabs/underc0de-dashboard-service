#!/bin/bash
set -e

BACKUP_FILE="$1"
if [ -z "$BACKUP_FILE" ]; then
    echo "Error: Debes proporcionar la ruta al archivo de backup"
    echo "Uso: ./scripts/import-backup.sh <ruta-al-backup>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: El archivo no existe: $BACKUP_FILE"
    exit 1
fi

# Cargar variables de entorno
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-underc0de_dashboard}"
DB_USERNAME="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"

echo "Configuración:"
echo "  Host: $DB_HOST"
echo "  Puerto: $DB_PORT"
echo "  Base de datos: $DB_NAME"
echo "  Usuario: $DB_USERNAME"
echo "  Archivo: $BACKUP_FILE"
echo ""

if [ -n "$DB_PASSWORD" ]; then
    export PGPASSWORD="$DB_PASSWORD"
fi

echo "⚠ ADVERTENCIA: Esto sobrescribirá los datos existentes"
read -p "¿Continuar? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Cancelado"
    exit 0
fi

echo "Creando base de datos si no existe..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d postgres -c "CREATE DATABASE \"$DB_NAME\";" 2>/dev/null || true

echo "Importando backup..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -f "$BACKUP_FILE"

echo "✓ Backup importado exitosamente"
unset PGPASSWORD
