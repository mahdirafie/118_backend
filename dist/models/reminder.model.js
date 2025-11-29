import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Contactable from "./contactable.model.js";
import Employee from "./employee.model.js";
class Reminder extends Model {
    cid;
    emp_id;
    time;
}
Reminder.init({
    cid: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        references: {
            model: Contactable,
            key: "cid",
        },
        onDelete: "CASCADE",
    },
    emp_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        references: {
            model: Employee,
            key: "emp_id",
        },
        onDelete: "CASCADE",
    },
    time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, { sequelize, tableName: "reminders", timestamps: false });
export default Reminder;
//# sourceMappingURL=reminder.model.js.map