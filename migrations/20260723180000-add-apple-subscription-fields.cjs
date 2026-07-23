'use strict';

/** @param {import('sequelize').QueryInterface} queryInterface */
/** @param {import('sequelize').Sequelize} Sequelize */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'SubscriptionPlans';

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_SubscriptionPlans_provider" AS ENUM ('mercadopago', 'apple');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.addColumn(table, 'provider', {
      type: Sequelize.ENUM('mercadopago', 'apple'),
      allowNull: false,
      defaultValue: 'mercadopago',
    });

    await queryInterface.addColumn(table, 'productId', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn(table, 'transactionId', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn(table, 'originalTransactionId', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn(table, 'expirationDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn(table, 'environment', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn(table, 'lastValidatedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    try {
      await queryInterface.addIndex(table, ['originalTransactionId'], {
        unique: true,
        name: 'subscription_plans_original_transaction_id_unique',
        where: {
          originalTransactionId: {
            [Sequelize.Op.ne]: null,
          },
        },
      });
    } catch (error) {
      if (!String(error?.message ?? '').includes('already exists')) {
        throw error;
      }
    }
  },

  async down(queryInterface) {
    const table = 'SubscriptionPlans';

    await queryInterface.removeIndex(
      table,
      'subscription_plans_original_transaction_id_unique',
      { ifExists: true },
    );

    await queryInterface.removeColumn(table, 'lastValidatedAt');
    await queryInterface.removeColumn(table, 'environment');
    await queryInterface.removeColumn(table, 'expirationDate');
    await queryInterface.removeColumn(table, 'originalTransactionId');
    await queryInterface.removeColumn(table, 'transactionId');
    await queryInterface.removeColumn(table, 'productId');
    await queryInterface.removeColumn(table, 'provider');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_SubscriptionPlans_provider";',
    );
  },
};
