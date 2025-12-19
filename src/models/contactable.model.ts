import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Employee from "./employee.model.js";
import Post from "./post.model.js";
import Space from "./space.model.js";
import FavoriteCategory from "./favorite_category.model.js";
import ContactInfo from "./contact_info.model.js";

class Contactable extends Model {
  declare cid: number;

  declare Employee?: Employee;
  declare Post?: Post;
  declare Space?: Space;

  declare FavoriteCategories?: FavoriteCategory[];
  declare ContactInfos?: ContactInfo[];
}

Contactable.init(
  {
    cid: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    }
  },
  { sequelize, tableName: "contactables", timestamps: false }
);

export default Contactable;