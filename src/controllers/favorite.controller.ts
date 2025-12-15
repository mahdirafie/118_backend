import { Request, Response } from "express";
import FavoriteCategory from "../models/favorite_category.model.js";
import Favorite from "../models/favorite.model.js";
import User from "../models/user.model.js";

export class FavoriteController {
  // add category
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

  // remove a favorite category
  static async deleteFavoriteCategory(req: Request, res: Response) {
    try {
      const {favcat_id} = req.body;
      if(!favcat_id) {
        return res.status(400).json({message: "لطفا شماره دسته بندی را وارد کنید!"});
      }

      const favCat = await FavoriteCategory.findOne({where: {favcat_id}});
      await favCat?.destroy();

      return res.status(200).json({message: "دسته بندی با موفقیت حذف شد!"});
    }catch(error) {
      console.error(error);
      return res.status(500).json({message: "خطای داخلی سرور!"});
    }
  }

  // update a favorite category
  static async updateFavoriteCategory(req: Request, res: Response) {
    try {
      const {favcat_id, new_title} = req.body;

      if(!favcat_id || !new_title) {
        return res.status(400).json({message: "لطفا اطلاعات مورد نیاز را وارد نمایید!"});
      }

      const favCat = await FavoriteCategory.findByPk(favcat_id);
      if(!favCat) {
        return res.status(400).json({message: "دسته بندی مورد نظر وجود ندارد!"});
      }

      favCat.title = new_title;
      await favCat.save();

      return res.status(200).json({message: "دسته بندی با موفقیت ویرایش شد!"});

    } catch(error) {
      console.error(error);
      return res.status(500).json({message: "خطای داخلی سرور!"});
    }
  }

  // add favorite
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

  // get user favorite categories
  static async getUserFavoriteCategories(req: Request, res: Response) {
    try {
      const { uid } = req.body;

      if (!uid) {
        return res.status(400).json({ message: "لطفا اطلاعات لازم را به سرور بفرستید!" });
      }

      const user = await User.findOne({ where: { uid } });
      if (!user) {
        return res.status(400).json({ message: "کاربر مورد نظر پیدا نشد!" });
      }

      const favCats = await FavoriteCategory.findAll({ where: { uid } });
      const favCatsInfo = favCats.map((favCat, index) => {
        const favCatInfo = favCat.get();
        delete favCatInfo.uid;
        return favCatInfo
      });

      return res.status(200).json({ message: "اطلاعات با موفقیت دریافت شدند!", favorite_categories: favCatsInfo });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "خطای داخلی سرور!" });
    }
  }
}
