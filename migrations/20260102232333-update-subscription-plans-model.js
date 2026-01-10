'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableName = 'SubscriptionPlans';

    // Verificar si las columnas existen antes de eliminarlas
    const tableDescription = await queryInterface.describeTable(tableName);
    
    // Eliminar expiresAt si existe
    if (tableDescription.expiresAt) {
      await queryInterface.removeColumn(tableName, 'expiresAt');
    }

    // Eliminar mpSubscriptionId si existe
    if (tableDescription.mpSubscriptionId) {
      await queryInterface.removeColumn(tableName, 'mpSubscriptionId');
    }

    // Agregar nextPaymentDate si no existe
    if (!tableDescription.nextPaymentDate) {
      await queryInterface.addColumn(tableName, 'nextPaymentDate', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    // Cambiar status de STRING a ENUM
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_SubscriptionPlans_status" AS ENUM ('ACTIVE', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Cambiar la columna status a usar el ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE "SubscriptionPlans" 
      ALTER COLUMN "status" TYPE "enum_SubscriptionPlans_status" 
      USING CASE 
        WHEN "status" IN ('ACTIVE', 'CANCELLED') 
        THEN "status"::text::"enum_SubscriptionPlans_status"
        ELSE 'ACTIVE'::"enum_SubscriptionPlans_status"
      END;
    `);

    // Actualizar mpPreapprovalId: cambiar a NOT NULL y agregar unique constraint
    // Primero, si hay valores NULL, los actualizamos
    await queryInterface.sequelize.query(`
      UPDATE "SubscriptionPlans" 
      SET "mpPreapprovalId" = 'temp_' || id::text 
      WHERE "mpPreapprovalId" IS NULL;
    `);

    // Cambiar a NOT NULL
    await queryInterface.changeColumn(tableName, 'mpPreapprovalId', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Agregar unique constraint si no existe
    try {
      await queryInterface.addIndex(tableName, ['mpPreapprovalId'], {
        unique: true,
        name: 'subscription_plans_mp_preapproval_id_unique'
      });
    } catch (error) {
      // El índice ya existe, continuar
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  async down (queryInterface, Sequelize) {
    const tableName = 'SubscriptionPlans';

    // Revertir: cambiar status de ENUM a STRING
    await queryInterface.sequelize.query(`
      ALTER TABLE "SubscriptionPlans" 
      ALTER COLUMN "status" TYPE VARCHAR(255) 
      USING "status"::text;
    `);

    // Eliminar el tipo ENUM
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_SubscriptionPlans_status";
    `);

    // Revertir: eliminar unique constraint de mpPreapprovalId
    await queryInterface.removeIndex(tableName, 'subscription_plans_mp_preapproval_id_unique', {
      ifExists: true
    });

    // Revertir: cambiar mpPreapprovalId a nullable
    await queryInterface.changeColumn(tableName, 'mpPreapprovalId', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Revertir: agregar las columnas eliminadas
    const tableDescription = await queryInterface.describeTable(tableName);

    if (!tableDescription.expiresAt) {
      await queryInterface.addColumn(tableName, 'expiresAt', {
        type: Sequelize.DATE,
        allowNull: false
      });
    }

    if (!tableDescription.mpSubscriptionId) {
      await queryInterface.addColumn(tableName, 'mpSubscriptionId', {
        type: Sequelize.STRING,
        allowNull: false
      });
    }

    // Revertir: eliminar nextPaymentDate
    if (tableDescription.nextPaymentDate) {
      await queryInterface.removeColumn(tableName, 'nextPaymentDate');
    }
  }
};
