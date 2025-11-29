import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Contactable from "./contactable.model.js";
import User from "./user.model.js";
class Employee extends Model {
    emp_id;
    cid;
    uid;
    personnel_no;
    national_code;
    createdAt;
}
Employee.init({
    emp_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    cid: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: Contactable,
            key: 'cid'
        },
        onDelete: "CASCADE",
    },
    uid: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
        references: {
            model: User,
            key: 'uid'
        },
        onDelete: "CASCADE",
    },
    personnel_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    national_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, { sequelize, tableName: "employees", timestamps: true, updatedAt: false });
export default Employee;
//# sourceMappingURL=employee.model.js.map