import { mongoMigrateCli } from 'mongo-migrate-ts';
import configs from '../src/configs';
require('dotenv').config()

mongoMigrateCli({
  uri: configs.migrations.uri,
  database: configs.migrations.db,
  migrationsDir: __dirname,
  migrationsCollection: 'migrations_collection',
});
