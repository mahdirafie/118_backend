import { Request, Response } from "express";
import User from "../models/user.model.js";
import Employee from "../models/employee.model.js";
import EmployeeFacultyMemeber from "../models/employee_fm.model.js";
import EmployeeNonFacultyMember from "../models/employee_nfm.model.js";
import Department from "../models/department.model.js";
import Faculty from "../models/faculty.model.js";
import { error } from "console";
import Post from "../models/post.model.js";
import Space from "../models/space.model.js";
import SearchHistory from "../models/search_history.model.js";
import { col, Op, literal } from "sequelize";
import EmployeeOperation from "../models/employee_operations.model.js";
import ESPRelationship from "../models/esp_relationship.model.js";
import Favorite from "../models/favorite.model.js";
import FavoriteCategory from "../models/favorite_category.model.js";

export class UserController {
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

    static async getUserRelatedContacts(req: Request, res: Response) {
        try {
            const { uid } = req.params;

            if (!uid) {
                return res.status(400).json({ message: "Please enter the user ID!" });
            }

            const user = await User.findOne({
                where: { uid },
                attributes: ['uid'],
                include: [
                    {
                        model: Employee,
                        required: false,
                        attributes: ['emp_id'],
                        include: [
                            {
                                model: EmployeeFacultyMemeber,
                                required: false,
                                attributes: ['did'],
                                include: [
                                    {
                                        model: Department,
                                        required: false,
                                        attributes: ['did', 'fid'],
                                        include: [
                                            {
                                                model: Faculty,
                                                required: false,
                                                attributes: ['fid', 'fname']
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                model: EmployeeNonFacultyMember,
                                required: false,
                                attributes: ['workarea']
                            }
                        ]
                    }
                ]
            });

            if (!user) {
                return res.status(404).json({ message: "User not found!" });
            }

            let user_type: string = "general";

            if (user.Employee) {
                if (user.Employee.EmployeeFacultyMemeber) {
                    user_type = "employeeF";
                } else if (user.Employee.EmployeeNonFacultyMember) {
                    user_type = "employeeNF";
                }
            }

            let employees: any[] = [];
            let posts: any[] = [];
            let spaces: any[] = [];

            if (user_type === "general") {
                const mostSearchedQuery = await SearchHistory.findOne({
                    where: { uid },
                    order: [["no_tries", "DESC"]],
                    attributes: ["query", "no_tries"]
                });

                if (mostSearchedQuery) {
                    // Search for employee by name
                    let emp = await Employee.findOne({
                        where: {
                            '$User.full_name$': { [Op.like]: `%${mostSearchedQuery.query}%` }
                        },
                        attributes: ['emp_id'],
                        include: [
                            {
                                model: User,
                                required: true,
                                attributes: ['uid', 'full_name']
                            }
                        ]
                    });

                    let fullEmp: Employee | null = null;
                    if (emp) {
                        fullEmp = await Employee.findOne({
                            where: { emp_id: emp.emp_id },
                            include: [
                                {
                                    model: EmployeeFacultyMemeber,
                                    required: false,
                                    include: [
                                        {
                                            model: Department,
                                            required: false,
                                            include: [
                                                {
                                                    model: Faculty,
                                                    required: false
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    model: EmployeeNonFacultyMember,
                                    required: false
                                }
                            ]
                        });
                    }

                    let post = await Post.findOne({
                        where: {
                            pname: { [Op.like]: `%${mostSearchedQuery.query}%` }
                        }
                    });

                    let space = await Space.findOne({
                        where: {
                            sname: { [Op.like]: `%${mostSearchedQuery.query}%` }
                        }
                    });

                    // Determine the faculty id
                    let facId: number | null = null;
                    if (fullEmp?.EmployeeFacultyMemeber?.Department?.Faculty?.fid) {
                        facId = fullEmp.EmployeeFacultyMemeber.Department.Faculty.fid;
                    } else if (post?.fid) {
                        facId = post.fid;
                    } else if (space?.fid) {
                        facId = space.fid;
                    }

                    if (facId !== null) {
                        employees = await Employee.findAll({
                            attributes: [
                                'cid',
                                [col('ESPRelationships.Post.pname'), 'post'],
                                [col('User.full_name'), 'full_name']
                            ],
                            include: [
                                {
                                    model: User,
                                    attributes: [],
                                    required: true
                                },
                                {
                                    model: EmployeeFacultyMemeber,
                                    attributes: [],
                                    required: true,
                                    include: [
                                        {
                                            model: Department,
                                            required: true,
                                            include: [
                                                {
                                                    model: Faculty,
                                                    required: true,
                                                    where: { fid: facId }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    model: ESPRelationship,
                                    attributes: [],
                                    required: false,
                                    include: [
                                        {
                                            model: Post,
                                            required: false
                                        }
                                    ]
                                }
                            ]
                        });

                        posts = await Post.findAll({
                            attributes: [
                                'cid',
                                'pname',
                                [col('ESPRelationships.Employee.User.full_name'), 'employee']
                            ],
                            include: [
                                {
                                    model: Faculty,
                                    attributes: [],
                                    required: true,
                                    where: { fid: facId }
                                },
                                {
                                    model: ESPRelationship,
                                    attributes: [],
                                    required: false,
                                    include: [
                                        {
                                            model: Employee,
                                            required: false,
                                            include: [
                                                {
                                                    model: User,
                                                    required: false
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        });

                        spaces = await Space.findAll({
                            attributes: [
                                'cid',
                                'sname',
                                [col('ESPRelationships.Post.pname'), 'post']
                            ],
                            include: [
                                {
                                    model: Faculty,
                                    attributes: [],
                                    required: true,
                                    where: { fid: facId }
                                },
                                {
                                    model: ESPRelationship,
                                    attributes: [],
                                    required: false,
                                    include: [
                                        {
                                            model: Post,
                                            required: false
                                        }
                                    ]
                                }
                            ]
                        });
                    } else {
                        employees = await Employee.findAll({
                            attributes: [
                                'cid',
                                'createdAt',
                                [col('User.full_name'), 'full_name']
                            ],
                            include: [
                                {
                                    model: User,
                                    // attributes: [],
                                    required: true
                                },
                                {
                                    model: ESPRelationship,
                                    // attributes: [],
                                    required: false,
                                    include: [
                                        {
                                            model: Post,
                                            required: false
                                        }
                                    ]
                                }
                            ],
                            limit: 10,
                            order: [['createdAt', 'DESC']]
                        });

                        posts = await Post.findAll({
                            attributes: [
                                'cid',
                                'pname'
                            ],
                            include: [
                                {
                                    model: ESPRelationship,
                                    // attributes: [],
                                    required: false,
                                    include: [
                                        {
                                            model: Employee,
                                            required: false,
                                            include: [
                                                {
                                                    model: User,
                                                    required: false
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                            limit: 10
                        });

                        spaces = await Space.findAll({
                            attributes: [
                                'cid',
                                'sname'
                            ],
                            include: [
                                {
                                    model: ESPRelationship,
                                    // attributes: [],
                                    required: false,
                                    include: [
                                        {
                                            model: Post,
                                            required: false
                                        }
                                    ]
                                }
                            ],
                            limit: 10
                        });

                        // Now transform the results to flatten the structure
                        employees = employees.map(emp => {
                            const empData = emp.toJSON();
                            return {
                                cid: empData.cid,
                                full_name: empData.full_name,
                                post: empData.ESPRelationships?.[0]?.Post?.pname || null
                            };
                        });

                        posts = posts.map(post => {
                            const postData = post.toJSON();
                            return {
                                cid: postData.cid,
                                pname: postData.pname,
                                employee: postData.ESPRelationships?.[0]?.Employee?.User?.full_name || null
                            };
                        });

                        spaces = spaces.map(space => {
                            const spaceData = space.toJSON();
                            return {
                                cid: spaceData.cid,
                                sname: spaceData.sname,
                                post: spaceData.ESPRelationships?.[0]?.Post?.pname || null
                            };
                        });
                    }
                } else {
                    employees = await Employee.findAll({
                        attributes: [
                            'cid',
                            'createdAt',
                            [col('User.full_name'), 'full_name']
                        ],
                        include: [
                            {
                                model: User,
                                // attributes: [],
                                required: true
                            },
                            {
                                model: ESPRelationship,
                                // attributes: [],
                                required: false,
                                include: [
                                    {
                                        model: Post,
                                        required: false
                                    }
                                ]
                            }
                        ],
                        limit: 10,
                        order: [['createdAt', 'DESC']]
                    });

                    posts = await Post.findAll({
                        attributes: [
                            'cid',
                            'pname'
                        ],
                        include: [
                            {
                                model: ESPRelationship,
                                // attributes: [],
                                required: false,
                                include: [
                                    {
                                        model: Employee,
                                        required: false,
                                        include: [
                                            {
                                                model: User,
                                                required: false
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        limit: 10
                    });

                    spaces = await Space.findAll({
                        attributes: [
                            'cid',
                            'sname'
                        ],
                        include: [
                            {
                                model: ESPRelationship,
                                // attributes: [],
                                required: false,
                                include: [
                                    {
                                        model: Post,
                                        required: false
                                    }
                                ]
                            }
                        ],
                        limit: 10
                    });

                    // Now transform the results to flatten the structure
                    employees = employees.map(emp => {
                        const empData = emp.toJSON();
                        return {
                            cid: empData.cid,
                            full_name: empData.full_name,
                            post: empData.ESPRelationships?.[0]?.Post?.pname || null
                        };
                    });

                    posts = posts.map(post => {
                        const postData = post.toJSON();
                        return {
                            cid: postData.cid,
                            pname: postData.pname,
                            employee: postData.ESPRelationships?.[0]?.Employee?.User?.full_name || null
                        };
                    });

                    spaces = spaces.map(space => {
                        const spaceData = space.toJSON();
                        return {
                            cid: spaceData.cid,
                            sname: spaceData.sname,
                            post: spaceData.ESPRelationships?.[0]?.Post?.pname || null
                        };
                    });
                }
            } else if (user_type === "employeeF") {
                const facId: number | undefined = user.Employee?.EmployeeFacultyMemeber?.Department?.Faculty?.fid;

                if (!facId) {
                    return res.status(400).json({
                        message: "Faculty member user has incomplete faculty information!"
                    });
                }

                employees = await Employee.findAll({
                    attributes: [
                        'cid',
                        [col('ESPRelationships.Post.pname'), 'post'],
                        [col('User.full_name'), 'full_name']
                    ],
                    include: [
                        {
                            model: User,
                            attributes: [],
                            required: true
                        },
                        {
                            model: EmployeeFacultyMemeber,
                            attributes: [],
                            required: true,
                            include: [
                                {
                                    model: Department,
                                    required: true,
                                    where: { fid: facId }
                                }
                            ]
                        },
                        {
                            model: ESPRelationship,
                            attributes: [],
                            required: false,
                            include: [
                                {
                                    model: Post,
                                    required: false
                                }
                            ]
                        }
                    ]
                });

                posts = await Post.findAll({
                    attributes: [
                        'cid',
                        'pname',
                        [col('ESPRelationships.Employee.User.full_name'), 'employee']
                    ],
                    include: [
                        {
                            model: Faculty,
                            attributes: [],
                            required: true,
                            where: { fid: facId }
                        },
                        {
                            model: ESPRelationship,
                            attributes: [],
                            required: false,
                            include: [
                                {
                                    model: Employee,
                                    required: false,
                                    include: [
                                        {
                                            model: User,
                                            required: false
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });

                spaces = await Space.findAll({
                    attributes: [
                        'cid',
                        'sname',
                        [col('ESPRelationships.Post.pname'), 'post']
                    ],
                    include: [
                        {
                            model: Faculty,
                            attributes: [],
                            required: true,
                            where: { fid: facId }
                        },
                        {
                            model: ESPRelationship,
                            attributes: [],
                            required: false,
                            include: [
                                {
                                    model: Post,
                                    required: false
                                }
                            ]
                        }
                    ]
                });
            } else if (user_type === "employeeNF") {
                const workarea: string | undefined = user.Employee?.EmployeeNonFacultyMember?.workarea;
                const empId: number | undefined = user.Employee?.emp_id;

                if (!workarea || !empId) {
                    return res.status(400).json({
                        message: "Employee user has incomplete information!"
                    });
                }

                employees = await Employee.findAll({
                    attributes: [
                        'cid',
                        [col('User.full_name'), 'full_name'],
                        [col('ESPRelationships.Post.pname'), 'post']
                    ],
                    include: [
                        {
                            model: EmployeeNonFacultyMember,
                            attributes: [],
                            required: true,
                            where: { workarea }
                        },
                        {
                            model: User,
                            attributes: [],
                            required: true
                        },
                        {
                            model: ESPRelationship,
                            attributes: [],
                            required: false,
                            include: [
                                {
                                    model: Post,
                                    attributes: [],
                                    required: false
                                }
                            ]
                        }
                    ]
                });

                posts = await Post.findAll({
                    attributes: [
                        'cid',
                        'pname',
                        [col('ESPRelationships.Employee.User.full_name'), 'employee']
                    ],
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
                                            where: { workarea }
                                        },
                                        {
                                            model: User,
                                            required: true,
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });

                spaces = await Space.findAll({
                    attributes: [
                        'cid',
                        'sname',
                        [col('ESPRelationships.Post.pname'), 'post']
                    ],
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
                                            where: { workarea }
                                        },
                                    ]
                                },
                                {
                                    model: Post,
                                    required: false
                                }
                            ]
                        }
                    ]
                });
            }

            // Collect all CIDs from employees, posts, and spaces
            const allCids = [
                ...employees.map(emp => emp.cid),
                ...posts.map(post => post.cid),
                ...spaces.map(space => space.cid)
            ].filter(cid => cid !== null && cid !== undefined);

            // Single query to get all favorited CIDs for this user
            const favoritedCids = new Set();

            if (allCids.length > 0) {
                // Query the junction table directly
                const favorites = await Favorite.findAll({
                    where: {
                        cid: allCids
                    },
                    attributes: ['cid', 'favcat_id'],
                    raw: true
                });

                // Get all favcat_ids from the results
                const favcatIds = favorites.map(fav => fav.favcat_id);

                if (favcatIds.length > 0) {
                    // Check which favcat_ids belong to this user
                    const userFavCategories = await FavoriteCategory.findAll({
                        where: {
                            favcat_id: favcatIds,
                            uid: uid
                        },
                        attributes: ['favcat_id'],
                        raw: true
                    });

                    // Create a Set of user's favcat_ids
                    const userFavcatIdSet = new Set(userFavCategories.map(fc => fc.favcat_id));

                    // Filter favorites to only include those belonging to the user
                    favorites.forEach(fav => {
                        if (userFavcatIdSet.has(fav.favcat_id)) {
                            favoritedCids.add(fav.cid);
                        }
                    });
                }
            }

            // Add is_favorite field to each contactable - O(1) lookup for each
            const employeesWithFavorite = employees.map(emp => ({
                ...(emp.toJSON ? emp.toJSON() : emp),
                is_favorite: favoritedCids.has(emp.cid)
            }));

            const postsWithFavorite = posts.map(post => ({
                ...(post.toJSON ? post.toJSON() : post),
                is_favorite: favoritedCids.has(post.cid)
            }));

            const spacesWithFavorite = spaces.map(space => ({
                ...(space.toJSON ? space.toJSON() : space),
                is_favorite: favoritedCids.has(space.cid)
            }));

            return res.status(200).json({
                message: "اطلاعات با موفقیت دریافت شدند!",
                employees: employeesWithFavorite,
                posts: postsWithFavorite,
                spaces: spacesWithFavorite
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error!" });
        }
    }
}