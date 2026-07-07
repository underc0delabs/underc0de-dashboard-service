'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    if (await queryInterface.tableExists('Raffles')) {
      return;
    }

    await queryInterface.createTable('Raffles', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      imageUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      participationDeadline: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      claimDeadline: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      proOnly: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'draft',
      },
      createdByAdminId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'AdminUsers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      winnerUserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      currentDrawId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      publishedAt: {
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

    await queryInterface.createTable('RaffleParticipants', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      raffleId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Raffles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      enteredAt: {
        type: Sequelize.DATE,
        allowNull: false,
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

    await queryInterface.createTable('RaffleDraws', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      raffleId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Raffles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      drawNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      winnerUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      participantCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      drawnByAdminId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'AdminUsers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      drawnAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      superseded: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.createTable('RaffleEvents', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      raffleId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Raffles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      actorType: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'system',
      },
      actorId: {
        type: Sequelize.STRING(64),
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

    await queryInterface.addIndex('RaffleParticipants', ['raffleId', 'userId'], {
      unique: true,
      name: 'raffle_participants_raffle_user_unique',
    });
    await queryInterface.addIndex('Raffles', ['status'], {
      name: 'raffles_status_idx',
    });
    await queryInterface.addIndex('RaffleEvents', ['raffleId', 'createdAt'], {
      name: 'raffle_events_raffle_created_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('RaffleEvents');
    await queryInterface.dropTable('RaffleDraws');
    await queryInterface.dropTable('RaffleParticipants');
    await queryInterface.dropTable('Raffles');
  },
};
