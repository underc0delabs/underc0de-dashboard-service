import { sequelize } from "../../../../server/DbConnection.js";
import { DataTypes } from "sequelize";

const Event = sequelize.define(
  "Event",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    eventType: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    endTime: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    place: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    modality: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    visibleInApp: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    paranoid: true,
  },
);

export default Event;
