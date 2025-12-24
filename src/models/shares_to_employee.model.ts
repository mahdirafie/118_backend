import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import PersonalAttributeValue from "./personal_att_val.model.js";
import Employee from "./employee.model.js";

class SharesToEmployee extends Model {
  declare val_id: ForeignKey<PersonalAttributeValue["val_id"]>;
  declare receiver_emp_id: ForeignKey<Employee["emp_id"]>;

  declare readonly createdAt: Date;
}

SharesToEmployee.init(
  {
    val_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      references: {
        model: PersonalAttributeValue,
        key: "val_id",
      },
      onDelete: "CASCADE",
    },
    receiver_emp_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      references: {
        model: Employee,
        key: "emp_id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "shares_to_employee",
    timestamps: true,
    updatedAt: false,
  }
);

export default SharesToEmployee;
