import { DataTypes, ForeignKey, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.model.js";
import { OTPStatus } from "../common/OTPStatus.js";

export class OTP extends Model {
  id!: number;
  created_at!: Date;
  status!: OTPStatus;
  code!: string;
  efforts_remained!: number;
  phone!: string;
}

OTP.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OTPStatus)),
      allowNull: false,
      defaultValue: OTPStatus.NOT_VERIFIED,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    efforts_remained: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 3,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "otps",
    timestamps: false,
  }
);
