#!/bin/bash
# Script para ver qué AdminUser existe en la base de datos

echo "Datos de conexión a tu VPS:"
read -p "IP o dominio: " VPS_HOST
read -p "Usuario SSH: " VPS_USER
read -p "Puerto SSH [5929]: " VPS_PORT
VPS_PORT=${VPS_PORT:-5929}

echo ""
echo "Consultando AdminUsers..."
echo ""

ssh -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" bash << 'REMOTE'
cd /var/www/underc0de-dashboard-service 2>/dev/null || cd ~/underc0de-dashboard-service 2>/dev/null || { echo "Error: No se encontró el proyecto"; exit 1; }

# Cargar variables de entorno
if [ -f .env ]; then
    while IFS= read -r line; do
        if [[ ! "$line" =~ ^# ]] && [[ -n "$line" ]]; then
            export "$line"
        fi
    done < .env
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-underc0de_dashboard}"
DB_USERNAME="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"

[ -n "$DB_PASSWORD" ] && export PGPASSWORD="$DB_PASSWORD"

echo "AdminUsers en la base de datos:"
echo ""
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -c "SELECT id, name, email, rol, status, \"createdAt\" FROM \"AdminUsers\";" 2>/dev/null

unset PGPASSWORD
REMOTE
