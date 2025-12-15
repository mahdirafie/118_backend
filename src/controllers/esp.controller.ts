import { Request, Response } from "express";
import Employee from "../models/employee.model.js";
import Space from "../models/space.model.js";
import Post from "../models/post.model.js";
import ESPRelationship from "../models/esp_relationship.model.js";

export class ESPRelationshipController {
    static async createESPRelationship(req: Request, res: Response) {
        try {
            const {emp_id, sid, pid} = req.body;

            if(emp_id) {
                const emp = await Employee.findByPk(emp_id);
                if(!emp_id) {
                    return res.status(400).json({message: "این کارمند وجود ندارد!"});
                }
            }

            if(sid) {
                const space = await Space.findByPk(sid);
                if(!space) {
                    return res.status(400).json({message: "این فضا وجود ندارد!"});
                }
            }

            if(pid) {
                const post = await Post.findByPk(pid);
                if(!post) {
                    return res.status(400).json({message: "این پست کاری وجود ندارد!"});
                }
            }

            ESPRelationship.create({emp_id, sid, pid});

            return res.status(201).json({message: "رابطه فضاو پست و کارمند ساخته شد!"});

        }catch(error) {
            console.log(error);
            return res.status(500).json({message: "خطای داخلی سرور!"});
        }
    }
}