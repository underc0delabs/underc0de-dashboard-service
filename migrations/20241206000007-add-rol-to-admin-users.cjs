'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('AdminUsers');
    if (table.rol) {
      return;
    }
    await queryInterface.addColumn('AdminUsers', 'rol', {
      type: Sequelize.ENUM('Admin', 'Editor'),
      allowNull: false,
      defaultValue: 'Admin'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('AdminUsers', 'rol');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_AdminUsers_rol";');
  }
};

