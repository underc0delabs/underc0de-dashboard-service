'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    if (await queryInterface.tableExists('UserFollows')) {
      return;
    }
    await queryInterface.createTable('UserFollows', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      followerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      followingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    await queryInterface.addIndex('UserFollows', ['followerId', 'followingId'], {
      unique: true,
      name: 'user_follows_follower_following_unique',
    });
    await queryInterface.addIndex('UserFollows', ['followingId'], {
      name: 'user_follows_following_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('UserFollows');
  },
};
