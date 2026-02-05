'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Environments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('Environments', ['key'], {
      unique: true,
      name: 'environments_key_unique'
    });

    // Insertar valor por defecto para el precio de MercadoPago
    await queryInterface.bulkInsert('Environments', [{
      key: 'MERCADO_PAGO_PRICE',
      value: '3000',
      description: 'Precio de la suscripción mensual en ARS',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Environments');
  }
};
