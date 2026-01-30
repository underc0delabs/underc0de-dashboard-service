'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'Merchants';

    // Cambiar name para permitir null
    await queryInterface.changeColumn(tableName, 'name', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Cambiar address para permitir null
    await queryInterface.changeColumn(tableName, 'address', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Cambiar phone para permitir null
    await queryInterface.changeColumn(tableName, 'phone', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Cambiar status para permitir null
    await queryInterface.changeColumn(tableName, 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true
    });
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'Merchants';

    // Revertir: hacer name NOT NULL
    await queryInterface.changeColumn(tableName, 'name', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Revertir: hacer address NOT NULL
    await queryInterface.changeColumn(tableName, 'address', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Revertir: hacer phone NOT NULL
    await queryInterface.changeColumn(tableName, 'phone', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Revertir: hacer status NOT NULL
    await queryInterface.changeColumn(tableName, 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  }
};
