'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableName = 'Users';

    // Verificar la estructura actual de la tabla
    const tableDescription = await queryInterface.describeTable(tableName);

    // Eliminar campo vip si existe
    if (tableDescription.vip) {
      await queryInterface.removeColumn(tableName, 'vip');
    }

    // Eliminar campo suscription si existe
    if (tableDescription.suscription) {
      await queryInterface.removeColumn(tableName, 'suscription');
    }
  },

  async down (queryInterface, Sequelize) {
    const tableName = 'Users';
    const tableDescription = await queryInterface.describeTable(tableName);

    // Revertir: agregar campo vip si fue eliminado
    if (!tableDescription.vip) {
      await queryInterface.addColumn(tableName, 'vip', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }

    // Revertir: agregar campo suscription si fue eliminado
    if (!tableDescription.suscription) {
      await queryInterface.addColumn(tableName, 'suscription', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  }
};
