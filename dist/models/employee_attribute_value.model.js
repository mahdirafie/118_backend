import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import PersonalAttributeValue from "./personal_att_val.model.js";
import Employee from "./employee.model.js";
class EmployeeAttributeValue extends Model {
    val_id;
    emp_id;
}
EmployeeAttributeValue.init({
    val_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        references: {
            model: PersonalAttributeValue,
            key: "val_id",
        },
        onDelete: "CASCADE",
    },
    emp_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: Employee,
            key: "emp_id",
        },
        onDelete: "CASCADE",
    },
}, { sequelize, tableName: "employee_attribute_values", timestamps: false });
export default EmployeeAttributeValue;
//# sourceMappingURL=employee_attribute_value.model.js.map