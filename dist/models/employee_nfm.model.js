import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Employee from "./employee.model.js";
class EmployeeNonFacultyMember extends Model {
    emp_id;
    workarea;
}
EmployeeNonFacultyMember.init({
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
}, { sequelize, tableName: "employee_nonfaculty_members", timestamps: false });
export default EmployeeNonFacultyMember;
//# sourceMappingURL=employee_nfm.model.js.map