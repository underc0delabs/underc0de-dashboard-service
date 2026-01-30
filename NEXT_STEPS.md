# Próximos Pasos después de Configurar GitHub Secrets

## ✅ Checklist Pre-Deploy

Antes de hacer el primer deploy, asegúrate de completar estos pasos en tu VPS:

### 1. Conectarte a tu VPS por SSH
```bash
ssh usuario@tu-vps-ip
# Ejemplo: ssh root@123.45.67.89
```

### 2. Instalar Node.js 20 y PM2
```bash
# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v20.x.x
npm --version

# Instalar PM2 globalmente
sudo npm install -g pm2

# Configurar PM2 para iniciar al arrancar el servidor
pm2 startup
# Copia y ejecuta el comando que te muestra
```

### 3. Clonar el repositorio en la VPS
```bash
# Crear directorio si no existe
sudo mkdir -p /var/www
cd /var/www

# Clonar tu repositorio (reemplaza con tu URL de GitHub)
sudo git clone https://github.com/TU_USUARIO/TU_REPO.git underc0de-dashboard-service

# Dar permisos al usuario actual
sudo chown -R $USER:$USER underc0de-dashboard-service
cd underc0de-dashboard-service

# Si usas SSH para Git (recomendado)
git remote set-url origin git@github.com:TU_USUARIO/TU_REPO.git
```

### 4. Configurar variables de entorno
```bash
cd /var/www/underc0de-dashboard-service

# Crear archivo .env (ajusta según tu configuración)
nano .env
```

**Contenido mínimo del `.env`:**
```env
NODE_ENV=production
PORT=3002
DB_HOST=tu-host-db
DB_PORT=5432
DB_NAME=tu-database
DB_USER=tu-usuario
DB_PASSWORD=tu-password
# ... otras variables que necesites
```

### 5. Instalar dependencias y hacer build inicial
```bash
cd /var/www/underc0de-dashboard-service

# Instalar solo dependencias de producción
npm ci --production

# Compilar TypeScript
npm run build

# Ejecutar migraciones de base de datos (si aplica)
npm run migrate:up || echo "No hay migraciones o falló"
```

### 6. Subir el archivo de credenciales de Firebase (si aplica)
```bash
# Si tu aplicación usa Firebase, sube el archivo JSON
# Puedes usar scp desde tu máquina local:
# scp underc0de-f1e15-39bd5639c220.json usuario@tu-vps:/var/www/underc0de-dashboard-service/
```

### 7. Iniciar la aplicación con PM2
```bash
cd /var/www/underc0de-dashboard-service

# Iniciar con el archivo de configuración
pm2 start ecosystem.config.js --env production

# O manualmente:
# pm2 start build/index.js --name underc0de-dashboard-service --env production

# Guardar la configuración de PM2
pm2 save

# Verificar que esté corriendo
pm2 status
pm2 logs underc0de-dashboard-service
```

---

## 🚀 Hacer el Primer Deploy

Una vez completados los pasos anteriores:

### 1. Verificar que los GitHub Secrets estén configurados
- Ve a tu repositorio en GitHub
- Settings → Secrets and variables → Actions
- Verifica que tengas estos 5 secrets:
  - ✅ `VPS_HOST`
  - ✅ `VPS_USER`
  - ✅ `VPS_SSH_KEY`
  - ✅ `VPS_PORT` (opcional, default 22)
  - ✅ `VPS_APP_PATH`

### 2. Hacer commit y push a la rama main/master
```bash
# En tu máquina local
git add .
git commit -m "Configurar deploy automático"
git push origin main
```

### 3. Monitorear el workflow en GitHub Actions
- Ve a tu repositorio en GitHub
- Click en la pestaña **Actions**
- Deberías ver un workflow ejecutándose llamado "Deploy to DonWeb VPS"
- Click en el workflow para ver los logs en tiempo real

### 4. Verificar el deploy en la VPS
```bash
# Conectarte a la VPS
ssh usuario@tu-vps-ip

# Verificar que PM2 esté corriendo
pm2 status

# Ver logs recientes
pm2 logs underc0de-dashboard-service --lines 50

# Verificar que el código se actualizó
cd /var/www/underc0de-dashboard-service
git log -1  # Debe mostrar tu último commit
```

---

## 🔄 Deploys Futuros

Después del primer deploy, cada vez que hagas `git push` a `main` o `master`:
1. GitHub Actions se ejecutará automáticamente
2. El código se actualizará en la VPS
3. Se reinstalarán dependencias
4. Se recompilará el proyecto
5. Se ejecutarán migraciones (si hay nuevas)
6. PM2 reiniciará la aplicación automáticamente

**No necesitas hacer nada más, todo es automático! 🎉**

---

## 🐛 Troubleshooting

### El workflow falla en GitHub Actions
1. Revisa los logs del workflow en GitHub Actions
2. Verifica que todos los secrets estén correctamente configurados
3. Asegúrate de que la clave SSH tenga acceso a la VPS

### La aplicación no inicia en la VPS
```bash
# Ver logs detallados
pm2 logs underc0de-dashboard-service --lines 100 --err

# Verificar variables de entorno
pm2 env 0  # Reemplaza 0 con el ID de tu proceso

# Reiniciar manualmente
pm2 restart underc0de-dashboard-service
```

### Error de permisos
```bash
# Asegúrate de tener permisos en el directorio
sudo chown -R $USER:$USER /var/www/underc0de-dashboard-service
```

### Error de conexión SSH desde GitHub Actions
- Verifica que la IP de la VPS sea accesible desde internet
- Asegúrate de que el puerto SSH (22) esté abierto en el firewall
- Verifica que la clave SSH privada esté completa en GitHub Secrets (incluye `-----BEGIN` y `-----END`)

---

## 📝 Notas Importantes

- **Primera vez**: Debes hacer la configuración inicial en la VPS manualmente (pasos 1-7)
- **Deploys siguientes**: Son completamente automáticos con GitHub Actions
- **Variables de entorno**: Asegúrate de tener el archivo `.env` configurado en la VPS
- **Firebase**: Si usas Firebase, el archivo JSON debe estar en la VPS
- **Base de datos**: Asegúrate de que la VPS pueda conectarse a tu base de datos
