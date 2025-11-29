import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
class Favorite extends Model {
    cid;
    favcat_id;
}
Favorite.init({
    cid: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
    },
    favcat_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true
    }
}, { sequelize, tableName: 'favorites', timestamps: false });
export default Favorite;
//# sourceMappingURL=favorite.model.js.map