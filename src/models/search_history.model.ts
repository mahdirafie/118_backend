import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.model.js";

class SearchHistory extends Model {
    declare shid: number;
    declare uid: ForeignKey<User['uid']>;
    declare query: string;
    declare no_tries: number;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

SearchHistory.init({
    shid: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true, 
        autoIncrement: true
    },
    uid: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: User,
            key: 'uid'
        }
    },
    query: {
        type: DataTypes.STRING,
        allowNull: false
    },
    no_tries: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
    }
}, {sequelize,tableName: 'search_histories', timestamps: true});

export default SearchHistory;