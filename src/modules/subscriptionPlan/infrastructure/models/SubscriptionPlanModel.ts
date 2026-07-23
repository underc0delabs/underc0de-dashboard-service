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
      type: DataTypes.ENUM(
        "ACTIVE",
        "CANCELLED",
        "PENDING",
        "EXPIRED",
        "PAYMENT_FAILED"
      ),
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
    provider: {
      type: DataTypes.ENUM("mercadopago", "apple"),
      allowNull: false,
      defaultValue: "mercadopago",
    },
    productId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    originalTransactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    environment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastValidatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

export default SubscriptionPlan;
