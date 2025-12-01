import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import Contactable from "./contactable.model.js";

class Space extends Model {
    declare cid: ForeignKey<Contactable['cid']>;
    declare sname: string;
    declare room: string;
}

Space.init({
    cid: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        references: {
            model: Contactable,
            key: 'cid'
        },
        onDelete: 'CASCADE'
    },
    sname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    room: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {sequelize, tableName: 'spaces', timestamps: false});

export default Space;