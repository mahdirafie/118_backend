import { Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import Employee from "../models/employee.model.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../common/token.service.js";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import Contactable from "../models/contactable.model.js";
import FavoriteCategory from "../models/favorite_category.model.js";

export class AuthController {
  // user signup
  static async signupUser(req: Request, res: Response) {
    const t = await sequelize.transaction();
    try {
      const { phone, full_name, password } = req.body;
      if (!phone || !full_name || !password) {
        return res
          .status(400)
          .json({ message: "لطفا همه داده های مورد نیاز را وارد نمایید!" });
      }

      let user = await User.findOne({ where: { phone } });
      if (user) {
        return res
          .status(400)
          .json({ message: "کاربر وجود دارد. لطفا وارد شوید!" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user = await User.create(
        {
          phone,
          full_name,
          password: hashedPassword,
        },
        { transaction: t }
      );

      await FavoriteCategory.create(
        { uid: user.uid, title: "همه" },
        { transaction: t }
      );

      await t.commit();

      return res.status(201).json({
        message: "کاربر با موفقیت ثبت نام شد!",
        user: {
          full_name: user.full_name,
          phone: user.phone,
        },
      });
    } catch (error) {
      console.error(error);
      await t.rollback();
      res.status(500).json({ message: "خطای داخلی سرور!" });
    }
  }

  // user(general users and employees) login
  static async loginUser(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "لطفا نام کاربری و رمز عبور خود را وارد نمایید." });
      }

      // Step 1:
      let employee = await Employee.findOne({
        where: {
          [Op.or]: [{ personnel_no: username }, { national_code: username }],
        },
      });

      let user: any = null;

      // Step 2: If not employee, check phone
      if (!employee) {
        user = await User.findOne({ where: { phone: username } });

        if (!user) {
          return res.status(404).json({ message: "کاربر پیدا نشد!" });
        }

        employee = await Employee.findOne({ where: { uid: user.uid } });
      } else {
        user = await User.findOne({ where: { uid: employee.uid } });

        if (!user) {
          return res
            .status(400)
            .json({ message: "اطلاعات کاربری مرتبط با کارمند پیدا نشد!" });
        }
      }

      // Step 3: Password check
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res
          .status(400)
          .json({ message: "کاربر محترم. گذرواژه یا نام کاربری اشتباه است." });
      }

      // Step 4: Create JWT tokens
      const payload = {
        uid: user.uid,
        type: employee ? "employee" : "general",
      };

      const accessToken = createAccessToken(payload);
      const refreshToken = createRefreshToken(payload);

      // Store refresh token in DB
      await user.update({ refresh_token: refreshToken });

      const userInfo = user.get();
      delete userInfo.password;
      delete userInfo.refresh_token;

      return res.status(200).json({
        message: employee
          ? "ورود موفقیت آمیز (کاربر کارمند)"
          : "ورود موفقیت آمیز (کاربر عمومی)",
        user_type: employee ? "employee" : "general",
        employee: employee ?? undefined,
        user: !employee ? userInfo : undefined,
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "خطای داخلی سرور!" });
    }
  }

  // refresh the access token
  static async refreshToken(req: Request, res: Response) {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ message: "ارسال رفرش توکن الزامی است!" });
    }

    try {
      const payload: any = verifyRefreshToken(refresh_token);

      // Create ONLY new access token
      const newAccessToken = createAccessToken({ id: payload.id });

      return res.status(200).json({
        message: "Access token نوسازی شد!",
        access_token: newAccessToken,
      });
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }
  }

  // TEST create an Emlpoyee
  static async createEmployee(req: Request, res: Response) {
    const t = await sequelize.transaction();
    try {
      const { national_code, personnel_no, phone, full_name } = req.body;

      if (!national_code || !personnel_no || !phone || !full_name) {
        return res.status(400).json({
          message: "اطلاعات وارد شده کافی نیست. لطفا همه موارد را پر کنید!",
        });
      }

      const contactable = await Contactable.create({}, { transaction: t });

      //hash the password for the user
      const hashedPassword = await bcrypt.hash(national_code, 10);
      const user = await User.create(
        { phone, full_name, password: hashedPassword },
        { transaction: t }
      );

      await FavoriteCategory.create(
        { uid: user.uid, title: "همه" },
        { transaction: t }
      );

      const employee = await Employee.create(
        {
          national_code,
          cid: contactable.cid,
          uid: user.uid,
          personnel_no,
        },
        { transaction: t }
      );

      await t.commit();

      return res
        .status(201)
        .json({ message: "کارمند با موفقیت ثبت نام شد!", employee });
    } catch (error) {
      console.error(error);
      await t.rollback();
      return res.status(500).json({ message: "خطای داخلی سرور" });
    }
  }
}
