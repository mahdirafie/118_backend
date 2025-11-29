import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "../config/database.js";
import Employee from "./employee.model.js";
import Space from "./space.model.js";
import Post from "./post.model.js";

class ESPRelationship extends Model {
  esp_id!: number;
  emp_id!: ForeignKey<Employee["emp_id"]>;
  sid!: ForeignKey<Space["cid"]>;
  pid!: ForeignKey<Post["cid"]>;
}

ESPRelationship.init(
  {
    esp_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    emp_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: Employee,
        key: "emp_id",
      },
      onDelete: "CASCADE",
    },
    sid: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: Space,
            key: 'cid'
        },
        onDelete: 'CASCADE'
    },
    pid: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: Post,
            key: 'cid'
        },
        onDelete: "CASCADE"
    }
  },
  { sequelize, tableName: "esp_relationships", timestamps: false }
);

export default ESPRelationship;
