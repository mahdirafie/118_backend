import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
class Contactable extends Model {
    cid;
}
Contactable.init({
    cid: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    }
}, { sequelize, tableName: "contactables", timestamps: false });
export default Contactable;
//# sourceMappingURL=contactable.model.js.map