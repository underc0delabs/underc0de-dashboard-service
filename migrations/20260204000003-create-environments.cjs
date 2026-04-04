'use strict';

const { ensureIndex } = require('../scripts/migration-helpers.cjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await queryInterface.tableExists('Environments'))) {
      await queryInterface.createTable('Environments', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        key: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        value: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
    }

    await ensureIndex(queryInterface, 'Environments', ['key'], {
      unique: true,
      name: 'environments_key_unique',
    });

    const [existing] = await queryInterface.sequelize.query(
      `SELECT 1 FROM "Environments" WHERE key = 'MERCADO_PAGO_PRICE' LIMIT 1`
    );
    if (existing.length === 0) {
      await queryInterface.bulkInsert('Environments', [
        {
          key: 'MERCADO_PAGO_PRICE',
          value: '3000',
          description: 'Precio de la suscripción mensual en ARS',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Environments');
  },
};
