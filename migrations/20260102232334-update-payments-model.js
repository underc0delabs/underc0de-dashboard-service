'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableName = 'Payments';

    // Verificar la estructura actual de la tabla
    const tableDescription = await queryInterface.describeTable(tableName);

    // Eliminar status si existe (el modelo actual no lo tiene)
    if (tableDescription.status) {
      await queryInterface.removeColumn(tableName, 'status');
    }

    // Agregar amount si no existe
    if (!tableDescription.amount) {
      await queryInterface.addColumn(tableName, 'amount', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      });
    }

    // Agregar currency si no existe
    if (!tableDescription.currency) {
      await queryInterface.addColumn(tableName, 'currency', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'ARS'
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableName = 'Payments';
    const tableDescription = await queryInterface.describeTable(tableName);

    // Revertir: agregar status si fue eliminado
    if (!tableDescription.status) {
      await queryInterface.addColumn(tableName, 'status', {
        type: Sequelize.STRING,
        allowNull: false
      });
    }

    // Revertir: eliminar las columnas agregadas
    if (tableDescription.amount) {
      await queryInterface.removeColumn(tableName, 'amount');
    }

    if (tableDescription.currency) {
      await queryInterface.removeColumn(tableName, 'currency');
    }
  }
};
