import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

const Merchant = sequelize.define('Merchant', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    },
    category: {
        type: DataTypes.UUID,
        allowNull: true
    },
    logo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    usersProDisccount: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    usersDisccount: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    detail: {
        type: DataTypes.STRING,
        allowNull: true
    }
})

export default Merchant;

