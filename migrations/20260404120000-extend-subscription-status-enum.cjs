'use strict';

/**
 * Extiende enum_SubscriptionPlans_status con PENDING, EXPIRED, PAYMENT_FAILED
 * para historial, re-suscripción y mapeo fiel a Mercado Pago.
 */
module.exports = {
  async up(queryInterface) {
    const addValue = async (label) => {
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'enum_SubscriptionPlans_status' AND e.enumlabel = '${label}'
          ) THEN
            ALTER TYPE "enum_SubscriptionPlans_status" ADD VALUE '${label}';
          END IF;
        END $$;
      `);
    };
    await addValue('PENDING');
    await addValue('EXPIRED');
    await addValue('PAYMENT_FAILED');
  },

  async down() {
    // PostgreSQL no permite quitar valores de ENUM de forma trivial; no-op en down.
  },
};
