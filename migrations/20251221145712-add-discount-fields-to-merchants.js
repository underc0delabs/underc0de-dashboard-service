'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'Merchants';

    // Agregar usersProDisccount
    await queryInterface.addColumn(tableName, 'usersProDisccount', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // Agregar usersDisccount
    await queryInterface.addColumn(tableName, 'usersDisccount', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'Merchants';

    // Eliminar columnas
    await queryInterface.removeColumn(tableName, 'usersProDisccount');
    await queryInterface.removeColumn(tableName, 'usersDisccount');
  }
};
