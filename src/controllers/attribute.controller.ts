import { Request, Response } from "express";
import PersonalAttribute from "../models/personal_att.model.js";
import PersonalAttributeValue from "../models/personal_att_val.model.js";
import { col } from "sequelize";
import sequelize from "../config/database.js";
import SharesToEmployee from "../models/shares_to_employee.model.js";
import SharesToGroup from "../models/shares_to_group.model.js";
import Employee from "../models/employee.model.js";
import Group from "../models/group.model.js";
import GroupMembership from "../models/group_membership.model.js";

export class AttributeController {
    static async getAllTheAttributes(req: Request, res: Response) {
        try {
            const { emp_id } = req.info!;
            if (!emp_id) {
                return res.status(400).json({ message: "لطفا آیدی کارمند را وارد نمایید!" });
            }

            const attributes = await PersonalAttribute.findAll({
                attributes: ['att_id', 'type', 'att_name',
                    [col('PersonalAttributeValues.value'), 'value'],
                    [col('PersonalAttributeValues.val_id'), 'val_id']
                ],
                include: [
                    {
                        model: PersonalAttributeValue,
                        required: false,
                        where: { emp_id },
                        attributes: ['value']
                    }
                ],
                raw: true
            });
            return res.status(200).json({
                message: "صفات با موفقیت دریافت شدند!",
                attributes
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }

    static async createAttribute(req: Request, res: Response) {
        try {
            const { type, att_name } = req.body;
            if (!type || !att_name) {
                return res.status(400).json({ message: "لطفا همه اطلاعات لازم را وارد فرمایید!" });
            }

            const attribute = await PersonalAttribute.findOne({
                where: {
                    type,
                    att_name
                }
            });

            if (attribute) {
                return res.status(400).json({ message: "این صفت از قبل وجود دارد!" });
            }

            await PersonalAttribute.create({ type, att_name });
            return res.status(201).json({ message: "صفت با موفقیت ساخته شد!" });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }

    static async setAttributeValues(req: Request, res: Response) {
        const transaction = await sequelize.transaction();

        try {
            const { attributes } = req.body; // Array of {att_id, value}
            const { emp_id } = req.info!;

            if (!attributes || !Array.isArray(attributes) || attributes.length === 0 || !emp_id) {
                await transaction.rollback();
                return res.status(400).json({ message: "لطفا اطلاعات لازم را وارد نمایید!" });
            }

            const results = [];
            const skipped = [];

            for (const attr of attributes) {
                const { att_id, value } = attr;

                // Validate input
                if (!att_id) {
                    skipped.push({ att_id, reason: "شناسه صفت الزامی است" });
                    continue;
                }

                //  First, verify the PersonalAttribute exists (created by admin)
                const personalAttribute = await PersonalAttribute.findOne({
                    where: { att_id },
                    transaction
                });

                if (!personalAttribute) {
                    skipped.push({ att_id, reason: "صفت شخصی وجود ندارد" });
                    continue;
                }

                // Check if this user already has a value for this attribute
                const existingValue = await PersonalAttributeValue.findOne({
                    where: {
                        emp_id,
                        att_id
                    },
                    transaction
                });

                if (existingValue) {
                    const previousValue = existingValue.value;
                    await PersonalAttributeValue.update(
                        { value: value },
                        {
                            where: {
                                val_id: existingValue.val_id
                            },
                            transaction
                        }
                    );

                    results.push({
                        att_id,
                        attribute_name: personalAttribute.att_name,
                        status: "updated",
                        previous_value: previousValue,
                        new_value: value
                    });
                } else {
                    await PersonalAttributeValue.create({
                        emp_id,
                        att_id,
                        value
                    }, { transaction });

                    results.push({
                        att_id,
                        attribute_name: personalAttribute.att_name,
                        status: "created",
                        new_value: value
                    });
                }
            }

            await transaction.commit();

            return res.status(200).json({
                message: "عملیات تکمیل شد",
                successful: results,
                skipped: skipped,
                summary: {
                    total_requested: attributes.length,
                    processed: results.length,
                    skipped: skipped.length,
                    created: results.filter(r => r.status === "created").length,
                    updated: results.filter(r => r.status === "updated").length
                }
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Transaction error:", error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }

    static async setVisibleAttributesForEmployee(req: Request, res: Response) {
        try {
            const { attribute_values, receiver_emp_id } = req.body;
            if (!attribute_values || !Array.isArray(attribute_values) || attribute_values.length === 0 || !receiver_emp_id) {
                return res.status(400).json({ message: "لطفا اطلاعات را به درستی وارد نمایید!" });
            }

            const results = [];
            const skipped = [];

            for (const attVal of attribute_values) {
                const { val_id, is_sharable } = attVal;

                if (val_id === undefined || is_sharable === undefined) {
                    skipped.push({ val_id, status: "ignored", reason: "فرمت اطلاعات وارد شده درست نیست!" });
                    continue;
                }

                const visibleForEmployee = await SharesToEmployee.findOne({
                    where: {
                        receiver_emp_id,
                        val_id
                    }
                });

                if (visibleForEmployee) {
                    // check if is_sharable is false remove the visibility
                    if (!is_sharable) {
                        await visibleForEmployee.destroy();
                        results.push({ val_id, status: "deleted", reason: "حذف شد!" });
                    } else {
                        continue;
                    }
                } else {
                    if (is_sharable) {
                        // make it visible
                        await SharesToEmployee.create({
                            receiver_emp_id: receiver_emp_id,
                            val_id: val_id
                        });
                        results.push({ val_id, status: "created", reason: "ساخته شد!" });
                    }
                }
            }

            return res.status(200).json({ message: "اطلاعات با موفقیت ویرایش شدند!", results, skipped });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }

    static async setVisibleAttributesForGroup(req: Request, res: Response) {
        try {
            const { attribute_values, gid } = req.body;
            if (!attribute_values || !Array.isArray(attribute_values) || attribute_values.length === 0 || !gid) {
                return res.status(400).json({ message: "لطفا اطلاعات را به درستی وارد نمایید!" });
            }

            const results = [];
            const skipped = [];

            for (const attVal of attribute_values) {
                const { val_id, is_sharable } = attVal;

                if (val_id === undefined || is_sharable === undefined) {
                    skipped.push({ val_id, status: "ignored", reason: "فرمت اطلاعات وارد شده درست نیست!" });
                    continue;
                }

                const visibleForGroup = await SharesToGroup.findOne({
                    where: {
                        gid,
                        val_id
                    }
                });

                if (visibleForGroup) {
                    // check if is_sharable is false remove the visibility
                    if (!is_sharable) {
                        await visibleForGroup.destroy();
                        results.push({ val_id, status: "deleted", reason: "حذف شد!" });
                    } else {
                        continue;
                    }
                } else {
                    if (is_sharable) {
                        // make it visible
                        await SharesToGroup.create({
                            gid: gid,
                            val_id: val_id
                        });
                        results.push({ val_id, status: "created", reason: "ساخته شد!" });
                    }
                }
            }

            return res.status(200).json({ message: "اطلاعات با موفقیت ویرایش شدند!", results, skipped });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }

    static async getVisibleAttributeValues(req: Request, res: Response) {
        try {
            const { emp_id } = req.info!;
            if (!emp_id) {
                return res.status(400).json({ message: "لطفا وارد حساب خود شوید!" });
            }

            const { receiver_id, type } = req.params;
            if (!receiver_id || !type) {
                return res
                    .status(400)
                    .json({ message: "لطفا آیدی و نوع دریافت کننده را وارد نمایید!" });
            }

            const attributes = await PersonalAttribute.findAll({
                attributes: ['att_id', 'att_name'],
                include: [
                    {
                        model: PersonalAttributeValue,
                        required: false,
                        where: { emp_id },
                        attributes: ['val_id', 'value'],
                        include: [
                            type === 'employee'
                                ? {
                                    model: Employee,
                                    as: 'sharedWithEmployees',
                                    required: false,
                                    where: { emp_id: receiver_id },
                                    through: { attributes: [] },
                                }
                                : {
                                    model: Group,
                                    as: 'sharedWithGroups',
                                    required: false,
                                    where: { gid: receiver_id },
                                    through: { attributes: [] },
                                },
                        ],
                    },
                ],
            });

            const formattedAttributes = attributes.map(att => {
                const raw = att.get({ plain: true });
                const pav = raw.PersonalAttributeValues?.[0];

                return {
                    att_id: raw.att_id,
                    att_name: raw.att_name,
                    value: pav?.value ?? null,
                    val_id: pav?.val_id ?? null,
                    is_sharable:
                        pav &&
                            (
                                type === 'employee'
                                    ? pav.sharedWithEmployees?.length > 0
                                    : pav.sharedWithGroups?.length > 0
                            )
                            ? 1
                            : 0,
                };
            });

            return res.status(200).json({
                message: "اطلاعات با موفقیت دریافت شدند!",
                attribute: formattedAttributes,
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }

    static async getEmployeePersonalAttributeValues(req: Request, res: Response) {
        try {
            const { emp_id } = req.info!;
            if (!emp_id) {
                return res.status(400).json({
                    message: "لطفا وارد حساب کاربری خود شوید!",
                });
            }

            const { owner_emp_id } = req.params;
            if (!owner_emp_id) {
                return res.status(400).json({
                    message:
                        "لطفا آیدی کاربری که میخواهید اطلاعات آن را مشاهده کنید را وارد کنید!",
                });
            }

            // 1. Find the FIRST group (viewer side) owned by the target employee
            const firstGroupMembership = await GroupMembership.findOne({
                where: { emp_id }, // viewer employee
                include: [
                    {
                        model: Group,
                        as: 'Group',
                        where: { emp_id: owner_emp_id }, // groups owned by target
                        required: true,
                    }
                ],
                order: [['createdAt', 'ASC']], // order on junction table column
                raw: false,
            });

            const firstGroupGid = firstGroupMembership?.Group?.gid ?? null;

            const groupInclude = firstGroupGid
                ? [
                    {
                        model: Group,
                        as: 'sharedWithGroups',
                        required: false,
                        where: { gid: firstGroupGid },
                        through: { attributes: [] },
                    }
                ]
                : []; // if no firstGroup, do not include groups at all


            // 2. Fetch all attributes + owner's values + ALL sharing info
            const attributes = await PersonalAttribute.findAll({
                attributes: ['att_id', 'att_name'],
                include: [
                    {
                        model: PersonalAttributeValue,
                        required: false,
                        where: { emp_id: owner_emp_id },
                        attributes: ['val_id', 'value'],
                        include: [
                            {
                                model: Employee,
                                as: 'sharedWithEmployees',
                                required: false,
                                where: { emp_id },
                                through: { attributes: [] },
                            },
                            ...groupInclude
                        ],
                    },
                ],
            });

            // 3. GLOBAL PRIORITY CHECK
            const hasAnyDirectEmployeeShare = attributes.some(att => {
                const raw = att.get({ plain: true });
                const pav = raw.PersonalAttributeValues?.[0];
                return pav && pav.sharedWithEmployees?.length > 0;
            });

            // 4. Apply FINAL visibility rules (exclude invisible attributes)
            const employee_info = attributes
                .map(att => {
                    const raw = att.get({ plain: true });
                    const pav = raw.PersonalAttributeValues?.[0];

                    if (!pav) return null; // no value at all → exclude

                    let isVisible = false;

                    if (hasAnyDirectEmployeeShare) {
                        // Global override: ONLY employee-based shares count
                        isVisible = pav.sharedWithEmployees?.length > 0;
                    } else {
                        // Fallback: group-based shares (first group only)
                        isVisible = pav.sharedWithGroups?.length > 0;
                    }

                    if (!isVisible) return null; // exclude invisible attributes

                    return {
                        att_id: raw.att_id,
                        att_name: raw.att_name,
                        value: pav.value,  // now null is allowed legitimately
                        val_id: pav.val_id,
                    };
                })
                .filter(att => att !== null); // remove invisible attributes


            return res.status(200).json({
                message: "اطلاعات با موفقیت دریافت شدند!",
                employee_info,
                attributes
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "خطای داخلی سرور!",
            });
        }
    }
}