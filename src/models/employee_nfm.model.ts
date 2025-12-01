import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import Employee from "./employee.model.js";

class EmployeeNonFacultyMember extends Model {
  declare emp_id: ForeignKey<Employee["emp_id"]>;
  declare workarea: string;
}

EmployeeNonFacultyMember.init(
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
    workarea: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, tableName: "employee_nonfaculty_members", timestamps: false }
);

export default EmployeeNonFacultyMember;
