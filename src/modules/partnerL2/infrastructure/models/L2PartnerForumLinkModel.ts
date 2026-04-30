import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

const L2PartnerForumLink = sequelize.define(
  "L2PartnerForumLink",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    l2UserExternalId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    forumMemberId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    forumUsernameNormalized: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    forumEmailSnippet: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "linked",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "L2PartnerForumLinks",
  }
);

export default L2PartnerForumLink;
