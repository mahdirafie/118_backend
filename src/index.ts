import express from "express";
import sequelize from "./config/database.js";
import { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

// Controllers
import { AuthController } from "./controllers/auth.controller.js";
import { FavoriteController } from "./controllers/favorite.controller.js";
import { UserController } from "./controllers/user.controller.js";
import { EmployeeController } from "./controllers/employee.controller.js";
import { SearchController } from "./controllers/search.controller.js";
import { FacultyController } from "./controllers/faculty.controller.js";
import { PostController } from "./controllers/post.controller.js";
import { SpaceController } from "./controllers/space.controller.js";

// Import associations function
import { applyAssociations } from "./models/associations.js";

import { OTP } from "./models/otp.model.js";
import ESPRelationship from "./models/esp_relationship.model.js";
import { ESPRelationshipController } from "./controllers/esp.controller.js";
import { ContactableController } from "./controllers/contactable.controller.js";
import { GroupController } from "./controllers/group.controller.js";
import { AttributeController } from "./controllers/attribute.controller.js";
import { authenticate } from "./middlewares/authenticate.middleware.js";

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors());

dotenv.config();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Node.js backend with Sequelize!");
});

// Routes

// auth related routes
app.post("/auth/signup", AuthController.signupUser);
app.post("/auth/login", AuthController.loginUser);
app.post("/auth/refresh", AuthController.refreshToken);
app.post("/auth/send-otp", AuthController.sendOTP);
app.post("/auth/verify-otp", AuthController.verifyOTP);
app.post("/auth/createemp", AuthController.createEmployee);
app.post("/auth/register-employeef", AuthController.registerFacultyEmployee);
app.post("/auth/register-employeen", AuthController.registerNonFacultyEmployee);

// favorite related routes
app.post('/favorite/add-fav', authenticate, FavoriteController.addFavorite);
app.get('/favorite/user/get-fav-cats',authenticate, FavoriteController.getUserFavoriteCategories);
app.post('/favorite/add-fav-cat', authenticate, FavoriteController.addFavoriteCategory);
app.delete('/favorite/delete-cat/:favcat_id', authenticate, FavoriteController.deleteFavoriteCategory);
app.put('/favorite/update-cat', authenticate, FavoriteController.updateFavoriteCategory);
app.delete('/favorite/del-fav/:cid', authenticate, FavoriteController.deleteContactableFromFavorite);
app.get('/favorite/get-favcat-favs/:favcat_id', authenticate, FavoriteController.getFavCatFavorites);

// faculty related routes
app.post('/faculty/create', FacultyController.createFaculty);
app.post('/faculty/create-department', FacultyController.createDepartment);
app.get('/faculty/get-all', FacultyController.getAllFaculties);
app.get('/faculty/get-faculty-departments/:fid', FacultyController.getDepartmentsForFaculty);

// profile related routes
app.get('/profile', authenticate, UserController.getUserProfile);
app.get('/related',authenticate, UserController.getUserRelatedContacts);

// employee related routes
app.get('/employee/workareas', EmployeeController.getDistinctWorkAreas);
app.post('/employee/create-op', EmployeeController.createEmployeeOperation);

// search related routes
app.get('/search', SearchController.search);
app.post('/search/history/create',authenticate, SearchController.createSearchHistory);
app.get('/search/user-histories', authenticate, SearchController.getSearchHistory);
app.delete('/search/history/delete/:shid',authenticate, SearchController.deleteSearchHistory);

// post related routes
app.post('/post/create', PostController.createPost);

// space related routes
app.post('/space/create', SpaceController.createSpace);

// esp relationship related routes
app.post('/esp/create', ESPRelationshipController.createESPRelationship);

// contactable related routes
app.get('/contactable/info/:cid', authenticate, ContactableController.getContactableInfo);

// group related routes
app.post('/group/create',authenticate, GroupController.createGroup);
app.get('/group/get-emp-groups', authenticate, GroupController.getGroupsByEmployee);
app.get('/group/get-group-members/:gid', authenticate, GroupController.getGroupMembers);
app.delete('/group/delete/:gid', authenticate, GroupController.deleteGroup);
app.post('/group/add-member', authenticate, GroupController.addEmpToGroup);
app.delete('/group/remove-member/:gid/:emp_id', authenticate, GroupController.removeMemberFromGroup);

// attribute related routes
app.get('/attribute/get-all', authenticate, AttributeController.getAllTheAttributes);
app.post('/attribute/create', AttributeController.createAttribute);
app.post('/attribute/set-atts-values', authenticate, AttributeController.setAttributeValues);
app.post('/attribute/set-visible-att-vals-emp', authenticate, AttributeController.setVisibleAttributesForEmployee);
app.post('/attribute/set-visible-att-vals-group', authenticate, AttributeController.setVisibleAttributesForGroup);
app.get('/attribute/get-visible-att-vals/:receiver_id/:type', authenticate, AttributeController.getVisibleAttributeValues);
app.get('/attribute/get-employee-personal-info/:owner_emp_id', authenticate, AttributeController.getEmployeePersonalAttributeValues);

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
    await sequelize.sync(); // use { force: true } to drop & recreate tables
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
