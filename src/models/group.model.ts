import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import Employee from "./employee.model.js";

class Group extends Model {
  declare gid: number;
  declare gname: string;
  declare emp_id: ForeignKey<Employee['emp_id']>;

  declare members?: Employee[];
  
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
    emp_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Employee,
        key: 'emp_id'
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    }
  },
  { sequelize, tableName: "groups", timestamps: true, updatedAt: false }
);

export default Group;
