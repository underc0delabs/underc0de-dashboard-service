import { sequelize } from "../../../../server/DbConnection";
import { DataTypes } from "sequelize";

const AdminUser = sequelize.define('AdminUser', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
    name:{
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
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status:{
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: true
    }
})

export default AdminUser;