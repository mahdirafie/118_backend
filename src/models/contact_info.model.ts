import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import Contactable from "./contactable.model.js";

class ContactInfo extends Model {
  declare contact_number: string;
  declare range: string | null;
  declare subrange: string | null;
  declare forward: string | null;
  declare extension: string | null;
  declare cid: ForeignKey<Contactable["cid"]>;
}

ContactInfo.init(
  {
    contact_number: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    range: {
        type: DataTypes.STRING,
        allowNull: true
    },
    subrange: {
        type: DataTypes.STRING,
        allowNull: true
    },
    forward: {
        type: DataTypes.STRING,
        allowNull: true
    },
    extension: {
        type: DataTypes.STRING,
        allowNull: true
    },
    cid: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: Contactable,
            key: 'cid'
        },
        onDelete: "CASCADE",
    }
  },
  { sequelize, tableName: "contact_infos", timestamps: false }
);

export default ContactInfo;
