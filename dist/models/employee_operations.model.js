import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Employee from "./employee.model.js";
class EmployeeOperation extends Model {
    emp_id;
    operation;
}
EmployeeOperation.init({
    emp_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        references: {
            model: Employee,
            key: 'emp_id'
        },
        onDelete: "CASCADE"
    },
    operation: {
        type: DataTypes.STRING,
        primaryKey: true
    }
}, { sequelize, tableName: "employee_operations", timestamps: false });
export default EmployeeOperation;
//# sourceMappingURL=employee_operations.model.js.map