import { Request, Response } from "express";
import FavoriteCategory from "../models/favorite_category.model.js";
import Favorite from "../models/favorite.model.js";
import User from "../models/user.model.js";
import Contactable from "../models/contactable.model.js";
import Employee from "../models/employee.model.js";
import Post from "../models/post.model.js";
import Space from "../models/space.model.js";

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
      const { favcat_id } = req.body;
      if (!favcat_id) {
        return res.status(400).json({ message: "لطفا شماره دسته بندی را وارد کنید!" });
      }

      const favCat = await FavoriteCategory.findOne({ where: { favcat_id } });
      await favCat?.destroy();

      return res.status(200).json({ message: "دسته بندی با موفقیت حذف شد!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "خطای داخلی سرور!" });
    }
  }

  // update a favorite category
  static async updateFavoriteCategory(req: Request, res: Response) {
    try {
      const { favcat_id, new_title } = req.body;

      if (!favcat_id || !new_title) {
        return res.status(400).json({ message: "لطفا اطلاعات مورد نیاز را وارد نمایید!" });
      }

      const favCat = await FavoriteCategory.findByPk(favcat_id);
      if (!favCat) {
        return res.status(400).json({ message: "دسته بندی مورد نظر وجود ندارد!" });
      }

      favCat.title = new_title;
      await favCat.save();

      return res.status(200).json({ message: "دسته بندی با موفقیت ویرایش شد!" });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "خطای داخلی سرور!" });
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

  // delete contactable from favorites
  static async deleteContactableFromFavorite(req: Request, res: Response) {
    try {
      const { cid, uid } = req.body;

      if (!cid || !uid) {
        return res.status(400).json({
          message: "لطفا همه اطلاعات مورد نیاز را وارد نمایید!",
        });
      }

      // 1. Get user's favorite categories
      const favoriteCategories = await FavoriteCategory.findAll({
        where: { uid },
        attributes: ['favcat_id'],
      });

      if (favoriteCategories.length === 0) {
        return res.status(404).json({
          message: "دسته علاقه‌مندی‌ای برای این کاربر یافت نشد!",
        });
      }

      const favCatIds = favoriteCategories.map(fc => fc.favcat_id);

      // 2. Delete contactable from user's favorites
      const deletedCount = await Favorite.destroy({
        where: {
          cid,
          favcat_id: favCatIds,
        },
      });

      console.log("DELETE SUCCESSFULLY");

      return res.status(200).json({
        message: "مخاطب با موفقیت از علاقه‌مندی‌ها حذف شد!",
        deleted_count: deletedCount,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "خطای داخلی سرور!",
      });
    }
  }

  // get category favorites
  static async getFavCatFavorites(req: Request, res: Response) {
    try {
      const { favcat_id, uid } = req.params;

      if (!favcat_id || !uid) {
        return res.status(400).json({
          message: "لطفا همه اطلاعات مورد نیاز را وارد نمایید!",
        });
      }

      const category = await FavoriteCategory.findOne({
        where: {
          favcat_id,
          uid,
        },
        include: [
          {
            model: Contactable,
            through: { attributes: [] },
            include: [
              {
                model: Employee,
                required: false,
                include: [
                  {
                    model: User,
                    attributes: ['full_name'],
                    required: false,
                  },
                ],
              },
              {
                model: Post,
                attributes: ['pname'],
                required: false,
              },
              {
                model: Space,
                attributes: ['sname'],
                required: false,
              },
            ],
          },
        ],
      });

      if (!category) {
        return res.status(404).json({
          message: "دسته‌بندی مورد نظر یافت نشد!",
        });
      }

      const contactables = category.Contactables ?? [];
      // 🔹 resolve contactable name
      const favorites = contactables.map((c: any) => {
        let name: string | null = null;
        let type: 'employee' | 'post' | 'space' | null = null;

        if (c.Employee) {
          name = c.Employee.User?.full_name ?? null;
          type = 'employee';
        } else if (c.Post) {
          name = c.Post.pname;
          type = 'post';
        } else if (c.Space) {
          name = c.Space.sname;
          type = 'space';
        }

        return {
          cid: c.cid,
          type,
          name,
        };
      });

      return res.status(200).json({
        message: "اطلاعات با موفقیت دریافت شدند!",
        favorites,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "خطای داخلی سرور!",
      });
    }
  }

}
