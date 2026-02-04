#!/bin/bash
# Script para debuggear el problema de conexión a la base de datos

echo "Datos de conexión a tu VPS:"
read -p "IP o dominio: " VPS_HOST
read -p "Usuario SSH: " VPS_USER
read -p "Puerto SSH [5929]: " VPS_PORT
VPS_PORT=${VPS_PORT:-5929}

echo ""
echo "🔍 Verificando configuración..."
echo ""

ssh -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" bash << 'REMOTE'
cd /var/www/underc0de-dashboard-service 2>/dev/null || cd ~/underc0de-dashboard-service 2>/dev/null || { echo "Error: No se encontró el proyecto"; exit 1; }

echo "📄 Contenido del .env (solo DB_*):"
echo "-----------------------------------"
cat .env | grep "^DB_" || echo "No se encontraron variables DB_*"
echo ""

echo "🔧 Variables de entorno actuales (DB_*):"
echo "-----------------------------------"
env | grep "^DB_" || echo "No hay variables DB_* en el entorno"
echo ""

echo "📦 Verificando PM2:"
echo "-----------------------------------"
pm2 list | grep -i underc0de || echo "No se encontró proceso PM2"
echo ""

echo "📋 Últimas líneas de logs de PM2:"
echo "-----------------------------------"
pm2 logs underc0de-dashboard-service --lines 30 --nostream 2>/dev/null | tail -20 || echo "No se pudieron obtener logs"
echo ""

echo "💡 Para ver logs en tiempo real:"
echo "   pm2 logs underc0de-dashboard-service"
echo ""

echo "💡 Para reiniciar la aplicación:"
echo "   pm2 restart underc0de-dashboard-service --update-env"
REMOTE
