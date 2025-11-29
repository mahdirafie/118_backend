import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
class User extends Model {
    uid;
    phone;
    fullname;
    password;
    createdAt;
    updatedAt;
}
User.init({
    uid: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    phone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, { sequelize, tableName: 'users', timestamps: true });
export default User;
//# sourceMappingURL=user.model.js.map