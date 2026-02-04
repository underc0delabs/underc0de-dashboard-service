# 🔧 Solucionar Error de Conexión a Base de Datos

## Error: "la autentificación password falló para el usuario «root»"

Este error indica que la aplicación está intentando conectarse a PostgreSQL con credenciales incorrectas.

## ✅ Solución

### Paso 1: Ver qué AdminUser existe

```bash
./scripts/ver-admin-user.sh
```

Esto te mostrará el email y contraseña del AdminUser que puedes usar para hacer login.

---

### Paso 2: Verificar el problema de conexión

```bash
./scripts/debug-db-connection.sh
```

Esto te mostrará:
- Las variables DB_* en el .env
- Las variables DB_* que PM2 está usando
- Los logs de error de PM2

---

### Paso 3: Actualizar PM2 para que cargue el .env

El problema es que PM2 no está cargando el archivo `.env` automáticamente. Ya actualicé el `ecosystem.config.js` para que cargue las variables.

**En la VPS, ejecuta:**

```bash
cd ~/underc0de-dashboard-service

# Verificar que el .env tiene las credenciales correctas
cat .env | grep DB_

# Reiniciar PM2 con la nueva configuración
pm2 restart underc0de-dashboard-service --update-env

# O si no está corriendo:
pm2 start ecosystem.config.js --env production

# Ver los logs para verificar que funciona
pm2 logs underc0de-dashboard-service --lines 50
```

---

### Paso 4: Verificar que funciona

Después de reiniciar, verifica los logs:

```bash
pm2 logs underc0de-dashboard-service --lines 20
```

No deberías ver errores de conexión a la base de datos.

---

## 🔍 Diagnóstico Manual

Si el problema persiste, verifica manualmente:

### 1. Verificar el .env en la VPS

```bash
ssh -p 5929 usuario@tu-vps-ip
cd ~/underc0de-dashboard-service
cat .env | grep DB_
```

Deberías ver algo como:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=underc0deDashboard
DB_USERNAME=postgres
DB_PASSWORD=tu_password_real
```

### 2. Verificar que PM2 está usando las variables correctas

```bash
pm2 env 0 | grep DB_
```

Esto muestra las variables de entorno que PM2 está usando para el proceso.

### 3. Probar conexión manualmente

```bash
export $(cat .env | grep DB_ | xargs)
export PGPASSWORD="$DB_PASSWORD"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -c "SELECT 1;"
```

Si esto funciona, el problema es que PM2 no está cargando el .env.

---

## 💡 Solución Alternativa: Usar dotenv en el código

Si el problema persiste, también puedes asegurarte de que el código carga el .env correctamente. Ya está configurado en `src/configs.ts` con `dotenv.config()`, pero puedes verificar que se está ejecutando antes de crear la conexión.

---

## 📋 Checklist

- [ ] El `.env` tiene las credenciales correctas (DB_USERNAME=postgres, no root)
- [ ] El `ecosystem.config.js` está actualizado (ya lo hice)
- [ ] PM2 se reinició con `--update-env`
- [ ] Los logs de PM2 no muestran errores de conexión
- [ ] La aplicación responde en el endpoint `/health`

---

## 🆘 Si Aún No Funciona

1. **Ver logs completos:**
   ```bash
   pm2 logs underc0de-dashboard-service --lines 100
   ```

2. **Reiniciar completamente PM2:**
   ```bash
   pm2 delete underc0de-dashboard-service
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```

3. **Verificar que el .env está en la ubicación correcta:**
   ```bash
   ls -la ~/underc0de-dashboard-service/.env
   ```

4. **Probar ejecutar la app directamente (sin PM2):**
   ```bash
   cd ~/underc0de-dashboard-service
   export $(cat .env | xargs)
   node build/index.js
   ```
   
   Si funciona así, el problema es definitivamente con PM2 y las variables de entorno.
