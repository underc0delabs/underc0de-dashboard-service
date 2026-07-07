import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

const RaffleDraw = sequelize.define(
  "RaffleDraw",
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
    drawNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    winnerUserId: {
      type: DataTypes.INTEGER,
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
    tableName: "RaffleDraws",
  },
);

export default RaffleDraw;
