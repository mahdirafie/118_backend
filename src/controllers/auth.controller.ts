import { Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import Employee from "../models/employee.model.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../common/token.service.js";
import { Op, where } from "sequelize";
import sequelize from "../config/database.js";
import Contactable from "../models/contactable.model.js";
import FavoriteCategory from "../models/favorite_category.model.js";
import { sendSMS } from "../config/sms.js";
import { OTP } from "../models/otp.model.js";
import { OTPStatus } from "../common/OTPStatus.js";
import EmployeeFacultyMemeber from "../models/employee_fm.model.js";
import EmployeeNonFacultyMember from "../models/employee_nfm.model.js";
import Department from "../models/department.model.js";
import PersonalAttributeValue from "../models/personal_att_val.model.js";
import PersonalAttribute from "../models/personal_att.model.js";

export class AuthController {
  // user signup
  static async signupUser(req: Request, res: Response) {
    try {
      const { phone, full_name, password } = req.body;

      if (!phone || !full_name || !password) {
        return res
          .status(400)
          .json({ message: "لطفا همه داده های مورد نیاز را وارد نمایید!" });
      }

      const existingUser = await User.findOne({ where: { phone } });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "کاربر وجود دارد. لطفا وارد شوید!" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const t = await sequelize.transaction();

      try {
        const user = await User.create(
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
        await t.rollback();
        throw error;
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "خطای داخلی سرور!" });
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
        emp_id: employee? employee.emp_id : null
      };

      const accessToken = createAccessToken(payload);
      const refreshToken = createRefreshToken(payload);

      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

      // Store refresh token in DB
      await user.update({ refresh_token: hashedRefreshToken });

      return res.status(200).json({
        message: employee
          ? "ورود موفقیت آمیز (کاربر کارمند)"
          : "ورود موفقیت آمیز (کاربر عمومی)",
        user_type: employee ? "employee" : "general",
        user_id: user.uid,
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

  // refresh the access token and refresh token
  static async refreshToken(req: Request, res: Response) {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ message: "ارسال رفرش توکن الزامی است!" });
    }

    try {
      // Decode token (signature and validity)
      const payload: any = verifyRefreshToken(refresh_token);

      // Load user
      const user = await User.findOne({ where: { uid: payload.uid } });
      if (!user || !user.refresh_token) {
        return res.status(401).json({ message: "Refresh token invalid" });
      }

      // Compare hashed refresh token
      const isMatch = await bcrypt.compare(refresh_token, user.refresh_token);
      if (!isMatch) {
        return res.status(401).json({ message: "Refresh token invalid or rotated" });
      }

      // Create new tokens
      const newAccessToken = createAccessToken({
        uid: payload.uid,
        type: payload.type,
        emp_id: payload.emp_id
      });

      const newRefreshToken = createRefreshToken({
        uid: payload.uid,
        type: payload.type,
        emp_id: payload.emp_id
      });

      // Hash and store the new refresh token (rotation)
      const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);

      await User.update(
        { refresh_token: hashedRefresh },
        { where: { uid: payload.uid } }
      );
      return res.status(200).json({
        message: "توکن ها نوسازی شدند!",
        access_token: newAccessToken,
        refresh_token: newRefreshToken, // plain version for client
      });
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }
  }

  // TEST create an Emlpoyee
  static async createEmployee(req: Request, res: Response) {
    try {
      const { national_code, personnel_no, phone, full_name } = req.body;

      if (!national_code || !personnel_no || !phone || !full_name) {
        return res.status(400).json({
          message: "اطلاعات وارد شده کافی نیست. لطفا همه موارد را پر کنید!",
        });
      }

      const check1 = await User.findOne({ where: { phone } });
      if (check1) {
        return res
          .status(400)
          .json({ message: `کاربر با این شماره وجود دارد! ${phone}` });
      }

      const check2 = await Employee.findOne({
        where: {
          [Op.or]: [
            { national_code: national_code },
            { personnel_no: personnel_no },
          ],
        },
      });
      if (check2) {
        return res
          .status(400)
          .json({ message: "کارمند قبلا در سیستم ثبت شده است!" });
      }

      const t = await sequelize.transaction();

      try {
        const contactable = await Contactable.create({}, { transaction: t });

        // hash the password for the user
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
        await t.rollback();
        throw error;
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "خطای داخلی سرور" });
    }
  }

  // register faculty member employee
  static async registerFacultyEmployee(req: Request, res: Response) {
    try {
      const { national_code, personnel_no, phone, full_name, did } = req.body;

      if (!national_code || !personnel_no || !phone || !full_name || !did) {
        return res.status(400).json({
          message: "اطلاعات وارد شده کافی نیست. لطفا همه موارد را پر کنید!",
        });
      }

      const dep = await Department.findOne({ where: { did } });
      if (!dep) {
        return res
          .status(400)
          .json({ message: "چنین دپارتمانی وجود ندارد!" });
      }

      const check1 = await User.findOne({ where: { phone } });
      if (check1) {
        return res
          .status(400)
          .json({ message: `کاربر با این شماره وجود دارد! ${phone}` });
      }

      const check2 = await Employee.findOne({
        where: {
          [Op.or]: [
            { national_code: national_code },
            { personnel_no: personnel_no },
          ],
        },
      });
      if (check2) {
        return res
          .status(400)
          .json({ message: "کارمند قبلا در سیستم ثبت شده است!" });
      }

      const t = await sequelize.transaction();

      try {
        const contactable = await Contactable.create({}, { transaction: t });

        // hash the password for the user
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

        // create faculty member employee
        await EmployeeFacultyMemeber.create(
          { did: did, emp_id: employee.emp_id },
          { transaction: t }
        );

        // create the personal attribute values
        const attributes = await PersonalAttribute.findAll({
          attributes: ['att_id'],
          transaction: t
        });

        const attValues = attributes.map((att) => ({
          emp_id: employee.emp_id,
          value: null,
          att_id: att.att_id
        }));

        await PersonalAttributeValue.bulkCreate(attValues, { transaction: t });

        await t.commit();

        return res
          .status(201)
          .json({ message: "کاربر با موفقیت ثبت نام شد!" });
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "خطای داخلی سرور!" });
    }
  }

  // register non-faculty member employee
  static async registerNonFacultyEmployee(req: Request, res: Response) {
    try {
      const { national_code, personnel_no, phone, full_name, workarea } = req.body;

      if (!national_code || !personnel_no || !phone || !full_name || !workarea) {
        return res.status(400).json({
          message: "اطلاعات وارد شده کافی نیست. لطفا همه موارد را پر کنید!",
        });
      }

      const check1 = await User.findOne({ where: { phone } });
      if (check1) {
        return res
          .status(400)
          .json({ message: `کاربر با این شماره وجود دارد! ${phone}` });
      }

      const check2 = await Employee.findOne({
        where: {
          [Op.or]: [
            { national_code: national_code },
            { personnel_no: personnel_no },
          ],
        },
      });
      if (check2) {
        return res
          .status(400)
          .json({ message: "کارمند قبلا در سیستم ثبت شده است!" });
      }

      const t = await sequelize.transaction();

      try {
        const contactable = await Contactable.create({}, { transaction: t });

        // hash the password for the user
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

        // create non-faculty employee
        await EmployeeNonFacultyMember.create(
          { workarea: workarea, emp_id: employee.emp_id },
          { transaction: t }
        );

        // create the personal attribute values
        const attributes = await PersonalAttribute.findAll({
          attributes: ['att_id'],
          transaction: t
        });

        const attValues = attributes.map((att) => ({
          emp_id: employee.emp_id,
          value: null,
          att_id: att.att_id
        }));

        await PersonalAttributeValue.bulkCreate(attValues, { transaction: t });

        await t.commit();

        return res
          .status(201)
          .json({ message: "کاربر با موفقیت ثبت نام شد!" });
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "خطای داخلی سرور!" });
    }
  }

  // send otp
  static async sendOTP(req: Request, res: Response) {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res
          .status(400)
          .json({ message: "شماره همراه ضروری است!" });
      }

      const user = await User.findOne({
        where: {
          phone
        }
      });

      if (user) {
        return res.status(400).json({ message: "شما در حال حاضر حساب کاربری دارید. لطفا وارد شوید!" });
      }

      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

      // delete all the expired codes.
      await OTP.destroy({
        where: {
          created_at: {
            [Op.lt]: twoMinutesAgo,
          },
        },
      });

      // check if there is any valid , not expired code for the user
      const otp = await OTP.findOne({
        where: {
          phone,
          created_at: {
            [Op.gt]: twoMinutesAgo,
          },
        },
      });

      if (otp !== null) {
        const remainingSeconds = Math.max(
          0,
          Math.ceil(
            (otp.created_at.getTime() + 2 * 60 * 1000 - Date.now()) / 1000
          )
        );
        return res.status(400).json({ message: `${remainingSeconds} ثانیه دیگر دوباره امتحان کنید.` });
      }

      const otpCode = Math.floor(Math.random() * 9000 + 1000);
      const hashedCode = await bcrypt.hash(otpCode.toString(), 10);

      await OTP.create({
        code: hashedCode,
        phone,
      });

      const message = `کد تایید شما: ${otpCode}\nدانشگاه بوعلی سینا`;
      await sendSMS(phone, message);

      return res.status(200).json({ message: "کد با موفقیت ارسال شد!" });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "خطای داخلی سرور!" });
    }
  }

  // verify otp
  static async verifyOTP(req: Request, res: Response) {
    try {
      const { phone, code } = req.body;

      if (!phone || !code) {
        return res
          .status(400)
          .json({ message: "شماره همراه و کد الزامی هستند!" });
      }

      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const otp = await OTP.findOne({
        where: {
          phone,
          created_at: {
            [Op.gt]: twoMinutesAgo,
          },
        },
      });

      if (!otp) {
        return res.status(404).json({
          message: "کد منسوخ شده یا وجود ندارد. دوباره درخواست کد دهید.",
        });
      }

      const isCodeRight = await bcrypt.compare(code, otp.code);

      if (!isCodeRight) {
        otp.efforts_remained = otp.efforts_remained - 1;
        await otp.save();

        if (otp.efforts_remained === 0) {
          return res.status(400).json({
            message:
              "تعداد تلاش های اشتباه بیش از حد مجاز شد. لطفا دوباره درخواست کد بدهید.",
          });
        }

        return res.status(400).json({
          message: "کد وارد شده درست نمی باشد!",
        });
      }

      // change the OTP status
      otp.status = OTPStatus.VERIFIED;
      await otp.save();

      return res.status(200).json({ message: "کد تایید شد!" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "خطای داخلی سرور!" });
    }
  }
}
