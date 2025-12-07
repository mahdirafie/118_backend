import { Request, Response } from "express";
import FavoriteCategory from "../models/favorite_category.model.js";
import Favorite from "../models/favorite.model.js";

export class FavoriteController {
  static async addFavoriteCategory(req: Request, res: Response) {
    try {
      const { user_id, category_title } = req.body;
      if (!user_id || !category_title) {
        return res
          .status(400)
          .json({ message: "لطفا همه اطلاعات مورد نیاز را وارد نمایید!" });
      }

      const doesExist = await FavoriteCategory.findOne({
        where: { title: category_title, uid: user_id },
      });
      if (doesExist) {
        return res
          .status(400)
          .json({ message: "یک دسته بندی با این نام وجود دارد!" });
      }

      const favCat = await FavoriteCategory.create({
        title: category_title,
        uid: user_id,
      });
      return res.status(201).json({
        message: "یک دسته بندی علاقه مندی اضافه شد!",
        title: favCat.title,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "خطای داخلی سرور" });
    }
  }

  static async addFavorite(req: Request, res: Response) {
    try {
      const { cid, favcat_id } = req.body;
      if (!cid || !favcat_id) {
        return res
          .status(400)
          .json({ message: "لطفا همه اطلاعات مورد نیاز را وارد نمایید!" });
      }

      const doesExist = await Favorite.findOne({ where: { cid, favcat_id } });
      if (doesExist) {
        return res
          .status(400)
          .json({ message: "این مورد قبلا به مورد علاقه ها اضافه شده است!" });
      }

      await Favorite.create({ cid, favcat_id });
      return res
        .status(201)
        .json({ message: "با موفقیت به مورد علاقه ها اضافه شد!" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "خطای داخلی سرور!" });
    }
  }
}
