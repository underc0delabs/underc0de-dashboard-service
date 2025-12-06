import { sequelize } from "../../../../server/DbConnection";
import { DataTypes } from "sequelize";

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
        allowNull: false
    },
    modifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
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

export default PushNotification;

