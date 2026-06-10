'use strict';

const { ensureColumn, ensureIndex } = require('../scripts/migration-helpers.cjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, Sequelize, 'Users', 'shareCode', {
      type: Sequelize.STRING(64),
      allowNull: true,
    });
    await ensureIndex(queryInterface, 'Users', ['shareCode'], {
      name: 'users_share_code_unique',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Users', 'users_share_code_unique');
    await queryInterface.removeColumn('Users', 'shareCode');
  },
};
