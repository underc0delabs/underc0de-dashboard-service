import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

const SubscriptionPlan = sequelize.define("SubscriptionPlan", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "CANCELLED"),
      allowNull: false,
    },
  
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  
    nextPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  
    mpPreapprovalId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });

export default SubscriptionPlan;

