'use strict';

/**
 * Extiende enum_SubscriptionPlans_status con PENDING, EXPIRED, PAYMENT_FAILED
 * para historial, re-suscripción y mapeo fiel a Mercado Pago.
 */
module.exports = {
  async up(queryInterface) {
    // ALTER TYPE ... ADD VALUE no puede ejecutarse dentro de DO $$ (PostgreSQL).
    // IF NOT EXISTS evita error si el valor ya existe (re-ejecución / deploy repetido).
    const run = (sql) => queryInterface.sequelize.query(sql);
    await run(
      `ALTER TYPE "enum_SubscriptionPlans_status" ADD VALUE IF NOT EXISTS 'PENDING';`,
    );
    await run(
      `ALTER TYPE "enum_SubscriptionPlans_status" ADD VALUE IF NOT EXISTS 'EXPIRED';`,
    );
    await run(
      `ALTER TYPE "enum_SubscriptionPlans_status" ADD VALUE IF NOT EXISTS 'PAYMENT_FAILED';`,
    );
  },

  async down() {
    // PostgreSQL no permite quitar valores de ENUM de forma trivial; no-op en down.
  },
};
