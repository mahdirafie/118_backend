import { Request, Response } from "express";
import Faculty from "../models/faculty.model.js";
import Department from "../models/department.model.js";

export class FacultyController {
    // create faculty
    static async createFaculty(req: Request, res: Response) {
        try {
            const { fname } = req.body;
            if (!fname) {
                return res.status(400).json({ message: "لطفا همه اطلاعات لازم را وارد نمایید!" });
            }

            const fac = await Faculty.findOne({ where: { fname } });
            if (fac !== null) {
                return res.status(400).json({ message: "این دانشکده از قبل وجود دارد!" });
            }

            await Faculty.create({ fname });

            return res.status(201).json({ message: "دانشکده با موفقیت ساخته شد!" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }

    // create department for a specific faculty
    static async createDepartment(req: Request, res: Response) {
        try {
            const { dname, fid } = req.body;
            if (!dname || !fid) {
                return res.status(400).json({ message: "لطفا همه اطلاعات لازم را وارد نمایید!" });
            }

            const fac = await Faculty.findOne({ where: { fid } });
            if (!fac) {
                return res.status(400).json({ message: "دانشکده وارد شده وجود ندارد!" });
            }

            const dep = await Department.findOne({ where: { dname, fid } });
            if (dep !== null) {
                return res.status(400).json({ message: "این دپارتمان برای این دانشکده وجود دارد!" });
            }

            await Department.create({ dname, fid });

            return res.status(201).json({ message: "دپارتمان ساخته شد!" });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }

    static async getAllFaculties(req: Request, res: Response) {
        try {
            const faculties = await Faculty.findAll({ attributes: ['fid', 'fname'] });
            return res.status(200).json({ message: "دانشکده ها با موفقیت دریافت شدند!", faculties });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }

    static async getDepartmentsForFaculty(req: Request, res: Response) {
        try {
            const { fid } = req.params;

            if (!fid) {
                return res.status(400).json({ message: 'لطفا شماره دانشکده را وارد نمایید!' });
            }

            const departments = await Department.findAll({ where: { fid }, attributes: ['did', 'dname'] });

            return res.status(200).json({ message: "اطلاعات با موفقیت دریافت شدند!", departments });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }
}