'use strict';

/**
 * Tabla sin FK inline: evita que Sequelize/PG dupliquen índices (p. ej. relation
 * "push_notifications_created_by" already exists) y coincide con
 * 20251213003842-add-foreign-keys-to-push-notifications.cjs, que agrega FK + índices
 * nombrados de forma idempotente.
 *
 * Si la tabla ya existe (migración .js antigua u otro entorno), no hacer nada.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (await queryInterface.tableExists('PushNotifications')) {
      return;
    }

    await queryInterface.createTable('PushNotifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false
      },
      audience: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'draft'
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      modifiedBy: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('PushNotifications');
  }
};

