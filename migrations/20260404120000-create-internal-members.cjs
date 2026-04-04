"use strict";

const { ensureIndex } = require("../scripts/migration-helpers.cjs");

/** internal_members: vínculo explícito app + foro + Mercado Pago (v1 admin provisioning). */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await queryInterface.tableExists("InternalMembers"))) {
      await queryInterface.createTable("InternalMembers", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        appUserId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: { model: "Users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        forumUserId: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true,
        },
        forumEmail: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        mercadopagoEmail: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        mercadopagoCustomerId: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        mercadopagoPreapprovalId: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true,
        },
        mercadopagoExternalReference: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        subscriptionPlanId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "SubscriptionPlans", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        forumStatus: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "not_linked",
        },
        mercadopagoStatus: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "not_configured",
        },
        subscriptionStatus: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "none",
        },
        lastForumError: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        lastMpError: {
          type: Sequelize.TEXT,
          allowNull: true,
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
    }

    await ensureIndex(
      queryInterface,
      "InternalMembers",
      ["mercadopagoExternalReference"],
      { name: "internal_members_mp_external_ref_idx" }
    );

    if (!(await queryInterface.tableExists("AdminMemberAudits"))) {
      await queryInterface.createTable("AdminMemberAudits", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        internalMemberId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "InternalMembers", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        adminUserId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "AdminUsers", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        action: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        payloadJson: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
    }

    await ensureIndex(
      queryInterface,
      "AdminMemberAudits",
      ["internalMemberId"],
      { name: "admin_member_audits_member_idx" }
    );
    await ensureIndex(
      queryInterface,
      "AdminMemberAudits",
      ["adminUserId"],
      { name: "admin_member_audits_admin_idx" }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("AdminMemberAudits");
    await queryInterface.dropTable("InternalMembers");
  },
};
