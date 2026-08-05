'use strict';

const { ensureColumn } = require('../scripts/migration-helpers.cjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, Sequelize, 'BingoStands', 'logo', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('BingoStands', 'logo');
  },
};
