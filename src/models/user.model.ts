import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class User extends Model {
  uid!: number;
  phone!: string;
  fullname!: string;
  password!: string;

  readonly createdAt!: Date;
  readonly updatedAt!: Date;
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
  },
  { sequelize, tableName: 'users', timestamps: true }
);

export default User;