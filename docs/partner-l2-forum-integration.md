# Integración L2 Memories ↔ foro Underc0de

Rutas servidas por `underc0de-dashboard-service` bajo el prefijo configurado (`/api/v1`). El **backend L2 Memories** debe llamarlas **servidor a servidor** (nunca exponer la clave en apps móviles).

## Prerrequisitos

1. Migración `20260427120000-create-l2-partner-forum-links.cjs`: tabla `L2PartnerForumLinks`.
2. Variables de entorno (habilitación y clave compartida).
3. (Recomendado) Acción nueva en **api.php del foro** (`FORUM_API_USERNAME_LOOKUP_ACTION`) que responda JSON interpretable como “usuario existe sí/no”. Si falta: `forumMemberExists` será `null` y la consulta igual devuelve `existsAsUnderc0deAppUser` (usuarios dados de alta en la app Underc0de Mongo con ese nombre).

## Contrato HTTP

### Autenticación (recomendado: API key por proyecto)

En el servidor Underc0de define un mapa JSON (una clave secreta por integración):

```env
L2_PARTNER_API_KEYS={"l2memories":"<secreto-largo-compartido-solo servidor-a-servidor>"}
```

Cada llamada desde **l2memories** debe incluir:

| Header | Valor |
|--------|--------|
| `Authorization` | `Bearer <secreto de l2memories>` |
| `X-Partner-Client-Id` | `l2memories` |

Podés registrar más proyectos en el mismo JSON con otra entrada.

**Modo legacy** (solo un secreto, sin tabla): omití `L2_PARTNER_API_KEYS` y configurá sólo `L2_PARTNER_INTEGRATION_SECRET`, enviable como `Authorization: Bearer …` **o** `x-partner-integration-key`.

Jamás pongas estos valores en frontend público ni en el navegador del jugador.

### `GET …/integrations/l2/forum/username-status`

| Query          | Obligatorio |
|----------------|------------|
| `memberName`, `q` o `username` | uno de ellos |

**Respuesta 200 (`result`):**

```json
{
  "queriedUsername": "…",
  "existsAsUnderc0deAppUser": true,
  "forumMemberExists": null,
  "forumLookup": "not_configured",
  "forumLookupTransportOk": true
}
```

- `forumMemberExists`: `true`/`false` si la acción opcional respondió inequívocamente; `null` si no hay acción configurada o la respuesta no se pudo interpretar.

### `POST …/integrations/l2/forum/finalize`

**Body JSON:**

```json
{
  "l2AccountId": "<id estable del usuario en L2>",
  "forumJwt": "<token Bearer devuelto por login foro (misma forma que usa userData>"
}
```

**Comportamiento:** Llama internamente `action=userData` con ese JWT para obtener `id_member` y datos del foro; persiste vínculo en `L2PartnerForumLinks`; **409** si ese foro está asociado a otro `l2AccountId` o si ese L2 ya está asociado a otro miembro del foro.

### `GET …/integrations/l2/forum/link-status/:l2AccountId`

Devuelve `linked: false` o `linked: true` con datos de fila (**no** incluye secretos).

## Códigos de error típicos

| Código | Caso                                              |
|--------|---------------------------------------------------|
| 401    | Clave partner incorrecta                           |
| 409    | Conflicto de vínculo foro ↔ L2                    |
| 429    | Rate limit middleware / foro sobrecargado        |
| 503    | Integración deshabilitada o sin `SECRET`          |

### cURL ejemplo (lookup)

```bash
# Con API key por proyecto:
curl -sS \
  -H "Authorization: Bearer $L2MEMORIES_PARTNER_API_SECRET" \
  -H "X-Partner-Client-Id: l2memories" \
  "$BASE/api/v1/integrations/l2/forum/username-status?memberName=testuser"
```

### Prueba de identidad (decisión técnica)

- **JWT session foro:** el cliente envía el token en `forumJwt`; el servicio usa `GET api.php?action=userData` como en `GetJwtValidator` → `tryForumTokenViaApi`.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `L2_PARTNER_INTEGRATION_ENABLED` | Por defecto encendido; `false` o `0` desactiva rutas (router vacío). |
| `L2_PARTNER_API_KEYS` | JSON `{"clientId":"secreto"}` opcional; si existe, uso recomendado y exige `X-Partner-Client-Id`. |
| `L2_PARTNER_INTEGRATION_SECRET` | Secreto único legacy si **no** definís `L2_PARTNER_API_KEYS`; también 503 si faltan ambos. |
| `FORUM_API_USERNAME_LOOKUP_ACTION` | Nombre de acción en `FORUM_API_URL` (opcional). |
| `FORUM_API_SERVER_KEY` | Cabecera `X-Api-Key` opcional si el foro la exige. |

## Prueba local (antes de deploy)

1. **PostgreSQL** (ej. `docker compose up -d` en este repo; puerto host **5433** por defecto en `sequelize.config.cjs`).
2. **`.env.local`** (carga `npm run dev` vía nodemon): misma idea que `.env` — al menos `DB_*`, `SECRETPRIVATEKEY`, y **`L2_PARTNER_API_KEYS`** con una clave de prueba para `l2memories`.
3. **Migraciones:** `npm run migrate:up` (incluye tabla `L2PartnerForumLinks`).
4. **Arranque:** `npm run dev` (servidor TS con `tsx`; `GET /health` en la raíz del host, sin el prefijo `/api/v1`).
5. **Smoke HTTP** (lookup + link-status; no usa `finalize` sin JWT real del foro):

   ```bash
   export L2MEMORIES_PARTNER_API_SECRET='el-mismo-secreto-que-l2memories-en-tu-json'
   export BASE='http://127.0.0.1:8080/api/v1'
   npm run smoke:partner-l2
   ```

   O: `bash scripts/smoke-partner-l2-local.sh`. Opcionales: `L2_TEST_ACCOUNT_ID`, `PARTNER_L2_TEST_USERNAME`.

6. **Tests unitarios** (auth partner + lookup): `npm test`.

## Checklist QA (manual)

1. Lookup con usuario registrado solo en Mongo Underc0de marca `existsAsUnderc0deAppUser`.
2. Finalize repetido con mismo `l2AccountId` + mismo foro → 200 sin filas nuevas contradictorias (idempotencia).
3. Segundo `l2AccountId` con foro ya vinculado → 409.
4. Token expirado foro → mensaje tipo “Token del foro inválido” con 401.
5. Foro offline: lookup con `forumLookup` distinto de `ok` según gateways.
