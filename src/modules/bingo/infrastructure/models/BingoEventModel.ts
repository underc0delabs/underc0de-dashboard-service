import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

export const BINGO_EVENT_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  CLOSED: "closed",
} as const;

export type BingoEventStatus =
  (typeof BINGO_EVENT_STATUS)[keyof typeof BINGO_EVENT_STATUS];

const BingoEvent = sequelize.define(
  "BingoEvent",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: BINGO_EVENT_STATUS.DRAFT,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdByAdminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "BingoEvents",
  },
);

export default BingoEvent;
