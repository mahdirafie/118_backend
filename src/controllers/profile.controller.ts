import { Request, Response } from "express";
import User from "../models/user.model.js";
import Employee from "../models/employee.model.js";
import EmployeeFacultyMemeber from "../models/employee_fm.model.js";
import EmployeeNonFacultyMember from "../models/employee_nfm.model.js";
import Department from "../models/department.model.js";
import Faculty from "../models/faculty.model.js";

export class ProfileController {
    static async getUserProfile(req: Request, res: Response) {
        try {
            const { user_id } = req.params;
            if (!user_id) {
                return res.status(400).json({ message: "لطفا آیدی یوزر مورد نظر را وارد نمایید!" });
            }

            const user = await User.findOne({
                where: { uid: user_id }, 
                attributes: ['phone', 'full_name'],
                include: [
                    {
                        model: Employee,
                        attributes: ['personnel_no', 'national_code'],
                        include: [
                            {
                                model: EmployeeFacultyMemeber,
                                attributes: ['did'],
                                include: [
                                    {
                                        model: Department,
                                        attributes: ['dname'],
                                        include: [
                                            {
                                                model: Faculty,
                                                attributes: ['fname']
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                model: EmployeeNonFacultyMember,
                                attributes: ['workarea']
                            },
                        ]
                }
            ]
            });
            if (!user) {
                return res.status(400).json({ message: "کاربر مورد نظر پیدا نشد!" });
            }

            return res.status(200).json({ message: "کاربر با موفقیت یافت شد!", user });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }
}