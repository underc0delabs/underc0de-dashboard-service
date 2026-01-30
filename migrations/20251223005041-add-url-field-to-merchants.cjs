'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'Merchants';

    // Agregar url
    await queryInterface.addColumn(tableName, 'url', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'Merchants';

    // Eliminar columna
    await queryInterface.removeColumn(tableName, 'url');
  }
};
