'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserSubscriptions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()')
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
      mpPreapprovalId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'authorized', 'paused', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
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

    await queryInterface.addIndex('UserSubscriptions', ['userId'], {
      unique: true,
      name: 'user_subscriptions_user_id_unique'
    });

    await queryInterface.addIndex('UserSubscriptions', ['mpPreapprovalId'], {
      unique: true,
      name: 'user_subscriptions_mp_preapproval_id_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserSubscriptions');
  }
};
