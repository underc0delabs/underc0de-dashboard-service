"use strict";

/** Vínculo L2 Memories ↔ cuenta foro (IDs externos, sin FK a Users Underc0de app). */

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await queryInterface.tableExists("L2PartnerForumLinks"))) {
      await queryInterface.createTable("L2PartnerForumLinks", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        l2UserExternalId: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          comment:
            "ID de usuario en el backend L2 Memories (opaque string definido por L2)",
        },
        forumMemberId: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          comment: "id_member del foro SMF tras userData válido",
        },
        forumUsernameNormalized: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        forumEmailSnippet: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: "solo dominio o hash si se acuerda política privacidad; opcional MVP",
        },
        linkStatus: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "linked",
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });

      await queryInterface.addIndex("L2PartnerForumLinks", ["l2UserExternalId"]);
      await queryInterface.addIndex("L2PartnerForumLinks", ["forumMemberId"]);
    }
  },

  async down(queryInterface, Sequelize) {
    if (await queryInterface.tableExists("L2PartnerForumLinks")) {
      await queryInterface.dropTable("L2PartnerForumLinks");
    }
  },
};
