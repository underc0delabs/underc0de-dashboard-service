'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM \"AdminUsers\" WHERE email = 'admin@underc0de.org' LIMIT 1"
    );
    if (existing && existing.length > 0) {
      return;
    }
    const hashedPassword = await bcrypt.hash('D1Nn02026!', 10);
    await queryInterface.bulkInsert('AdminUsers', [
      {
        name: 'Admin',
        email: 'admin@underc0de.org',
        password: hashedPassword,
        rol: 'Admin',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('AdminUsers', {
      email: 'admin@underc0de.org'
    }, {});
  }
};
