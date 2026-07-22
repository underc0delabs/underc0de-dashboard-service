'use strict';

const { ensureColumn } = require('../scripts/migration-helpers.cjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, Sequelize, 'Raffles', 'allowedCountry', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await ensureColumn(queryInterface, Sequelize, 'Raffles', 'allowedProvince', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Raffles', 'allowedProvince');
    await queryInterface.removeColumn('Raffles', 'allowedCountry');
  },
};
