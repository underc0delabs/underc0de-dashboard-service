'use strict';

/** Asegura que la columna id de Users tenga DEFAULT nextval (evita "null viola not null" en INSERT).
 *  En prod puede faltar si la tabla se creó manualmente o la secuencia se desvinculó. */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.sequences
          WHERE sequence_schema = 'public'
            AND sequence_name = 'Users_id_seq'
        ) THEN
          CREATE SEQUENCE "Users_id_seq" OWNED BY "Users"."id";
          PERFORM setval('"Users_id_seq"', COALESCE((SELECT MAX(id) FROM "Users"), 1));
        END IF;
      END $$;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "Users" ALTER COLUMN "id" SET DEFAULT nextval('"Users_id_seq"');
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Users" ALTER COLUMN "id" DROP DEFAULT;
    `);
  },
};
