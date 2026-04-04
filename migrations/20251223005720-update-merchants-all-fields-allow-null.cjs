'use strict';

/** @type {import('sequelize-cli').Migration} */
const safeChange = async (fn) => {
  try {
    await fn();
  } catch (e) {
    const msg = e?.message ?? String(e);
    if (!msg.includes('already') && !msg.includes('noop')) throw e;
  }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'Merchants';

    await safeChange(() =>
      queryInterface.changeColumn(tableName, 'name', {
        type: Sequelize.STRING,
        allowNull: true,
      })
    );

    await safeChange(() =>
      queryInterface.changeColumn(tableName, 'address', {
        type: Sequelize.STRING,
        allowNull: true,
      })
    );

    await safeChange(() =>
      queryInterface.changeColumn(tableName, 'phone', {
        type: Sequelize.STRING,
        allowNull: true,
      })
    );

    await safeChange(() =>
      queryInterface.changeColumn(tableName, 'status', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      })
    );
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'Merchants';

    // Revertir: hacer name NOT NULL
    await queryInterface.changeColumn(tableName, 'name', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Revertir: hacer address NOT NULL
    await queryInterface.changeColumn(tableName, 'address', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Revertir: hacer phone NOT NULL
    await queryInterface.changeColumn(tableName, 'phone', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Revertir: hacer status NOT NULL
    await queryInterface.changeColumn(tableName, 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  }
};
