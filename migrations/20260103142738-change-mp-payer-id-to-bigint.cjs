'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const [cols] = await queryInterface.sequelize.query(`
      SELECT data_type FROM information_schema.columns
      WHERE table_schema = 'public'
        AND LOWER(table_name) = 'users'
        AND LOWER(column_name) = 'mppayerid';
    `);
    if (cols.length === 0) return;
    const t = String(cols[0].data_type || '').toLowerCase();
    if (t === 'character varying' || t === 'varchar' || t === 'text') return;

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
