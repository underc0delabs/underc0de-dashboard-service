'use strict';

const { ensureColumn } = require('../scripts/migration-helpers.cjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, Sequelize, 'Users', 'country', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await ensureColumn(queryInterface, Sequelize, 'Users', 'province', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'province');
    await queryInterface.removeColumn('Users', 'country');
  },
};
