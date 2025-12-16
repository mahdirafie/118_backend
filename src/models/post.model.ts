import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import Contactable from "./contactable.model.js";
import Faculty from "./faculty.model.js";

class Post extends Model {
  declare cid: ForeignKey<Contactable["cid"]>;
  declare pname: string;
  declare description: string;
  declare fid: ForeignKey<Faculty['fid']> | null;
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
    fid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: Faculty,
        key: 'fid'
      }
    }
  },
  { sequelize, tableName: "posts", timestamps: false }
);

export default Post;
