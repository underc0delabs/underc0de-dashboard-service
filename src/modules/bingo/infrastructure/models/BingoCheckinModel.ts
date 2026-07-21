import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

const BingoCheckin = sequelize.define(
  "BingoCheckin",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    boardEntryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    bingoStandId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    checkedInAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "BingoCheckins",
  },
);

export default BingoCheckin;
