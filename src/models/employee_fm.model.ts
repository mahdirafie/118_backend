import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import Employee from "./employee.model.js";
import Department from "./department.model.js";

class EmployeeFacultyMemeber extends Model {
  declare emp_id: ForeignKey<Employee["emp_id"]>;
  declare did: ForeignKey<Department["did"]>;

  declare Department?: Department;
}

EmployeeFacultyMemeber.init(
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
    did: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Department,
        key: "did",
      },
      onDelete: "CASCADE",
    },
  },
  { sequelize, tableName: "employee_faculty_members", timestamps: false }
);

export default EmployeeFacultyMemeber;
