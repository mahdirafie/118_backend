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
            const { gname, template } = req.body;
            const {emp_id} = req.info!;

            if (!gname || !emp_id) {
                await t.rollback();
                return res.status(400).json({ message: "لطفا اطلاعات مورد نیاز را وارد نمایید!" });
            }

            const emp = await Employee.findOne({
                where: {emp_id},
                transaction: t
            });

            if (!emp) {
                await t.rollback();
                return res.status(400).json({ message: "این کاربر وجود ندارد!" });
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
            const { emp_id } = req.info!;
            if (!emp_id) {
                return res.status(400).json({ message: "لطفا اطلاعات مورد نیاز را وارد نمایید!" });
            }

            const emp = await Employee.findOne({
                where: {emp_id}
            });

            if (!emp) {
                return res.status(400).json({ message: "کارمند مد نظر پیدا نشد!" });
            }


            const tempEmp = await Employee.findByPk(emp_id, {
                include: [
                    {
                        model: EmployeeFacultyMemeber,
                        required: false
                    },
                    {
                        model: EmployeeNonFacultyMember,
                        required: false
                    }
                ]
            });
            if (!tempEmp) {
                return res.status(400).json({ message: "این کارمند وجود ندارد!" });
            }

            let user_type: string = "";
            if (tempEmp.EmployeeFacultyMemeber) {
                user_type = "employeeF";
            } else if (tempEmp.EmployeeNonFacultyMember) {
                user_type = "employeeNF"
            } else {
                return res.status(500).json({ message: "ساختار کارمند در پایگاه داده اشتباه است!" });
            }

            const groups = await Group.findAll({
                where: { emp_id },
                attributes: ['gid', 'gname', 'createdAt']
            });

            return res.status(200).json({
                message: "گروه ها با موفقیت دریافت شدند!",
                user_type,
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
                        attributes: ['emp_id', 'cid'],
                        as: 'members',
                        required: false,
                        through: { attributes: [] },
                        include: [
                            {
                                model: User,
                                required: false,
                                attributes: ['full_name']
                            }
                        ]
                    }
                ]
            });

            if (!group) {
                return res.status(400).json({ message: "گروه وجود ندارد!" });
            }

            const formattedMembers = group.members ? group.members.map(member => ({
                emp_id: member.emp_id,
                cid: member.cid,
                User: {
                    full_name: member.User ? member.User.full_name : null
                }
            })) : [];

            return res.status(200).json({
                message: "اعضای گروه با موفقیت دریافت شدند!",
                group: {
                    group_id: group.gid,
                    group_name: group.gname,
                    members: formattedMembers
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }

    // delete a group
    static async deleteGroup(req: Request, res: Response) {
        try {
            const { gid } = req.params;
            if (!gid) {
                return res.status(400).json({ message: "لطفا آیدی گروه را وارد کنید!" });
            }

            const group = await Group.findByPk(gid);
            if (!group) {
                return res.status(400).json({ message: "این گروه وجود ندارد!" });
            }

            await group.destroy();
            return res.status(200).json({ message: "گروه با موفقیت حذف شد!" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }

    // add an employee to a group
    static async addEmpToGroup(req: Request, res: Response) {
        try {
            const {gid, emp_id} = req.body;
            if(!gid || !emp_id) {
                return res.status(400).json({message: "لطفا همه اطلاعات لازم را وارد نمایید!"});
            }

            const group = await Group.findByPk(gid);
            if(!group) {
                return res.status(400).json({message: "گروه وجود ندارد!"});
            }

            const groupWithEmp = await GroupMembership.findOne({where: {
                gid,
                emp_id
            }});

            if(groupWithEmp) {
                return res.status(400).json({message: "کارمند در حال حاضر در گروه وجود دارد!"});
            }

            await GroupMembership.create({gid, emp_id});
            return res.status(201).json({message: "کار مند به گروه اضافه شد!"});
        }catch(error) {
            console.error(error);
            return res.status(500).json({message: "خطای داخلی سرور!"});
        }
    }

    // remove a member from a group
    static async removeMemberFromGroup(req: Request, res: Response) {
        try {
            const {emp_id, gid} = req.params;
            if(!emp_id || !gid) {
                return res.status(400).json({message: "لطفا اطلاعات لازم برای حذف کارمند از گروه را وارد نمایید!"});
            }

            const groupMem = await GroupMembership.findOne({where: {gid, emp_id}});
            if(!groupMem) {
                return res.status(400).json({message: "این کارمند در این گروه وجود ندارد!"});
            }
            await groupMem.destroy();
            return res.status(200).json({message: "کاربر با موفقیت حذف شد!"});
        }catch(error) {
            console.error(error);
            return res.status(500).json({message: "خطای داخلی سرور!"});
        }
    }
}