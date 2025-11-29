import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
export var PersonalAttributeType;
(function (PersonalAttributeType) {
    PersonalAttributeType["NUMBER"] = "number";
    PersonalAttributeType["STRING"] = "string";
    PersonalAttributeType["BOOLEAN"] = "bool";
})(PersonalAttributeType || (PersonalAttributeType = {}));
class PersonalAttribute extends Model {
    att_id;
    type;
    att_name;
    createdAt;
    updatedAt;
}
PersonalAttribute.init({
    att_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.ENUM(...Object.values(PersonalAttributeType)),
        allowNull: false,
    },
    att_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, { sequelize, tableName: "personal_attributes", timestamps: true });
export default PersonalAttribute;
//# sourceMappingURL=personal_att.model.js.map