'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      await queryInterface.changeColumn('SubscriptionPlans', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    } catch (e) {
      const msg = e?.message ?? String(e);
      if (!msg.includes('already') && !msg.includes('not-null')) throw e;
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('SubscriptionPlans', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};
