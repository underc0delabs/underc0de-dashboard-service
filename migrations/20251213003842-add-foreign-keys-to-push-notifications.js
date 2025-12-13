'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'PushNotifications';
    const adminUsersTable = 'AdminUsers';

    // Verificar si las foreign keys ya existen
    const [foreignKeys] = await queryInterface.sequelize.query(`
      SELECT 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = '${tableName}'
        AND kcu.column_name IN ('createdBy', 'modifiedBy');
    `);

    const existingConstraints = foreignKeys.map(fk => fk.column_name);

    // Agregar foreign key para createdBy si no existe
    if (!existingConstraints.includes('createdBy')) {
      await queryInterface.addConstraint(tableName, {
        fields: ['createdBy'],
        type: 'foreign key',
        name: 'push_notifications_created_by_fkey',
        references: {
          table: adminUsersTable,
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });
    }

    // Agregar foreign key para modifiedBy si no existe
    if (!existingConstraints.includes('modifiedBy')) {
      await queryInterface.addConstraint(tableName, {
        fields: ['modifiedBy'],
        type: 'foreign key',
        name: 'push_notifications_modified_by_fkey',
        references: {
          table: adminUsersTable,
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    // Verificar y agregar índices si no existen
    const [indexes] = await queryInterface.sequelize.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = '${tableName.toLowerCase()}'
        AND indexname IN ('push_notifications_created_by_idx', 'push_notifications_modified_by_idx');
    `);

    const existingIndexes = indexes.map(idx => idx.indexname);

    if (!existingIndexes.includes('push_notifications_created_by_idx')) {
      await queryInterface.addIndex(tableName, ['createdBy'], {
        name: 'push_notifications_created_by_idx'
      });
    }

    if (!existingIndexes.includes('push_notifications_modified_by_idx')) {
      await queryInterface.addIndex(tableName, ['modifiedBy'], {
        name: 'push_notifications_modified_by_idx'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'PushNotifications';

    // Eliminar índices
    try {
      await queryInterface.removeIndex(tableName, 'push_notifications_created_by_idx');
    } catch (error) {
      // El índice puede no existir
    }

    try {
      await queryInterface.removeIndex(tableName, 'push_notifications_modified_by_idx');
    } catch (error) {
      // El índice puede no existir
    }

    // Eliminar foreign keys
    try {
      await queryInterface.removeConstraint(tableName, 'push_notifications_created_by_fkey');
    } catch (error) {
      // La constraint puede no existir
    }

    try {
      await queryInterface.removeConstraint(tableName, 'push_notifications_modified_by_fkey');
    } catch (error) {
      // La constraint puede no existir
    }
  }
};
