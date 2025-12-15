import { Request, Response } from "express";
import Post from "../models/post.model.js";
import sequelize from "../config/database.js";
import Contactable from "../models/contactable.model.js";
import Faculty from "../models/faculty.model.js";

export class PostController {
    static async createPost(req: Request, res: Response) {
        try {
            const { pname, description, fid } = req.body;

            if (!pname || !description) {
                return res.status(400).json({ message: "لطفا همه اطلاعات لازم را وارد نمایید!" });
            }

            const post = await Post.findOne({ where: { pname } });
            if (post) {
                return res.status(400).json({ message: "این پست در حال حاضر وجود دارد!" });
            }

            if(fid) {
                const fac = await Faculty.findByPk(fid);
                if(!fac) {
                    return res.status(400).json({message: "دانشکده وجود ندارد!"});
                }
            }

            const t = await sequelize.transaction();

            try {
                const cntctbl = await Contactable.create({}, { transaction: t });

                await Post.create(
                    { cid: cntctbl.cid, pname, description, fid: fid ?? null },
                    { transaction: t }
                );

                await t.commit();
                return res.status(201).json({ message: "موقعیت شغلی با موفقیت ساخته شد!" });
            } catch (error) {
                await t.rollback();
                throw error;
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }
}