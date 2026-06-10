import { DataTypes } from "sequelize";
import { sequelize } from "../../../../server/DbConnection.js";

const UserFollow = sequelize.define("UserFollow", {
  id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: new Date(),
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: new Date(),
  },
});

export default UserFollow;
