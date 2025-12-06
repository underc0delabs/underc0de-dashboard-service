'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await queryInterface.bulkInsert('AdminUsers', [
      {
        name: 'Admin',
        email: 'admin@underc0de.com',
        password: hashedPassword,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('AdminUsers', {
      email: 'admin@underc0de.com'
    }, {});
  }
};

