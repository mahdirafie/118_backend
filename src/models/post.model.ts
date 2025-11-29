import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import Contactable from "./contactable.model.js";

class Post extends Model {
  cid!: ForeignKey<Contactable["cid"]>;
  pname!: string;
  description!: string;
}

Post.init(
  {
    cid: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      references: {
        model: Contactable,
        key: "cid",
      },
      onDelete: "CASCADE",
    },
    pname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, tableName: "posts", timestamps: false }
);

export default Post;
