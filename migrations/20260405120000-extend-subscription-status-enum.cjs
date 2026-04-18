'use strict';

/**
 * Enum enum_SubscriptionPlans_status: agrega PENDING, EXPIRED, PAYMENT_FAILED.
 * Compatible con PostgreSQL 9.1+ (sin ADD VALUE ... sintaxis 9.3+).
 * Idempotente: consulta pg_enum antes de cada ALTER TYPE ... ADD VALUE.
 */
module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;
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
