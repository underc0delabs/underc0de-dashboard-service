import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

const BingoRaffleEntry = sequelize.define(
  "BingoRaffleEntry",
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
    enteredAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "BingoRaffleEntries",
  },
);

export default BingoRaffleEntry;
