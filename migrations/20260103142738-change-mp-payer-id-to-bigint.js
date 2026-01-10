'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Cambiar el tipo de dato de mpPayerId de INTEGER a STRING usando SQL directo
    // Esto evita problemas con las restricciones UNIQUE
    await queryInterface.sequelize.query(`
      ALTER TABLE "Users" 
      ALTER COLUMN "mpPayerId" TYPE VARCHAR(255) USING "mpPayerId"::VARCHAR;
    `);
  },

  async down (queryInterface, Sequelize) {
    // Revertir a INTEGER usando SQL directo
    await queryInterface.sequelize.query(`
      ALTER TABLE "Users" 
      ALTER COLUMN "mpPayerId" TYPE INTEGER USING NULLIF("mpPayerId", '')::INTEGER;
    `);
  }
};
