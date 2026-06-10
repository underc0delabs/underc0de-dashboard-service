import { DataTypes } from "sequelize";
import { sequelize } from "../../../../server/DbConnection.js";

export const CONNECTION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  BLOCKED: "blocked",
} as const;

export type ConnectionStatus =
  (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];

const UserConnection = sequelize.define("UserConnection", {
  id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  requesterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  addresseeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: CONNECTION_STATUS.PENDING,
  },
  respondedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: new Date(),
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: new Date(),
  },
});

export default UserConnection;
