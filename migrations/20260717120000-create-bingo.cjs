'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    if (await queryInterface.tableExists('BingoEvents')) {
      return;
    }

    await queryInterface.createTable('BingoEvents', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'draft',
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdByAdminId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'AdminUsers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    await queryInterface.createTable('BingoStands', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      bingoEventId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'BingoEvents', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      merchantId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Merchants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      code: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      label: {
        type: Sequelize.STRING(200),
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

    await queryInterface.createTable('BingoParticipants', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      googleId: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      avatarUrl: {
        type: Sequelize.STRING(500),
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

    await queryInterface.createTable('BingoParticipantTokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      participantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'BingoParticipants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('BingoBoardEntries', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      bingoEventId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'BingoEvents', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      participantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'BingoParticipants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      joinedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      completedAt: {
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

    await queryInterface.createTable('BingoCheckins', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      boardEntryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'BingoBoardEntries', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      bingoStandId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'BingoStands', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      checkedInAt: {
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

    await queryInterface.createTable('BingoRaffleEntries', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      bingoEventId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'BingoEvents', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      participantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'BingoParticipants', key: 'id' },
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

    await queryInterface.createTable('BingoDraws', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      bingoEventId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'BingoEvents', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      winnerParticipantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'BingoParticipants', key: 'id' },
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

    await queryInterface.addIndex('BingoStands', ['bingoEventId', 'code'], {
      unique: true,
      name: 'bingo_stands_event_code_unique',
    });
    await queryInterface.addIndex('BingoBoardEntries', ['bingoEventId', 'participantId'], {
      unique: true,
      name: 'bingo_board_entries_event_participant_unique',
    });
    await queryInterface.addIndex('BingoCheckins', ['boardEntryId', 'bingoStandId'], {
      unique: true,
      name: 'bingo_checkins_entry_stand_unique',
    });
    await queryInterface.addIndex('BingoRaffleEntries', ['bingoEventId', 'participantId'], {
      unique: true,
      name: 'bingo_raffle_entries_event_participant_unique',
    });
    await queryInterface.addIndex('BingoEvents', ['status'], {
      name: 'bingo_events_status_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('BingoDraws');
    await queryInterface.dropTable('BingoRaffleEntries');
    await queryInterface.dropTable('BingoCheckins');
    await queryInterface.dropTable('BingoBoardEntries');
    await queryInterface.dropTable('BingoParticipantTokens');
    await queryInterface.dropTable('BingoParticipants');
    await queryInterface.dropTable('BingoStands');
    await queryInterface.dropTable('BingoEvents');
  },
};
