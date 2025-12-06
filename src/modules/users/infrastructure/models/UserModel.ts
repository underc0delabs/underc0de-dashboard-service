import { sequelize } from "../../../../server/DbConnection";
import { DataTypes } from "sequelize";

const User = sequelize.define('User', {
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
    suscription: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status:{
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: true
    }
})

export default User;