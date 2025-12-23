import { Request, Response } from "express";
import PersonalAttribute from "../models/personal_att.model.js";
import PersonalAttributeValue from "../models/personal_att_val.model.js";
import { col } from "sequelize";
import sequelize from "../config/database.js";

export class AttributeController {
    static async getAllTheAttributes(req: Request, res: Response) {
        try {
            const { emp_id } = req.info!;
            if (!emp_id) {
                return res.status(400).json({ message: "لطفا آیدی کارمند را وارد نمایید!" });
            }

            const attributes = await PersonalAttribute.findAll({
                attributes: ['att_id', 'type', 'att_name',
                    [col('PersonalAttributeValues.value'), 'value']
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
}