import { Request, Response } from "express";
import EmployeeNonFacultyMember from "../models/employee_nfm.model.js";
import EmployeeOperation from "../models/employee_operations.model.js";

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

    static async createEmployeeOperation(req: Request, res: Response) {
        try {
            const {emp_id, operation} = req.body;
            if(!emp_id || !operation) {
                return res.status(400).json({message: "اطلاعات وارد شده کافی نمیباشند!"});
            }

            const empOp: EmployeeOperation | null = await EmployeeOperation.findOne({where: {
                emp_id, operation
            }});

            if(empOp) {
                return res.status(400).json({message: "این کار برای این کارمند قبلا تعریف شده!"});
            }

            await EmployeeOperation.create({emp_id, operation});

            return res.status(201).json({message: "کار برای کارمند با موفقیت ساخته شد!"});
        }catch(error) {
            console.error(error);
            return res.status(500).json({message: "خطای داخلی سرور!"});
        }
    }
}