#!/bin/bash

# Script de deploy para VPS DonWeb
# Este script se ejecuta manualmente en la VPS o puede ser llamado por GitHub Actions

set -e

echo "🚀 Iniciando deploy..."

# Variables (ajustar según tu configuración)
APP_NAME="underc0de-dashboard-service"
APP_PATH="/var/www/underc0de-dashboard-service"
BRANCH="main"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Actualizando código desde GitHub...${NC}"
cd $APP_PATH
git fetch origin
git reset --hard origin/$BRANCH

echo -e "${YELLOW}📥 Instalando dependencias...${NC}"
npm ci --production

echo -e "${YELLOW}🔨 Compilando proyecto...${NC}"
npm run build

echo -e "${YELLOW}🗄️ Ejecutando migraciones...${NC}"
npm run migrate:up || echo "⚠️ Migraciones fallaron o no hay nuevas migraciones"

echo -e "${YELLOW}🔄 Reiniciando aplicación con PM2...${NC}"
if pm2 list | grep -q "$APP_NAME"; then
    pm2 restart $APP_NAME
else
    pm2 start build/index.js --name $APP_NAME
fi

pm2 save

echo -e "${GREEN}✅ Deploy completado exitosamente!${NC}"
pm2 status
