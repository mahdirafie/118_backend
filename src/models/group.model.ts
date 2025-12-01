import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Group extends Model {
  declare gid: number;
  declare gname: string;

  declare readonly createdAt: Date;
}

Group.init(
  {
    gid: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    gname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, tableName: "groups", timestamps: true, updatedAt: false }
);

export default Group;
