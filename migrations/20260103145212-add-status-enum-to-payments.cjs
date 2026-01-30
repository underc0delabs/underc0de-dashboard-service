'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableName = 'Payments';
    
    // Verificar si la columna status ya existe
    const tableDescription = await queryInterface.describeTable(tableName);
    
    // Eliminar el tipo ENUM anterior si existe (puede tener valores en mayúsculas)
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        DROP TYPE IF EXISTS "enum_Payments_status" CASCADE;
      EXCEPTION
        WHEN undefined_object THEN null;
      END $$;
    `);
    
    // Crear el tipo ENUM con valores en minúsculas
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Payments_status" AS ENUM ('approved', 'pending', 'rejected', 'cancelled', 'refunded');
    `);
    
    // Si la columna status no existe, agregarla usando SQL directo
    if (!tableDescription.status) {
      await queryInterface.sequelize.query(`
        ALTER TABLE "Payments" 
        ADD COLUMN "status" "enum_Payments_status" NOT NULL DEFAULT 'pending';
      `);
    } else {
      // Si existe, cambiar su tipo a ENUM usando SQL directo
      // Convertir valores existentes a minúsculas
      await queryInterface.sequelize.query(`
        ALTER TABLE "Payments" 
        ALTER COLUMN "status" TYPE "enum_Payments_status" 
        USING CASE 
          WHEN LOWER("status"::text) IN ('approved', 'pending', 'rejected', 'cancelled', 'refunded') 
          THEN LOWER("status"::text)::"enum_Payments_status"
          ELSE 'pending'::"enum_Payments_status"
        END;
      `);
      
      // Asegurar que no sea NULL y tenga default
      await queryInterface.sequelize.query(`
        ALTER TABLE "Payments" 
        ALTER COLUMN "status" SET NOT NULL,
        ALTER COLUMN "status" SET DEFAULT 'pending';
      `);
    }
  },

  async down (queryInterface, Sequelize) {
    const tableName = 'Payments';
    const tableDescription = await queryInterface.describeTable(tableName);
    
    // Revertir: cambiar de ENUM a VARCHAR usando SQL directo
    if (tableDescription.status) {
      await queryInterface.sequelize.query(`
        ALTER TABLE "Payments" 
        ALTER COLUMN "status" TYPE VARCHAR(255) 
        USING "status"::text;
      `);
    }
  }
};
