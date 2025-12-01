import express from "express";
import sequelize from "./config/database.js";
import { Request, Response } from "express";

// Import all models
import Faculty from "./models/faculty.model.js";
import Department from "./models/department.model.js";
import PersonalAttribute from "./models/personal_att.model.js";
import PersonalAttributeValue from "./models/personal_att_val.model.js";
import User from "./models/user.model.js";
import FavoriteCategory from "./models/favorite_category.model.js";
import Contactable from "./models/contactable.model.js";
import Favorite from "./models/favorite.model.js";
import ContactInfo from "./models/contact_info.model.js";
import Employee from "./models/employee.model.js";
import EmployeeFacultyMember from "./models/employee_fm.model.js";
import EmployeeNonFacultyMember from "./models/employee_nfm.model.js";
import EmployeeOperation from "./models/employee_operations.model.js";
import Reminder from "./models/reminder.model.js";
import Group from "./models/group.model.js";
import GroupMembership from "./models/group_membership.model.js";
import SharesToGroup from "./models/shares_to_group.model.js";
import SharesToEmployee from "./models/shares_to_employee.model.js";
import Post from "./models/post.model.js";
import Space from "./models/space.model.js";
import ESPRelationship from "./models/esp_relationship.model.js";

// Import associations function
import { applyAssociations } from "./models/associations.js";

const app = express();
const PORT = 4000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Node.js backend with Sequelize!");
});

// -------------------------
// Connect to DB and sync models
// -------------------------

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected!");

    // Apply all model associations
    applyAssociations();

    // Sync all models
    await sequelize.sync({force: true}); // use { force: true } to drop & recreate tables
    console.log("✅ Models synced!");
    
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
})();

// -------------------------
// Start server
// -------------------------

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
