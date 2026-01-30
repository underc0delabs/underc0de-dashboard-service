'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'Merchants';

    // Eliminar el índice único de email si existe
    try {
      await queryInterface.removeIndex(tableName, 'merchants_email_unique');
    } catch (error) {
      // El índice puede no existir
      console.log('Índice merchants_email_unique no encontrado o ya eliminado');
    }

    // Cambiar la columna email para permitir null
    await queryInterface.changeColumn(tableName, 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'Merchants';

    // Revertir: hacer email NOT NULL
    await queryInterface.changeColumn(tableName, 'email', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Revertir: agregar índice único de email
    await queryInterface.addIndex(tableName, ['email'], {
      unique: true,
      name: 'merchants_email_unique'
    });
  }
};
