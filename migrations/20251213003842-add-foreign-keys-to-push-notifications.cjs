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
        AND tc.table_schema = 'public'
        AND LOWER(tc.table_name) = LOWER('${tableName}')
        AND LOWER(kcu.column_name) IN ('createdby', 'modifiedby');
    `);

    const existingConstraints = foreignKeys.map((fk) =>
      String(fk.column_name).toLowerCase()
    );

    // Agregar foreign key para createdBy si no existe
    if (!existingConstraints.includes("createdby")) {
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
    if (!existingConstraints.includes("modifiedby")) {
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

    // Índices por nombre (no filtrar tablename: con "PushNotifications" citado,
    // pg_indexes.tablename no siempre es minúsculas y la query devolvía vacío → duplicaba índices).
    const [indexes] = await queryInterface.sequelize.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public'
        AND indexname IN ('push_notifications_created_by_idx', 'push_notifications_modified_by_idx');
    `);

    const existingIndexes = indexes.map((idx) => idx.indexname);

    const addIndexIfMissing = async (
      indexName,
      fields,
    ) => {
      if (existingIndexes.includes(indexName)) return;
      try {
        await queryInterface.addIndex(tableName, fields, { name: indexName });
        existingIndexes.push(indexName);
      } catch (err) {
        const msg = err?.message ?? String(err);
        if (!msg.includes("already exists")) throw err;
      }
    };

    await addIndexIfMissing("push_notifications_created_by_idx", ["createdBy"]);
    await addIndexIfMissing("push_notifications_modified_by_idx", ["modifiedBy"]);
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
