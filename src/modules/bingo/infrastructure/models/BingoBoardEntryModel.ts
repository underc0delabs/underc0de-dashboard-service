import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

const BingoBoardEntry = sequelize.define(
  "BingoBoardEntry",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    bingoEventId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    participantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "BingoBoardEntries",
  },
);

export default BingoBoardEntry;
