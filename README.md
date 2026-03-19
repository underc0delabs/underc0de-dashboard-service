# Underc0de Dashboard Service

Servicio backend para el dashboard de Underc0de.

## Requisitos Previos

- Node.js (v18 o superior)
- Docker y Docker Compose
- npm o yarn

## Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Server Configuration
PORT=3002
URI=http://localhost:3002
NODE_ENV=development
API_PREFIX=/api/v1
DEFAULT_PAGE_COUNT=10

# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=underc0deDashboard
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Security
SECRETPRIVATEKEY=your-secret-key-here-change-in-production
```

### 2. Instalar Dependencias

```bash
npm install
```

## Base de Datos con Docker

### Levantar PostgreSQL

Para iniciar la base de datos PostgreSQL usando Docker Compose:

```bash
npm run docker:up
```

Este comando levantará un contenedor de PostgreSQL con:
- **Usuario**: `postgres`
- **Contraseña**: `postgres`
- **Base de datos**: `underc0deDashboard`
- **Puerto**: `5433` (mapeado desde el puerto interno 5432 del contenedor)

### Otros comandos útiles de Docker

```bash
# Ver logs de la base de datos
npm run docker:logs

# Detener la base de datos
npm run docker:down

# Reiniciar la base de datos
npm run docker:restart
```

### Verificar que la base de datos está corriendo

```bash
docker ps
```

Deberías ver el contenedor `underc0de-postgresql` en ejecución.

## Ejecutar la Aplicación

### Modo Desarrollo

```bash
npm run dev
```

La aplicación se ejecutará en `http://localhost:3002` (o el puerto configurado en `.env`).

## Migraciones

### Ejecutar migraciones

```bash
npm run migrate:up
```

Este comando ejecutará todas las migraciones pendientes y creará las tablas en la base de datos.

### Crear una nueva migración

```bash
npm run migrate:create nombre-de-la-migracion
```

### Ver estado de migraciones

```bash
npm run migrate:status
```

### Revertir última migración

```bash
npm run migrate:down
```

### Revertir todas las migraciones

```bash
npm run migrate:down_all
```

## Seeds (Datos Iniciales)

### Ejecutar todos los seeds

```bash
npm run seed:up
```

Este comando ejecutará todos los seeds y creará datos iniciales (como el usuario administrador por defecto).

### Crear un nuevo seed

```bash
npm run seed:create nombre-del-seed
```

### Revertir último seed

```bash
npm run seed:down
```

### Revertir todos los seeds

```bash
npm run seed:down_all
```

### Usuario Administrador por Defecto

Después de ejecutar los seeds, tendrás un usuario administrador con las siguientes credenciales:
- **Email**: `admin@underc0de.com`
- **Password**: `admin123`

**⚠️ IMPORTANTE**: Cambia estas credenciales en producción.

## Estructura del Proyecto

```
src/
├── configs.ts              # Configuración de la aplicación
├── index.ts                # Punto de entrada
├── server/
│   ├── DbConnection.ts     # Conexión a la base de datos
│   ├── ServerInitializer.ts
│   └── RoutesReducer.ts
├── modules/                # Módulos de la aplicación
│   ├── users/             # Módulo de usuarios
│   └── adminUsers/        # Módulo de administradores
└── middlewares/           # Middlewares de Express
```

## Suscripción Pro (MercadoPago)

### Variables de entorno requeridas

- **MP_ACCESS_TOKEN**: Token de acceso de MercadoPago (producción o sandbox)
- **MP_BACK_URL**: URL donde MP redirige al usuario tras el pago (ej. `https://underc0de.net/success`). La app móvil detecta esta redirección en el WebView.
- **MP_WEBHOOK_URL**: URL pública donde MercadoPago notifica pagos en tiempo real. Debe ser `https://<tu-dominio>/api/v1/webhook/mercadopago`. Configurala también en el panel de MercadoPago.
- **MERCADO_PAGO_COLLECTOR_EMAIL**: Email del vendedor (usuarios con este email reciben Pro sin pagar)
- **MERCADO_PAGO_PRICE**: Precio de la suscripción (o configurar en Environments)

### Flujo de activación Pro

1. **Creación**: La app llama `POST /subscriptions/create` → backend crea preapproval en MP y devuelve `init_point`.
2. **Pago**: Usuario paga en checkout MP (WebView). MP redirige a `MP_BACK_URL`.
3. **Activación en tiempo real**: MP envía POST a `MP_WEBHOOK_URL` → backend actualiza suscripción y marca usuario como Pro.
4. **Marcado como Pro**: Cuando el usuario completa el pago, MercadoPago envía un webhook al backend. El backend actualiza `User.is_pro` inmediatamente. No se requiere el cron para el flujo normal.

5. **Fallback**: Un cron diario (3:00 AM) ejecuta `SyncMercadoPagoSubscriptionsAction` por si el webhook falla o no llega.

## Solución de Problemas

### Error: "Please install pg package manually"

Si ves este error, asegúrate de haber instalado las dependencias:

```bash
npm install
```

### Error de conexión a la base de datos

1. Verifica que el contenedor de PostgreSQL esté corriendo:
   ```bash
   docker ps
   ```

2. Verifica las variables de entorno en tu archivo `.env`

3. Verifica los logs de Docker:
   ```bash
   npm run docker:logs
   ```

### Limpiar y reiniciar la base de datos

Si necesitas empezar desde cero:

```bash
# Detener y eliminar contenedores y volúmenes
docker-compose down -v

# Levantar nuevamente
npm run docker:up
```

## Licencia

ISC

