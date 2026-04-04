'use strict';

const { ensureColumn } = require('../scripts/migration-helpers.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'Merchants';

    await ensureColumn(queryInterface, Sequelize, tableName, 'usersProDisccount', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await ensureColumn(queryInterface, Sequelize, tableName, 'usersDisccount', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'Merchants';

    // Eliminar columnas
    await queryInterface.removeColumn(tableName, 'usersProDisccount');
    await queryInterface.removeColumn(tableName, 'usersDisccount');
  }
};
