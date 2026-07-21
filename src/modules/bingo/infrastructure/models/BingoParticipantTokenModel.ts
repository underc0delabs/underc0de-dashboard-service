import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

const BingoParticipantToken = sequelize.define(
  "BingoParticipantToken",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    participantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "BingoParticipantTokens",
    updatedAt: false,
  },
);

export default BingoParticipantToken;
