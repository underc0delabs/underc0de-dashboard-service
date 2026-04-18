'use strict';

/** MIGRATION_FILE_ID: extend-enum-20260418-pgenum-no-if-sql */

/**
 * Enum enum_SubscriptionPlans_status: agrega PENDING, EXPIRED, PAYMENT_FAILED.
 * Compatible con PostgreSQL 9.1+ (solo ADD VALUE clásico; ver pg_enum para idempotencia).
 * Idempotente: consulta pg_enum antes de cada ALTER TYPE ... ADD VALUE.
 */
module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;

    const [typeRows] = await sequelize.query(
      `SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_SubscriptionPlans_status'
      ) AS ok;`,
    );
    const ok = typeRows?.[0]?.ok;
    const hasEnum = ok === true || ok === 't' || ok === 1;
    if (!hasEnum) {
      throw new Error(
        'No existe el tipo enum_SubscriptionPlans_status. La columna SubscriptionPlans.status debe migrarse antes ' +
          '(migración 20260102232333-update-subscription-plans-model). Revisá que esa migración esté aplicada en la base; ' +
          'si SequelizeMeta dice que ya corrió pero status sigue siendo varchar, hay desincronización: backup, ' +
          'corregí el esquema o eliminá esa fila de SequelizeMeta y volvé a ejecutar migrate:up.',
      );
    }

    const [rows] = await sequelize.query(
      [
        'SELECT e.enumlabel AS label',
        'FROM pg_enum e',
        'JOIN pg_type t ON e.enumtypid = t.oid',
        "WHERE t.typname = 'enum_SubscriptionPlans_status'",
      ].join(' '),
    );
    const existing = new Set((rows || []).map((r) => String(r.label)));
    const needed = ['PENDING', 'EXPIRED', 'PAYMENT_FAILED'];
    for (const label of needed) {
      if (existing.has(label)) continue;
      await sequelize.query(
        `ALTER TYPE "enum_SubscriptionPlans_status" ADD VALUE '${label}';`,
      );
      existing.add(label);
    }
  },

  async down() {
    // Quitar valores de ENUM en PostgreSQL no es reversible de forma simple.
  },
};
