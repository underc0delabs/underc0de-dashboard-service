import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";
import {
  FORUM_STATUS,
  MERCADOPAGO_STATUS,
  SUBSCRIPTION_STATUS,
} from "../../core/domain/memberIntegrationStatuses.js";

const InternalMember = sequelize.define("InternalMember", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  appUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  forumUserId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  forumEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mercadopagoEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mercadopagoCustomerId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mercadopagoPreapprovalId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  mercadopagoExternalReference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subscriptionPlanId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  forumStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: FORUM_STATUS.NOT_LINKED,
  },
  mercadopagoStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: MERCADOPAGO_STATUS.NOT_CONFIGURED,
  },
  subscriptionStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: SUBSCRIPTION_STATUS.NONE,
  },
  lastForumError: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  lastMpError: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

export default InternalMember;
