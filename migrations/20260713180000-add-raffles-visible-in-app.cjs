'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Raffles');
    if (table.visibleInApp) {
      return;
    }

    await queryInterface.addColumn('Raffles', 'visibleInApp', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('Raffles');
    if (!table.visibleInApp) {
      return;
    }

    await queryInterface.removeColumn('Raffles', 'visibleInApp');
  },
};
