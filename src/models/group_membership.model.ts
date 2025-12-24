import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import Employee from "./employee.model.js";
import Group from "./group.model.js";

class GroupMembership extends Model {
  declare emp_id: ForeignKey<Employee["emp_id"]>;
  declare gid: ForeignKey<Group["gid"]>;

  declare readonly createdAt?: Date;
  
  declare Group?: Group;
}

GroupMembership.init(
  {
    emp_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      references: {
        model: Employee,
        key: "emp_id",
      },
      onDelete: "CASCADE",
    },
    gid: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      references: {
        model: Group,
        key: "gid",
      },
      onDelete: "CASCADE",
    },
  },
  { sequelize, tableName: "group_memberships", timestamps: true, updatedAt: false }
);

export default GroupMembership;
