#!/bin/bash
# Script para verificar el backup en la VPS usando las credenciales del .env

echo "Datos de conexión a tu VPS:"
read -p "IP o dominio: " VPS_HOST
read -p "Usuario SSH: " VPS_USER
read -p "Puerto SSH [5929]: " VPS_PORT
VPS_PORT=${VPS_PORT:-5929}

echo ""
echo "Verificando backup en la VPS..."
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

if [ -z "$DB_PASSWORD" ]; then
    echo "⚠️  No se encontró DB_PASSWORD en .env"
    echo "Intentando sin contraseña..."
    export PGPASSWORD=""
else
    export PGPASSWORD="$DB_PASSWORD"
fi

echo "Configuración detectada:"
echo "  Host: $DB_HOST"
echo "  Puerto: $DB_PORT"
echo "  Base de datos: $DB_NAME"
echo "  Usuario: $DB_USERNAME"
echo ""

# Verificar conexión
echo "🔍 Verificando conexión..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Conexión exitosa"
    echo ""
    
    echo "📋 Tablas encontradas:"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -c "\dt" 2>/dev/null
    
    echo ""
    echo "📊 Registros por tabla:"
    for table in Users AdminUsers Merchants Payments SubscriptionPlans PushNotifications; do
        count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null | tr -d ' ')
        echo "  - $table: $count registros"
    done
    
    echo ""
    echo "🔧 Migraciones registradas:"
    migration_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"SequelizeMeta\";" 2>/dev/null | tr -d ' ')
    echo "  Total: $migration_count migraciones"
    
else
    echo "❌ Error de conexión"
    echo ""
    echo "Verifica:"
    echo "  1. Que PostgreSQL esté corriendo"
    echo "  2. Las credenciales en tu .env"
    echo ""
    echo "Prueba manualmente:"
    echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres"
fi

unset PGPASSWORD
REMOTE
