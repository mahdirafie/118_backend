import { Request, Response } from "express";
import Space from "../models/space.model.js";
import sequelize from "../config/database.js";
import Contactable from "../models/contactable.model.js";
import Faculty from "../models/faculty.model.js";

export class SpaceController {
    static async createSpace(req: Request, res: Response) {
        try {
            const { sname, room, fid } = req.body;

            if (!sname || !room) {
                return res
                    .status(400)
                    .json({ message: "لطفا همه اطلاعات لازم را وارد نمایید!" });
            }

            if(fid) {
                const fac = await Faculty.findByPk(fid);
                if(!fac) {
                    return res.status(400).json({message: "دانشکده وجود ندارد!"});
                }
            }

            // (Optional but recommended) prevent duplicates
            const existingSpace = await Space.findOne({ where: { sname, room } });
            if (existingSpace) {
                return res
                    .status(400)
                    .json({ message: "این فضا قبلاً ثبت شده است!" });
            }

            const t = await sequelize.transaction();

            try {
                const cntctbl = await Contactable.create({}, { transaction: t });

                await Space.create(
                    {
                        cid: cntctbl.cid,
                        sname,
                        room,
                        fid: fid ?? null, // supports spaces without faculty
                    },
                    { transaction: t }
                );

                await t.commit();
                return res.status(201).json({ message: "فضا با موفقیت ساخته شد!" });
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