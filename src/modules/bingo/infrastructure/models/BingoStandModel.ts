import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

const BingoStand = sequelize.define(
  "BingoStand",
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
    merchantId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  },
  {
    tableName: "BingoStands",
  },
);

export default BingoStand;
