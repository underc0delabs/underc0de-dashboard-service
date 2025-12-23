'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableName = 'Merchants';

    await queryInterface.addColumn(tableName, 'detail', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    const tableName = 'Merchants';
    await queryInterface.removeColumn(tableName, 'detail');
  }
};
