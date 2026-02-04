#!/bin/bash
set -e
VPS_HOST="200.58.99.165"
VPS_USER="root"
VPS_PORT="5929"
echo "🚀 Iniciando deploy del backend en VPS..."
ssh -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" bash << 'DEPLOY'
set -e
cd ~/underc0de-dashboard-service
echo "📦 Actualizando código..."
git pull origin main
echo "📥 Instalando dependencias..."
npm install
echo "🔨 Compilando..."
npm run build
echo "🔄 Reiniciando PM2..."
if pm2 list | grep -q underc0de-dashboard-service; then
    pm2 restart underc0de-dashboard-service --update-env
else
    pm2 start ecosystem.config.js --env production
fi
pm2 save
echo ""
pm2 status
echo ""
pm2 logs underc0de-dashboard-service --lines 20 --nostream
echo ""
echo "✅ Deploy completado!"
DEPLOY
