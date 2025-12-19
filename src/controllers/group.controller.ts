import { Request, Response } from "express";
import Group from "../models/group.model.js";
import Employee from "../models/employee.model.js";
import EmployeeFacultyMemeber from "../models/employee_fm.model.js";
import EmployeeNonFacultyMember from "../models/employee_nfm.model.js";
import sequelize from "../config/database.js";
import { Op } from "sequelize";
import Department from "../models/department.model.js";
import Faculty from "../models/faculty.model.js";
import GroupMembership from "../models/group_membership.model.js";
import User from "../models/user.model.js";

export class GroupController {
    // create a group for an employee
    static async createGroup(req: Request, res: Response) {
        const t = await sequelize.transaction();
        try {
            const { gname, emp_id, template } = req.body;

            if (!gname || !emp_id) {
                await t.rollback();
                return res.status(400).json({ message: "لطفا اطلاعات مورد نیاز را وارد نمایید!" });
            }

            let group: Group | null = await Group.findOne({
                where: { gname, emp_id },
                transaction: t
            });

            if (group) {
                await t.rollback();
                return res.status(400).json({ message: "این گروه از قبل برای این کارمند وجود دارد!" });
            }

            let employee: Employee | null = await Employee.findOne({
                where: { emp_id },
                include: [
                    {
                        model: EmployeeFacultyMemeber,
                        required: false,
                        attributes: ['emp_id', 'did']
                    },
                    {
                        model: EmployeeNonFacultyMember,
                        required: false,
                        attributes: ['emp_id', 'workarea']
                    }
                ],
                transaction: t
            });

            if (!employee) {
                await t.rollback();
                return res.status(400).json({ message: "کارمند وجود ندارد!" });
            }
            let emp_type: string = "F"; // faculty member
            if (employee.EmployeeNonFacultyMember) {
                emp_type = "NF"; // non faculty member
            } else if (employee.EmployeeFacultyMemeber) {
                emp_type = "F"; // faculty member
            } else {
                return res.status(500).json({ message: "ساختار کارمند در پایگاه داده معتبر نیست!" });
            }

            const g = await Group.create({ emp_id, gname }, { transaction: t });

            const employees_to_add: { emp_id: number; gid: number }[] = [];

            if (emp_type === "F") {
                if (!employee.EmployeeFacultyMemeber) {
                    throw new Error("کارمند عضو هیئت علمی نیست");
                }
                if (template === "department") {
                    // add all the same department members to the group
                    const did: number = employee.EmployeeFacultyMemeber.did;
                    const depMems = await EmployeeFacultyMemeber.findAll({
                        where: {
                            did,
                            emp_id: { [Op.ne]: employee.emp_id }
                        },
                        attributes: ['emp_id'],
                        transaction: t
                    });
                    depMems.forEach((depMem) => {
                        employees_to_add.push({ emp_id: depMem.emp_id, gid: g.gid });
                    });
                } else if (template === "faculty") {
                    // add all the same faculty members to the group
                    console.log("DIDDDD: ", employee.EmployeeFacultyMemeber.did);
                    console.log("employee: ", employee.EmployeeFacultyMemeber.get());
                    const dep = await Department.findOne({
                        where: {
                            did: employee.EmployeeFacultyMemeber.did
                        },
                        attributes: ['fid'],
                        transaction: t
                    });
                    if (!dep) {
                        throw new Error("دپارتمان مورد نظر وجود ندارد!");
                    }

                    const fid = dep.fid;

                    const facMems = await EmployeeFacultyMemeber.findAll({
                        where: {
                            emp_id: { [Op.ne]: employee.emp_id }
                        },
                        include: [
                            {
                                model: Department,
                                required: true,
                                include: [
                                    {
                                        model: Faculty,
                                        required: true,
                                        where: { fid: fid }
                                    }
                                ]
                            }
                        ],
                        attributes: ['emp_id'],
                        transaction: t
                    });

                    facMems.forEach((facMem) => {
                        employees_to_add.push({ emp_id: facMem.emp_id, gid: g.gid });
                    });
                } else {
                    await t.rollback();
                    return res.status(404).json({ message: "کارمند و template با هم توافق ندارند!" });
                }
            } else if (emp_type === "NF") {
                if (template === "workarea") {
                    // add all the non faculty member employees with the same workarea to the group
                    if (!employee.EmployeeNonFacultyMember) {
                        throw new Error("کارمند جزو حوزه کاری نیست!");
                    }
                    const workareaEmps = await EmployeeNonFacultyMember.findAll({
                        where: {
                            workarea: employee.EmployeeNonFacultyMember.workarea,
                            emp_id: { [Op.ne]: employee.emp_id }
                        },
                        attributes: ['emp_id'],
                        transaction: t
                    });

                    workareaEmps.forEach((workareaEmp) => {
                        employees_to_add.push({ emp_id: workareaEmp.emp_id, gid: g.gid });
                    });
                } else {
                    await t.rollback();
                    return res.status(404).json({ message: "کارمند و template با هم توافق ندارند!" });
                }
            }

            if (employees_to_add.length > 0) {
                await GroupMembership.bulkCreate(employees_to_add, {
                    transaction: t,
                    ignoreDuplicates: true
                });
            }

            await t.commit();

            return res.status(201).json({ message: "گروه با موفقیت ساخته شد!" });

        } catch (error) {
            await t.rollback();
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }

    // get groups for a specific employee
    static async getGroupsByEmployee(req: Request, res: Response) {
        try {
            const { emp_id } = req.params;
            if (!emp_id) {
                return res.status(400).json({ message: "لطفا اطلاعات مورد نیاز را وارد نمایید!" });
            }
            const tempEmp = await Employee.findByPk(emp_id);
            if (!tempEmp) {
                return res.status(400).json({ message: "این کارمند وجود ندارد!" });
            }

            const groups = await Group.findAll({
                where: { emp_id },
                attributes: ['gid', 'gname', 'createdAt']
            });

            return res.status(200).json({
                message: "گروه ها با موفقیت دریافت شدند!",
                groups
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }

    // get group members
    static async getGroupMembers(req: Request, res: Response) {
        try {
            const { gid } = req.params;
            if (!gid) {
                return res.status(400).json({ message: "لطفا شماره گروه را وارد نمایید!" });
            }

            const group = await Group.findByPk(gid, {
                attributes: ['gid', 'gname'],
                include: [
                    {
                        model: Employee,
                        attributes: ['emp_id'],
                        as: 'members',
                        required: true,
                        through: {attributes: []},
                        include: [
                            {
                                model: User,
                                required: true,
                                attributes: ['full_name']
                            }
                        ]
                    }
                ]
            });

            if (!group) {
                return res.status(400).json({ message: "گروه وجود ندارد!" });
            }

            return res.status(201).json({
                message: "اعضای گروه با موفقیت دریافت شدند!",
                group: { group_id: group.gid, group_name: group.gname, members: group.members }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }
}