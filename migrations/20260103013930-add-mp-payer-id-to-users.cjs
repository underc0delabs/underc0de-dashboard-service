'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'mpPayerId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      unique: true,
      comment: 'MercadoPago payer_id para relacionar usuarios con pagos'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'mpPayerId');
  }
};
