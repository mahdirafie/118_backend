import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import PersonalAttribute from "./personal_att.model.js";
import Employee from "./employee.model.js";

class PersonalAttributeValue extends Model {
  val_id!: number;
  value!: string;
  is_sharable!: boolean;
  att_id!: ForeignKey<PersonalAttribute["att_id"]>;
  emp_id!: ForeignKey<Employee['emp_id']>;
}

PersonalAttributeValue.init(
  {
    val_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_sharable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    att_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: PersonalAttribute,
            key: 'att_id'
        },
        onDelete: "CASCADE",
    },
    emp_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Employee,
        key: 'emp_id'
      },
      onDelete: 'CASCADE'
    }
  },
  { sequelize, tableName: "personal_attribute_values", timestamps: false }
);

export default PersonalAttributeValue;