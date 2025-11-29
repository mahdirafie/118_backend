import Faculty from "./faculty.model.js";
import sequelize from "../config/database.js";
import { Model, DataTypes, ForeignKey } from "sequelize";

class Department extends Model {
  did!: number;
  dname!: string;
  fid!: ForeignKey<Faculty["fid"]>;

  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

Department.init(
  {
    did: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    dname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fid: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: Faculty,
        key: "fid",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "departments",
    timestamps: true,
  }
);

export default Department;
