import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

export const RAFFLE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CLOSED: "closed",
  DRAWN: "drawn",
  COMPLETED: "completed",
  EXPIRED: "expired",
} as const;

export type RaffleStatus =
  (typeof RAFFLE_STATUS)[keyof typeof RAFFLE_STATUS];

const Raffle = sequelize.define(
  "Raffle",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    participationDeadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    claimDeadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    proOnly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: RAFFLE_STATUS.DRAFT,
    },
    createdByAdminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    winnerUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    currentDrawId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    visibleInApp: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Raffles",
  },
);

export default Raffle;
