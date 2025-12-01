import { Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";

export class UserController {
  // user signup
  static async signupUser(req: Request, res: Response) {
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

      user = await User.create({
        phone,
        full_name,
        password: hashedPassword,
      });

      return res.status(201).json({
        message: "کاربر با موفقیت ثبت نام شد!",
        user: {
          full_name: user.full_name,
          phone: user.phone,
        },
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "خطای داخلی سرور!" });
    }
  }
}
