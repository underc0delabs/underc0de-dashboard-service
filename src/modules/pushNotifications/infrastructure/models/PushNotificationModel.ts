import { sequelize } from "../../../../server/DbConnection";
import { DataTypes } from "sequelize";
import AdminUser from "../../../adminUsers/infrastructure/models/AdminUserModel";

const PushNotification = sequelize.define('PushNotification', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    audience: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['todos', 'usersPro', 'normalUsers']]
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'draft',
        validate: {
            isIn: [['draft', 'sent']]
        }
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AdminUser,
            key: 'id'
        }
    },
    modifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: AdminUser,
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
})

PushNotification.belongsTo(AdminUser, { foreignKey: 'createdBy', as: 'creator' });
PushNotification.belongsTo(AdminUser, { foreignKey: 'modifiedBy', as: 'modifier' });

export default PushNotification;

