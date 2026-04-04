'use strict';

/**
 * No añadir addIndex(['userId']) aquí: createTable con references ya genera el índice
 * de la FK (p. ej. relation "subscription_plans_user_id" already exists).
 * Si la tabla ya existe (migración previa / .js), omitir.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (await queryInterface.tableExists('SubscriptionPlans')) {
      return;
    }

    await queryInterface.createTable('SubscriptionPlans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      startedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      mpSubscriptionId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mpPreapprovalId: {
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SubscriptionPlans');
  }
};

