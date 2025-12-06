import configs from "../configs";
import { Sequelize } from "sequelize";

const getSSLConfig = () => {
  if (process.env.DB_SSL === 'false' || process.env.DB_SSL === '0') {
    return { ssl: false };
  }
  
  const host = configs.db.host || '';
  if (host === 'db' || host === 'localhost' || host === '127.0.0.1') {
    return { ssl: false };
  }
  
  const isProduction = configs.env === 'production';
  const isStaging = process.env.NODE_ENV === 'staging';
  
  if (isProduction || isStaging) {
    return {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    };
  }
  
  return {
    ssl: false
  };
};

export const sequelize = new Sequelize(
  configs.db.database || "",
  configs.db.username || "",
  configs.db.password,
  {
    host: configs.db.host,
    logging: configs.env === 'development' ? (msg) => console.log(msg) : false,
    dialect: "postgres",
    port: configs.db.port ? parseInt(configs.db.port) : 5432,
    dialectOptions: getSSLConfig(),
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000
    }
  }
);

const ConnectToDatabase = () => {
  console.log("Attempting to connect to database with config:", {
    host: configs.db.host,
    port: configs.db.port,
    database: configs.db.database,
    username: configs.db.username,
    env: configs.env,
    ssl: getSSLConfig()
  });

  sequelize
    .authenticate()
    .then(() => {
      console.info("✅ Database connection has been established successfully!");
      console.log("Connected to:", {
        host: configs.db.host,
        database: configs.db.database,
        ssl: getSSLConfig().ssl ? 'enabled' : 'disabled'
      });
    })
    .catch((err) => {
      console.error("❌ Unable to connect to the database:");
      console.error("Error details:", err.message);
      if (err.original) {
        console.error("Original error:", err.original.message);
      }
    });
};

export default ConnectToDatabase;
