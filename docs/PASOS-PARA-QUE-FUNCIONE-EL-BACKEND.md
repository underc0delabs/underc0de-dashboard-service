# Qué hacer para que el backend funcione desde el frontend

Tu frontend está en **HTTPS** (ej. `https://underc0de.net`).  
Si el frontend intenta llamar al backend con **HTTP** (ej. `http://IP:3002`), el navegador **bloquea** esa llamada y por eso “no funciona”.

---

## ¿Subdominio (api.underc0de.net) o mismo dominio?

- **`api.underc0de.net`** es un **subdominio** de `underc0de.net`. Si ya tenés el dominio `underc0de.net`, **no tenés que comprar nada**: en el panel donde gestionás el DNS (DonWeb, Cloudflare, etc.) agregás un registro **A** para `api` apuntando a la IP del VPS (`200.58.99.165`). Eso es gratis.
- Si **no querés usar subdominio**, podés exponer el API **en el mismo dominio** del frontend con una ruta, por ejemplo `https://underc0de.net/api/v1/...` (ver **Opción B** más abajo).

---

## Opción A: Subdominio (api.underc0de.net) — no hace falta comprar otro dominio

Así el frontend llama a `https://api.underc0de.net/api/v1/...`. Solo necesitás un registro DNS para el subdominio.

### Qué necesitás

1. Tener el dominio **underc0de.net** (o el que uses).
2. En el DNS del dominio, crear un registro **A**: nombre `api`, valor `200.58.99.165` (IP del VPS). Con eso `api.underc0de.net` apunta al VPS.

### Pasos en el VPS (DonWeb / CentOS 7)

**Paso 1 – Instalar Nginx y Certbot**

```bash
yum install -y nginx
# Certbot para CentOS 7 (o el que use tu distro)
yum install -y certbot python2-certbot-nginx
```

**Paso 2 – Crear la configuración de Nginx**

Crear archivo (por ejemplo):

```bash
nano /etc/nginx/conf.d/api.conf
```

Pegar esto (cambiá `api.underc0de.net` por tu dominio del API):

```nginx
server {
    listen 80;
    server_name api.underc0de.net;
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Guardar y salir (Ctrl+O, Enter, Ctrl+X).

**Paso 3 – Probar Nginx y arrancarlo**

```bash
nginx -t
systemctl enable nginx
systemctl start nginx
```

**Paso 4 – Obtener certificado HTTPS (Let's Encrypt)**

```bash
certbot --nginx -d api.underc0de.net
```

Seguir las preguntas (email, aceptar términos). Certbot va a modificar la config de Nginx para usar HTTPS.

**Paso 5 – Abrir el puerto 80 y 443 en el firewall**

```bash
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

**Paso 6 – Configurar el frontend**

En el proyecto del **frontend**, donde se define la URL del API, poner:

- `https://api.underc0de.net`  
  (no `http://IP:3002`).

**Paso 7 – CORS en el backend**

En el **.env del backend** en el VPS (o en el secret ENV_FILE de GitHub), agregar:

```env
CORS_ORIGIN=https://underc0de.net,https://www.underc0de.net
```

(Reemplazá por los dominios reales de tu frontend.)  
Luego reiniciar el backend:

```bash
pm2 restart underc0de-dashboard-service --update-env
```

---

## Opción B: Mismo dominio con ruta /api (sin subdominio)

Así el frontend llama a `https://underc0de.net/api/v1/...`. **No hace falta subdominio ni comprar nada**: usás el mismo dominio que el frontend.

**Cuándo sirve:** Cuando el dominio del frontend (ej. `underc0de.net`) apunta a **este mismo VPS** y Nginx sirve tanto el frontend como el API. Si el frontend está en otro lugar (Vercel, Netlify, etc.), normalmente es más simple usar la Opción A (subdominio).

### Pasos en el VPS

1. **Instalar Nginx y Certbot** (si no los tenés), igual que en Opción A.

2. **Crear o editar la config de Nginx** para `underc0de.net` (el mismo que usa tu frontend). Por ejemplo:

   ```bash
   nano /etc/nginx/conf.d/underc0de.conf
   ```

   Contenido (reemplazá `underc0de.net` por tu dominio):

   ```nginx
   server {
       listen 80;
       server_name underc0de.net www.underc0de.net;
       # Ruta /api -> backend en el puerto 3002
       location /api/ {
           proxy_pass http://127.0.0.1:3002/api/;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       # El resto (/) puede ser tu frontend (static o proxy)
       location / {
           root /var/www/underc0de;   # o proxy_pass a donde esté el frontend
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **Probar y reiniciar Nginx:** `nginx -t && systemctl reload nginx`

4. **Certificado HTTPS** (si aún no tenés): `certbot --nginx -d underc0de.net -d www.underc0de.net`

5. **En el frontend**, la URL base del API es el mismo dominio:
   - `VITE_API_BASE_URL=https://underc0de.net`
   - Las llamadas quedan: `https://underc0de.net/api/v1/admin-users/login`, etc.

6. **CORS:** Como el API está en el mismo dominio, no hace falta configurar CORS.

---

## Opción C: Probar solo desde el servidor (para ver si el backend responde)

Entrá por SSH al VPS y ejecutá:

```bash
curl http://localhost:3002/health
```

- Si responde `ok`, el backend está bien; el problema es que el frontend no puede llamarlo por HTTP desde HTTPS (hay que usar Opción A o B).
- Si no responde, revisá que PM2 esté corriendo: `pm2 status` y `pm2 logs underc0de-dashboard-service`.

---

## Resumen

| Qué querés | Qué hacer |
|------------|-----------|
| Que el frontend (HTTPS) llame al backend | Poner Nginx con HTTPS delante del backend (Opción A o B). |
| Ver si el backend responde | En el VPS: `curl http://localhost:3002/health` (Opción C). |
| URL que debe usar el frontend | Opción A: `https://api.underc0de.net`. Opción B: `https://underc0de.net`. |

Si me decís en qué paso estás (DNS, Nginx, Certbot, frontend, etc.), te digo el siguiente paso exacto.
