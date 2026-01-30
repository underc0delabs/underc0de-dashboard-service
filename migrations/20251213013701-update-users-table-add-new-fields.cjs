'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'Users';

    // Agregar username (requerido, único)
    // Primero lo agregamos como nullable para permitir migración de datos existentes
    await queryInterface.addColumn(tableName, 'username', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });

    // Si hay datos existentes, necesitarás poblar username antes de hacerlo NOT NULL
    // Por ahora lo dejamos como nullable, pero puedes crear otra migración después
    // para hacerlo NOT NULL una vez que todos los registros tengan username

    // Agregar lastname
    await queryInterface.addColumn(tableName, 'lastname', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Agregar idNumber (DNI)
    await queryInterface.addColumn(tableName, 'idNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Agregar password
    await queryInterface.addColumn(tableName, 'password', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Agregar userType (tipousuario)
    await queryInterface.addColumn(tableName, 'userType', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Agregar birthday
    await queryInterface.addColumn(tableName, 'birthday', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Agregar vip
    await queryInterface.addColumn(tableName, 'vip', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    // Agregar fcmToken si no existe
    const [columns] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${tableName.toLowerCase()}' 
        AND column_name = 'fcmToken';
    `);

    if (columns.length === 0) {
      await queryInterface.addColumn(tableName, 'fcmToken', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    // Crear índice único para username
    await queryInterface.addIndex(tableName, ['username'], {
      unique: true,
      name: 'users_username_unique'
    });

    // Nota: Después de migrar datos existentes, deberías hacer username NOT NULL
    // Esto se puede hacer en una migración separada después de poblar los datos
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'Users';

    // Eliminar índice de username
    try {
      await queryInterface.removeIndex(tableName, 'users_username_unique');
    } catch (error) {
      // El índice puede no existir
    }

    // Eliminar columnas
    await queryInterface.removeColumn(tableName, 'username');
    await queryInterface.removeColumn(tableName, 'lastname');
    await queryInterface.removeColumn(tableName, 'idNumber');
    await queryInterface.removeColumn(tableName, 'password');
    await queryInterface.removeColumn(tableName, 'userType');
    await queryInterface.removeColumn(tableName, 'birthday');
    await queryInterface.removeColumn(tableName, 'vip');

    // Eliminar fcmToken solo si existe
    const [columns] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${tableName.toLowerCase()}' 
        AND column_name = 'fcmToken';
    `);

    if (columns.length > 0) {
      await queryInterface.removeColumn(tableName, 'fcmToken');
    }
  }
};
