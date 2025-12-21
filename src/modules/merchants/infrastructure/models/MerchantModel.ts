import { sequelize } from "../../../../server/DbConnection";
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
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
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
    }
})

export default Merchant;

