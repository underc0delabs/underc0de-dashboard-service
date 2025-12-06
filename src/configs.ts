require('dotenv').config()

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
    env: process.env.NODE_ENV || 'development',
}

export default configs