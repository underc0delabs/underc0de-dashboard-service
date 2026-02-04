# Sistema de Suscripciones con MercadoPago

Este documento explica cómo funciona el sistema de suscripciones recurrentes con MercadoPago.

## 📋 Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env`:

```bash
# MercadoPago Access Token (obtenerlo desde tu cuenta de MP)
MP_ACCESS_TOKEN=tu_access_token_aqui

# URL de retorno después de completar el pago
MP_BACK_URL=https://underc0de.net/success

# URL del webhook para recibir notificaciones de MercadoPago
MP_WEBHOOK_URL=https://api.underc0de.net/api/v1/webhook/mercadopago
```

### Obtener el Access Token de MercadoPago

1. Ingresa a tu cuenta de MercadoPago
2. Ve a **Developers** → **Credenciales**
3. Copia el **Access Token** de producción o testing
4. Agrégalo al `.env` como `MP_ACCESS_TOKEN`

---

## 🚀 Endpoints Disponibles

### 1. Crear Suscripción

Crea una nueva suscripción recurrente para un usuario.

**Endpoint:** `POST /api/v1/subscriptions/create`

**Requiere:** JWT Token de autenticación

**Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

**Respuesta Exitosa (200):**
```json
{
  "status": 200,
  "success": true,
  "msg": "Suscripción creada exitosamente",
  "result": {
    "init_point": "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_id=xxx",
    "preapproval_id": "2c938084726fca480172750000000000",
    "status": "pending"
  }
}
```

**Uso en la App Móvil:**
```javascript
const response = await fetch('https://api.underc0de.net/api/v1/subscriptions/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();

// Abrir el init_point en un navegador o WebView
window.open(data.result.init_point);
```

---

### 2. Webhook de MercadoPago

Recibe notificaciones automáticas de MercadoPago cuando cambia el estado de una suscripción.

**Endpoint:** `POST /api/v1/webhook/mercadopago`

**Público:** No requiere autenticación (MercadoPago lo llama directamente)

**Eventos Manejados:**
- `authorized`: Usuario se suscribió correctamente → `is_pro = true`
- `cancelled`: Usuario canceló la suscripción → `is_pro = false`
- `paused`: Suscripción pausada → `is_pro = false`

---

## 🗄️ Modelo de Base de Datos

### Tabla: `UserSubscriptions`

| Campo            | Tipo   | Descripción                                    |
|------------------|--------|------------------------------------------------|
| id               | UUID   | Identificador único                            |
| userId           | INT    | FK → Users.id                                  |
| mpPreapprovalId  | STRING | ID de preapproval en MercadoPago               |
| status           | ENUM   | pending, authorized, paused, cancelled         |
| createdAt        | DATE   | Fecha de creación                              |
| updatedAt        | DATE   | Fecha de actualización                         |

### Tabla: `Users` (Campo Agregado)

| Campo   | Tipo    | Descripción                          |
|---------|---------|--------------------------------------|
| is_pro  | BOOLEAN | Indica si el usuario tiene PRO activo|

---

## 🔄 Flujo Completo

1. **Usuario solicita suscripción:**
   - App móvil llama a `POST /subscriptions/create`
   - Backend crea preapproval en MercadoPago
   - Backend guarda registro en `UserSubscriptions` con estado `pending`
   - Backend devuelve `init_point` a la app

2. **Usuario completa el pago:**
   - App abre `init_point` en navegador/WebView
   - Usuario ingresa datos de tarjeta en MercadoPago
   - MercadoPago procesa el pago

3. **MercadoPago notifica al backend:**
   - MercadoPago envía evento al webhook
   - Backend consulta estado en API de MercadoPago
   - Backend actualiza `UserSubscription.status`
   - Si `status === 'authorized'` → `User.is_pro = true`

4. **Usuario usa funciones PRO:**
   - App consulta `User.is_pro` para habilitar features

---

## 🧪 Testing Local

### 1. Usar ngrok para exponer el webhook:

```bash
ngrok http 3002
```

Copia la URL HTTPS generada (ej: `https://abc123.ngrok.io`) y actualiza:

```bash
MP_WEBHOOK_URL=https://abc123.ngrok.io/api/v1/webhook/mercadopago
```

### 2. Probar creación de suscripción:

```bash
curl -X POST http://localhost:3002/api/v1/subscriptions/create \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Simular webhook (opcional):

```bash
curl -X POST http://localhost:3002/api/v1/webhook/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "type": "preapproval",
    "data": {
      "id": "PREAPPROVAL_ID_DE_PRUEBA"
    }
  }'
```

---

## 🚨 Troubleshooting

### Error: "MP_ACCESS_TOKEN no definido"
- Verifica que la variable esté en el `.env`
- Reinicia PM2: `pm2 restart underc0de-dashboard-service`

### Error: "El usuario ya tiene una suscripción activa"
- El usuario ya tiene una suscripción `authorized` o `pending`
- Cancela la suscripción actual antes de crear una nueva

### Webhook no se ejecuta:
- Verifica que `MP_WEBHOOK_URL` sea accesible públicamente
- Revisa los logs de MercadoPago en tu panel de desarrolladores
- Asegúrate de que el webhook esté registrado en tu cuenta de MP

---

## 📝 Migraciones

Para aplicar las migraciones en la VPS:

```bash
cd ~/underc0de-dashboard-service
npm run migrate:up
pm2 restart underc0de-dashboard-service
```

Las migraciones crean:
- Campo `is_pro` en tabla `Users`
- Tabla `UserSubscriptions` completa

---

## 💡 Notas Importantes

1. **MercadoPago cobra comisiones:** Asegúrate de configurar el precio considerando las comisiones
2. **Testing vs Producción:** Usa credenciales de testing durante desarrollo
3. **Seguridad:** Nunca expongas `MP_ACCESS_TOKEN` en el frontend
4. **Webhook público:** El endpoint `/webhook/mercadopago` DEBE ser público (sin JWT)
5. **Idempotencia:** MercadoPago puede reenviar el mismo evento múltiples veces
