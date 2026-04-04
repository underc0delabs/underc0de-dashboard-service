'use strict';

/**
 * Utilidades para migraciones idempotentes (DB ya migrada parcialmente o con .js antiguos).
 * Vive fuera de migrations/ para que sequelize-cli no lo trate como migración.
 */

async function ensureColumn(queryInterface, Sequelize, tableName, column, attributes) {
  const d = await queryInterface.describeTable(tableName);
  if (d[column]) return;
  await queryInterface.addColumn(tableName, column, attributes);
}

async function indexExistsByName(queryInterface, indexName) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = :name LIMIT 1`,
    { replacements: { name: indexName } }
  );
  return rows.length > 0;
}

async function ensureIndex(queryInterface, tableName, columns, options) {
  if (await indexExistsByName(queryInterface, options.name)) return;
  try {
    await queryInterface.addIndex(tableName, columns, options);
  } catch (e) {
    const msg = e?.message ?? String(e);
    if (!msg.includes('already exists')) throw e;
  }
}

module.exports = {
  ensureColumn,
  indexExistsByName,
  ensureIndex,
};
