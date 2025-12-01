import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export enum PersonalAttributeType {
  NUMBER = "number",
  STRING = "string",
  BOOLEAN = "bool",
}

class PersonalAttribute extends Model {
  declare att_id: number;
  declare type: PersonalAttributeType;
  declare att_name: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

PersonalAttribute.init(
  {
    att_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(PersonalAttributeType)),
      allowNull: false,
    },
    att_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, tableName: "personal_attributes", timestamps: true }
);

export default PersonalAttribute;