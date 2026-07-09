'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await queryInterface.tableExists('Raffles'))) {
      return;
    }

    const table = await queryInterface.describeTable('Raffles');
    if (table.deletedAt) {
      return;
    }

    await queryInterface.addColumn('Raffles', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    if (!(await queryInterface.tableExists('Raffles'))) {
      return;
    }

    const table = await queryInterface.describeTable('Raffles');
    if (!table.deletedAt) {
      return;
    }

    await queryInterface.removeColumn('Raffles', 'deletedAt');
  },
};
