import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import Contactable from "./contactable.model.js";
import FavoriteCategory from "./favorite_category.model.js";

class Favorite extends Model {
    cid!: ForeignKey<Contactable['cid']>;
    favcat_id!: ForeignKey<FavoriteCategory['favcat_id']>;
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
}, {sequelize, tableName: 'favorites', timestamps: false});

export default Favorite;