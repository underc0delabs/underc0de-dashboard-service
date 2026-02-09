'use strict';

/** Asegura que la columna id de SubscriptionPlans tenga DEFAULT nextval (evita "null viola not null" en INSERT). */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'SubscriptionPlans_id_seq') THEN
          CREATE SEQUENCE "SubscriptionPlans_id_seq" OWNED BY "SubscriptionPlans"."id";
          PERFORM setval('"SubscriptionPlans_id_seq"', COALESCE((SELECT MAX(id) FROM "SubscriptionPlans"), 1));
        END IF;
      END $$;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "SubscriptionPlans" ALTER COLUMN "id" SET DEFAULT nextval('"SubscriptionPlans_id_seq"');
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "SubscriptionPlans" ALTER COLUMN "id" DROP DEFAULT;
    `);
  },
};
