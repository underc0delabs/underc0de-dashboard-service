'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    if (await queryInterface.tableExists('UserConnections')) {
      return;
    }
    await queryInterface.createTable('UserConnections', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      requesterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      addresseeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
      },
      respondedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addIndex('UserConnections', ['requesterId', 'addresseeId'], {
      unique: true,
      name: 'user_connections_requester_addressee_unique',
    });
    await queryInterface.addIndex('UserConnections', ['addresseeId', 'status'], {
      name: 'user_connections_addressee_status_idx',
    });
    await queryInterface.addIndex('UserConnections', ['requesterId', 'status'], {
      name: 'user_connections_requester_status_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('UserConnections');
  },
};
