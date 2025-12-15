import { Request, Response } from "express";
import EmployeeNonFacultyMember from "../models/employee_nfm.model.js";

export class EmployeeController {
    // get all the workareas
    static async getDistinctWorkAreas(req: Request, res: Response) {
        try {
            const workAreas = await EmployeeNonFacultyMember.findAll({
                attributes: ['workarea'],
                group: ['workarea'],
            });

            res.status(200).json({
                message: 'حوزه های کاری با موفقیت دریافت شدند!',
                workareas: workAreas.map(item => item.workarea),
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: 'Failed to fetch work areas',
                error,
            });
        }
    }
}