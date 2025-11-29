import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
class Group extends Model {
    gid;
    gname;
    createdAt;
}
Group.init({
    gid: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    gname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, { sequelize, tableName: "groups", timestamps: true, updatedAt: false });
export default Group;
//# sourceMappingURL=group.model.js.map