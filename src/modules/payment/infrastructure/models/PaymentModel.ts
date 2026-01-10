import { sequelize } from "../../../../server/DbConnection";
import { DataTypes } from "sequelize";

const Payment = sequelize.define("Payment", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  userSubscriptionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "SubscriptionPlans",
      key: "id",
    },
  },
  mpPaymentId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      "approved",
      "pending",
      "rejected",
      "cancelled",
      "refunded"
    ),
    allowNull: false,
  },  
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "ARS",
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

export default Payment;
