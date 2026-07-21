import dotenv from 'dotenv';
import path from 'path';

import { parsePartnerApiKeyTableFromEnv } from './helpers/partnerIntegrationAuth.js';

// Cargar .env.local en desarrollo, .env en producción
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
const result = dotenv.config({ path: path.resolve(process.cwd(), envFile), override: true });

if (result.error) {
    dotenv.config({ override: true });
}

const configs = {
    api: {
        port: process.env.PORT,
        uri: process.env.URI,
        default_page_count: process.env.DEFAULT_PAGE_COUNT,
        prefix: process.env.API_PREFIX || "/api/v1",
    },
    db: {
        database: process.env.DB_NAME,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST || 'localhost',
        url: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT,
    },
    secret_key: process.env.SECRETPRIVATEKEY,
    google_client_id: process.env.GOOGLE_CLIENT_ID?.trim() || null,
    app_auth_secret: process.env.APP_AUTH_SECRET?.trim() || null,
    forum_jwt_secret: process.env.FORUM_JWT_SECRET || process.env.SMF_JWT_SECRET,
    forum_api_url: process.env.FORUM_API_URL || 'https://underc0de.org/foro/extern/api.php',
    access_token_expires_seconds: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) || 900,
    refresh_token_expires_days: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7,
    env: process.env.NODE_ENV || 'development',
    /** Integración servidor L2 Memories ↔ foro (rutas /integrations/l2 cuando está habilitada). */
    l2_partner_integration_enabled:
        process.env.L2_PARTNER_INTEGRATION_ENABLED !== 'false' &&
        process.env.L2_PARTNER_INTEGRATION_ENABLED !== '0',
    l2_partner_integration_secret:
        process.env.L2_PARTNER_INTEGRATION_SECRET?.trim() || null,
    /** Acción opcional api.php ej. usernameExists — si falta, forumMemberExists será null */
    forum_api_username_lookup_action:
        process.env.FORUM_API_USERNAME_LOOKUP_ACTION?.trim() || null,

    /**
     * API keys por proyecto consumidor (JSON). Ej: {"l2memories":"uuid-secreto"}
     * Si está vacío, modo legacy con solo `l2_partner_integration_secret`.
     */
    partner_api_keys_json:
        parsePartnerApiKeyTableFromEnv(process.env.L2_PARTNER_API_KEYS),
}

export default configs
