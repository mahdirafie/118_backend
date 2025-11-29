import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import Contactable from "./contactable.model.js";
import User from "./user.model.js";

class Employee extends Model {
  emp_id!: number;
  cid!: ForeignKey<Contactable["cid"]>;
  uid!: ForeignKey<User["uid"]>;
  personnel_no!: string;
  national_code!: string;

  readonly createdAt!: Date;
}

Employee.init(
  {
    emp_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    cid: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: Contactable,
            key: 'cid'
        },
        onDelete: "CASCADE",
    },
    uid: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
        references: {
            model: User,
            key: 'uid'
        },
        onDelete: "CASCADE",
    },
    personnel_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    national_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
  },
  { sequelize, tableName: "employees", timestamps: true, updatedAt: false }
);

export default Employee;
