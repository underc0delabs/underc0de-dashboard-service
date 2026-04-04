'use strict';

const { ensureColumn, ensureIndex } = require('../scripts/migration-helpers.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'Users';

    await ensureColumn(queryInterface, Sequelize, tableName, 'username', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await ensureColumn(queryInterface, Sequelize, tableName, 'lastname', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await ensureColumn(queryInterface, Sequelize, tableName, 'idNumber', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await ensureColumn(queryInterface, Sequelize, tableName, 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await ensureColumn(queryInterface, Sequelize, tableName, 'userType', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await ensureColumn(queryInterface, Sequelize, tableName, 'birthday', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await ensureColumn(queryInterface, Sequelize, tableName, 'vip', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await ensureColumn(queryInterface, Sequelize, tableName, 'fcmToken', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await ensureIndex(queryInterface, tableName, ['username'], {
      unique: true,
      name: 'users_username_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'Users';

    try {
      await queryInterface.removeIndex(tableName, 'users_username_unique');
    } catch (error) {
      // puede no existir
    }

    const dropIfPresent = async (col) => {
      const d = await queryInterface.describeTable(tableName);
      if (d[col]) await queryInterface.removeColumn(tableName, col);
    };
    await dropIfPresent('username');
    await dropIfPresent('lastname');
    await dropIfPresent('idNumber');
    await dropIfPresent('password');
    await dropIfPresent('userType');
    await dropIfPresent('birthday');
    await dropIfPresent('vip');
    await dropIfPresent('fcmToken');
  },
};
