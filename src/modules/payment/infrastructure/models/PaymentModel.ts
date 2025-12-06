import { sequelize } from "../../../../server/DbConnection";
import { DataTypes } from "sequelize";
import SubscriptionPlan from "../../../subscriptionPlan/infrastructure/models/SubscriptionPlanModel";

const Payment = sequelize.define('Payment', {
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
            model: SubscriptionPlan,
            key: 'id'
        }
    },
    mpPaymentId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['approved', 'refused', 'pending', 'cancelled', 'refunded']]
        }
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
})

Payment.belongsTo(SubscriptionPlan, { foreignKey: 'userSubscriptionId', as: 'subscriptionPlan' });

export default Payment;

