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
DB_PORT=5432
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
- **Puerto**: `5432`

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

### Inicializar migraciones

```bash
npm run migrate:init
```

### Crear una nueva migración

```bash
npm run migrate:create
```

### Ejecutar migraciones

```bash
npm run migrate:up
```

### Ver estado de migraciones

```bash
npm run migrate:status
```

### Revertir última migración

```bash
npm run migrate:down_last
```

### Revertir todas las migraciones

```bash
npm run migrate:down_all
```

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

