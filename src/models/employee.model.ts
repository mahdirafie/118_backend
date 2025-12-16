import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import Contactable from "./contactable.model.js";
import User from "./user.model.js";
import EmployeeFacultyMemeber from "./employee_fm.model.js";
import EmployeeNonFacultyMember from "./employee_nfm.model.js";

class Employee extends Model {
  declare emp_id: number;
  declare cid: ForeignKey<Contactable["cid"]>;
  declare uid: ForeignKey<User["uid"]>;
  declare personnel_no: string;
  declare national_code: string;

  declare readonly createdAt: Date;

  declare EmployeeFacultyMemeber?: EmployeeFacultyMemeber;
  declare EmployeeNonFacultyMember?: EmployeeNonFacultyMember;
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
