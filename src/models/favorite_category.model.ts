import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.model.js";

class FavoriteCategory extends Model {
  favcat_id!: number;
  title!: string;
  uid!: ForeignKey<User["uid"]>;

  readonly createdAt!: Date;
}

FavoriteCategory.init(
  {
    favcat_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: "uid",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "favorite_categories",
    timestamps: true,
    updatedAt: false,
  }
);

export default FavoriteCategory;