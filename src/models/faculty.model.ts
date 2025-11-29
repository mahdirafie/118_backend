import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Faculty extends Model {
  fid!: number;
  fname!: string;

  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

Faculty.init(
  {
    fid: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    fname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "faculties",
    timestamps: true,
  }
);

export default Faculty;
