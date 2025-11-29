import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
class Faculty extends Model {
    fid;
    fname;
    createdAt;
    updatedAt;
}
Faculty.init({
    fid: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    fname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: "faculties",
    timestamps: true,
});
export default Faculty;
//# sourceMappingURL=faculty.model.js.map