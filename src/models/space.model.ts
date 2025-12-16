import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import Contactable from "./contactable.model.js";
import Faculty from "./faculty.model.js";

class Space extends Model {
    declare cid: ForeignKey<Contactable['cid']>;
    declare sname: string;
    declare room: string;
    declare fid: ForeignKey<Faculty['fid']> | null;
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
    },
    fid: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: Faculty,
            key: 'fid'
        }
    }
}, { sequelize, tableName: 'spaces', timestamps: false });

export default Space;