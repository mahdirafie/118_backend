import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Employee from "./employee.model.js";
import Group from "./group.model.js";
class GroupMembership extends Model {
    emp_id;
    gid;
}
GroupMembership.init({
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
}, { sequelize, tableName: "group_membership", timestamps: false });
export default GroupMembership;
//# sourceMappingURL=group_membership.model.js.map