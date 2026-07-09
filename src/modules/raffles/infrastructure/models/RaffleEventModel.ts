import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

export const RAFFLE_EVENT_TYPE = {
  CREATED: "created",
  PUBLISHED: "published",
  ENTERED: "entered",
  PARTICIPATION_CLOSED: "participation_closed",
  DRAWN: "drawn",
  REDRAWN: "redrawn",
  PRIZE_CLAIMED: "prize_claimed",
  CLAIM_EXPIRED: "claim_expired",
  DELETED: "deleted",
  DUPLICATED: "duplicated",
} as const;

const RaffleEvent = sequelize.define(
  "RaffleEvent",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    raffleId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    actorType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "system",
    },
    actorId: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
  },
  {
    tableName: "RaffleEvents",
    updatedAt: true,
    createdAt: true,
  },
);

export default RaffleEvent;
