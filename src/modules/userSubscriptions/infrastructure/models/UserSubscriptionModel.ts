import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes, Model } from "sequelize";

export interface IUserSubscription {
  id: string;
  userId: number;
  mpPreapprovalId: string;
  status: 'pending' | 'authorized' | 'paused' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

class UserSubscription extends Model<IUserSubscription> implements IUserSubscription {
  public id!: string;
  public userId!: number;
  public mpPreapprovalId!: string;
  public status!: 'pending' | 'authorized' | 'paused' | 'cancelled';
  public createdAt!: Date;
  public updatedAt!: Date;
}

UserSubscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    mpPreapprovalId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'authorized', 'paused', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "UserSubscription",
    tableName: "UserSubscriptions",
    timestamps: true,
  }
);

export default UserSubscription;
