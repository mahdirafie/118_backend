import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import Group from "./group.model.js";
import PersonalAttributeValue from "./personal_att_val.model.js";

class SharesToGroup extends Model {
    declare val_id: ForeignKey<PersonalAttributeValue['val_id']>;
    declare gid: ForeignKey<Group['gid']>;
    
    declare readonly createdAt: Date; // sent at time
}

SharesToGroup.init({
    val_id : {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        references: {
            model: PersonalAttributeValue,
            key: 'val_id'
        },
        onDelete: "CASCADE",
    },
    gid: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        references: {
            model: Group,
            key: 'gid'
        },
        onDelete: "CASCADE",
    },
}, {sequelize, tableName: 'shares_to_group', timestamps: true, updatedAt: false});

export default SharesToGroup;