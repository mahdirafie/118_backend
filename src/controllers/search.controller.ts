import { Request, Response } from "express";
import Employee from "../models/employee.model.js";
import EmployeeFacultyMemeber from "../models/employee_fm.model.js";
import Department from "../models/department.model.js";
import Faculty from "../models/faculty.model.js";
import EmployeeNonFacultyMember from "../models/employee_nfm.model.js";
import { Model, Op, where } from "sequelize";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Space from "../models/space.model.js";
import ESPRelationship from "../models/esp_relationship.model.js";
import SearchHistory from "../models/search_history.model.js";
import EmployeeOperation from "../models/employee_operations.model.js";

export class SearchController {
    static async search(req: Request, res: Response) {
        try {
            const { query, faculty_id, department_id, workarea } = req.query;

            if (!query) {
                return res.status(400).json({
                    message: 'لطفا یک عبارت را سرچ کنید!',
                });
            }

            let employeeF: Employee[];
            let employeeNF: Employee[];

            // get faculty employees
            employeeF = await Employee.findAll({
                where: {
                    [Op.or]: [
                        { personnel_no: { [Op.like]: `%${query}%` } },
                        { national_code: { [Op.like]: `%${query}%` } },
                        { '$User.full_name$': { [Op.like]: `%${query}%` } },
                        { '$User.phone$': { [Op.like]: `%${query}%` } },
                        { '$ESPRelationships.Post.pname$': { [Op.like]: `%${query}%` } },
                        { '$EmployeeOperations.operation$': { [Op.like]: `%${query}%` } },
                    ],
                },
                attributes: ['emp_id', 'uid', 'cid'],
                include: [
                    {
                        model: User,
                        required: true,
                        attributes: ['full_name', 'phone'],
                    },
                    {
                        model: EmployeeFacultyMemeber,
                        required: true,
                        attributes: [],
                        include: [
                            {
                                model: Department,
                                required: true,
                                where: department_id ? { did: department_id } : undefined,
                                include: [
                                    {
                                        model: Faculty,
                                        required: true,
                                        where: faculty_id ? { fid: faculty_id } : undefined,
                                    }
                                ],
                            },
                        ],
                    },
                    {
                        model: ESPRelationship,
                        attributes: [],
                        required: false,
                        include: [
                            {
                                model: Post,
                                required: !!faculty_id,
                                where: faculty_id ? { fid: faculty_id } : undefined
                            }
                        ]
                    },
                    {
                        model: EmployeeOperation,
                        required: true
                    }
                ],
            });

            // get non-faculty employees
            employeeNF = await Employee.findAll({
                subQuery: false,
                attributes: ['emp_id', 'uid', 'cid'],
                where: {
                    [Op.or]: [
                        { personnel_no: { [Op.like]: `%${query}%` } },
                        { national_code: { [Op.like]: `%${query}%` } },
                        { '$User.full_name$': { [Op.like]: `%${query}%` } },
                        { '$User.phone$': { [Op.like]: `%${query}%` } },
                        { '$ESPRelationships.Post.pname$': { [Op.like]: `%${query}%` } },
                        { '$EmployeeOperations.operation$': { [Op.like]: `%${query}%` } }
                    ],
                },
                include: [
                    {
                        model: User,
                        required: true,
                        attributes: ['full_name', 'phone']
                    },
                    {
                        model: EmployeeNonFacultyMember,
                        attributes: [],
                        required: true,
                        where: workarea ? { workarea } : undefined
                    },
                    {
                        model: ESPRelationship,
                        attributes: [],
                        required: false,
                        include: [
                            {
                                model: Post,
                                required: !!faculty_id,
                                where: faculty_id ? { fid: faculty_id } : undefined
                            }
                        ]
                    },
                    {
                        model: EmployeeOperation,
                        required: true
                    }
                ]
            });

            if ((faculty_id || department_id) && !workarea) {
                employeeNF = [];
            } else if (workarea && !department_id && !faculty_id) {
                employeeF = [];
            } else if (workarea && department_id && faculty_id) {
                employeeF = [];
                employeeNF = [];
            }

            let posts: Post[];
            let spaces: Space[];

            if (workarea && (faculty_id || department_id)) {
                posts = [];
                spaces = [];
            } else if (!(faculty_id || department_id) && workarea) {
                //search for workarea related stuff
                posts = await Post.findAll({
                    where: {
                        pname: {
                            [Op.like]: `%${query}%`
                        }
                    },
                    attributes: ['cid', 'pname', 'description'],
                    include: [
                        {
                            model: ESPRelationship,
                            attributes: [],
                            required: true,
                            include: [
                                {
                                    model: Employee,
                                    required: true,
                                    include: [
                                        {
                                            model: EmployeeNonFacultyMember,
                                            required: true,
                                            where: workarea ? { workarea } : undefined
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });

                spaces = await Space.findAll({
                    where: {
                        sname: {
                            [Op.like]: `%${query}%`
                        }
                    },
                    attributes: ['cid', 'sname', 'room'],
                    include: [
                        {
                            model: ESPRelationship,
                            attributes: [],
                            required: true,
                            include: [
                                {
                                    model: Employee,
                                    required: true,
                                    include: [
                                        {
                                            model: EmployeeNonFacultyMember,
                                            required: true,
                                            where: workarea ? { workarea } : undefined
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });
            } else {
                //search for faculty related stuff
                posts = await Post.findAll({
                    attributes: ['pname', 'description', 'cid'],
                    where: {
                        pname: {
                            [Op.like]: `%${query}%`
                        }
                    },
                    include: [
                        {
                            model: Faculty,
                            attributes: [],
                            required: !!faculty_id,
                            where: faculty_id ? { fid: faculty_id } : undefined
                        }
                    ]
                });

                spaces = await Space.findAll({
                    attributes: ['sname', 'room', 'cid'],
                    where: {
                        sname: {
                            [Op.like]: `%${query}%`
                        }
                    },
                    include: [
                        {
                            model: Faculty,
                            attributes: [],
                            required: !!faculty_id,
                            where: faculty_id ? { fid: faculty_id } : undefined
                        }
                    ]
                });
            }

            return res.status(200).json({
                employees: { employeeF, employeeNF },
                posts,
                spaces,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: 'خطای داخلی سرور!',
            });
        }
    }

    static async createSearchHistory(req: Request, res: Response) {
        try {
            const { query } = req.body;
            const { uid } = req.info!;

            if (!uid || !query) {
                return res.status(400).json({ message: "لطفا همه اطلاعات لازم را وارد نمایید!" });
            }

            const sh = await SearchHistory.findOne({ where: { uid, query } });
            if (sh) {
                sh.no_tries += 1;
                await sh.save();
            } else {
                await SearchHistory.create({ uid, query, no_tries: 1 });
            }

            return res.status(201).json({ message: "یک تاریخچه سرچ با موفقیت ساخته شد!" });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }

    static async getSearchHistory(req: Request, res: Response) {
        try {
            const { uid } = req.info!;
            if (!uid) {
                return res.status(400).json({ message: "لطفا آیدی کاربر را وارد نمایید!" });
            }

            const searchHistories = await SearchHistory.findAll({
                where: { uid },
                attributes: ['shid', 'query'],
                order: [['no_tries', 'DESC']]
            });

            return res.status(200).json({
                message: "اطلاعات تاریخچه جستجو کاربر با موفقیت دریافت شد!",
                histories: searchHistories
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }

    static async deleteSearchHistory(req: Request, res: Response) {
        try {
            const {shid} = req.params;

            if(!shid) {
                return res.status(400).json({message: "لطفا آیدی تاریخچه مورد نظر را وارد نمایید!"});
            }

            await SearchHistory.destroy({where: {shid}});

            return res.status(200).json({message: "تاریخچه با موفقیت حذف شد!"});
        }catch(error) {
            console.error(error);
            return res.status(500).json({message: "خطای داخلی سرور"});
        }
    }
}