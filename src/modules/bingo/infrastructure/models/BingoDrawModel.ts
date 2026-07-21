import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

const BingoDraw = sequelize.define(
  "BingoDraw",
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
    winnerParticipantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    participantCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    drawnByAdminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    drawnAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    superseded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "BingoDraws",
  },
);

export default BingoDraw;
