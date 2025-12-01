import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Faculty extends Model {
  declare fid: number;
  declare fname: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
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
