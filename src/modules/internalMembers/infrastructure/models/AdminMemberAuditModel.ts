import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

const AdminMemberAudit = sequelize.define(
  "AdminMemberAudit",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    internalMemberId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    adminUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payloadJson: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { timestamps: false }
);

export default AdminMemberAudit;
