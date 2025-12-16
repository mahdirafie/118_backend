import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Employee from "./employee.model.js";

class User extends Model {
  declare uid: number;
  declare phone: string;
  declare full_name: string;
  declare password: string;
  declare refresh_token: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare Employee?: Employee;
}

User.init(
  {
    uid: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refresh_token : {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  { sequelize, tableName: 'users', timestamps: true }
);

export default User;