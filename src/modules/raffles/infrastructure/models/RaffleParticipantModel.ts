import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

const RaffleParticipant = sequelize.define(
  "RaffleParticipant",
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    enteredAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "RaffleParticipants",
  },
);

export default RaffleParticipant;
