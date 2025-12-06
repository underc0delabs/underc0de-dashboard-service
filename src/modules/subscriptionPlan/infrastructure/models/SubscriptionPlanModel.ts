import { sequelize } from "../../../../server/DbConnection";
import { DataTypes } from "sequelize";
import User from "../../../users/infrastructure/models/UserModel";

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['active', 'canceled', 'expired', 'pending']]
        }
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    mpSubscriptionId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mpPreapprovalId: {
        type: DataTypes.STRING,
        allowNull: true
    }
})

SubscriptionPlan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default SubscriptionPlan;

