import { Request, Response } from "express";
import Contactable from "../models/contactable.model.js";
import Employee from "../models/employee.model.js";
import Post from "../models/post.model.js";
import Space from "../models/space.model.js";
import Favorite from "../models/favorite.model.js";
import FavoriteCategory from "../models/favorite_category.model.js";
import User from "../models/user.model.js";
import ContactInfo from "../models/contact_info.model.js";
import ESPRelationship from "../models/esp_relationship.model.js";

export class ContactableController {
    static async getContactableInfo(req: Request, res: Response) {
        try {
            const { cid } = req.params;
            const { uid } = req.info!;
            if (!cid || !uid) {
                return res.status(400).json({ message: "Please enter the contact ID and user ID!" });
            }

            // First, determine the contact type
            var contact_type: string = "employee";
            const contactable = await Contactable.findOne({
                where: { cid },
                include: [
                    {
                        model: Employee,
                        required: false
                    },
                    {
                        model: Post,
                        required: false
                    },
                    {
                        model: Space,
                        required: false
                    }
                ]
            });

            if (!contactable) {
                return res.status(404).json({ message: "Contact not found!" });
            }

            if (contactable.Post) {
                contact_type = "post";
            } else if (contactable.Space) {
                contact_type = "space";
            }

            // Get contact info with favorite status
            const contactInfo = await Contactable.findOne({
                where: { cid },
                attributes: ['cid'],
                include: [
                    {
                        model: ContactInfo,
                        required: false,
                    },
                    {
                        model: FavoriteCategory,
                        required: false,
                        where: { uid: uid },
                        attributes: ['favcat_id'],
                        through: {
                            attributes: []
                        }
                    }
                ]
            });

            if (!contactInfo) {
                return res.status(404).json({ message: "Contact information not found!" });
            }

            // Check if this contact is favorited by the user
            const isFavorited = contactInfo.FavoriteCategories && contactInfo.FavoriteCategories.length > 0;

            // relative info
            let relative_info: any = null;

            if (contact_type === "employee") {
                // For employees: find their post and space relationships
                // First get the employee's emp_id
                const employee = await Employee.findOne({
                    where: { cid: cid },
                    attributes: ['emp_id']
                });

                if (employee?.emp_id) {
                    relative_info = await ESPRelationship.findOne({
                        where: { emp_id: employee.emp_id },
                        include: [
                            {
                                model: Post,
                                required: false,
                                attributes: ['cid', 'pname']
                            },
                            {
                                model: Space,
                                required: false,
                                attributes: ['cid', 'sname']
                            }
                        ]
                    });
                }
            } else if (contact_type === "post") {
                // For posts: find which employee and space are related to this post
                relative_info = await ESPRelationship.findOne({
                    where: { pid: cid },
                    include: [
                        {
                            model: Employee,
                            required: false,
                            attributes: ['emp_id', 'cid'],
                            include: [
                                {
                                    model: User,
                                    attributes: ['full_name']
                                }
                            ]
                        },
                        {
                            model: Space,
                            required: false,
                            attributes: ['cid', 'sname']
                        }
                    ]
                });
            } else if (contact_type === "space") {
                // For spaces: find which employee and post are related to this space
                relative_info = await ESPRelationship.findOne({
                    where: { sid: cid },
                    include: [
                        {
                            model: Employee,
                            required: false,
                            attributes: ['emp_id', 'cid'],
                            include: [
                                {
                                    model: User,
                                    attributes: ['full_name']
                                }
                            ]
                        },
                        {
                            model: Post,
                            required: false,
                            attributes: ['cid', 'pname']
                        }
                    ]
                });
            }

            // prepare the id(if employee: emp_id, if post: pid, if space: sid)
            let id: number = 0;
            if (contact_type === "employee") {
                id = contactable.Employee!.emp_id;
            } else if (contact_type === "post") {
                id = contactable.Post!.cid;
            } else if (contact_type === "space") {
                id = contactable.Space!.cid;
            }

            // Prepare the response
            let contactData: any = {
                id: id,
                cid: contactInfo.cid,
                contact_type: contact_type,
                is_favorite: isFavorited,
                contact_infos: contactInfo.ContactInfos || [],
                relative_info,
            };

            return res.status(200).json({
                message: "اطلاعات با موفقیت دریافت شدند!",
                contact: contactData
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "خطای داخلی سرور!" });
        }
    }
}