import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

const User = sequelize.define('User', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    idNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userType: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    birthday: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    fcmToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mpPayerId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    mercadopago_email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_pro: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
    }
})

export default User;