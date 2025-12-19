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
app.post("/auth/createemp", AuthController.createEmployee);
app.post("/auth/send-otp", AuthController.sendOTP);
app.post("/auth/verify-otp", AuthController.verifyOTP);
app.post("/auth/register-employeef", AuthController.registerFacultyEmployee);
app.post("/auth/register-employeen", AuthController.registerNonFacultyEmployee);

// favorite related routes
app.post('/favorite/add-fav', FavoriteController.addFavorite);
app.post('/favorite/user/get-fav-cats', FavoriteController.getUserFavoriteCategories);
app.post('/favorite/add-fav-cat', FavoriteController.addFavoriteCategory);
app.delete('/favorite/delete-cat', FavoriteController.deleteFavoriteCategory);
app.put('/favorite/update-cat', FavoriteController.updateFavoriteCategory);
app.delete('/favorite/del-fav', FavoriteController.deleteContactableFromFavorite);
app.get('/favorite/get-favcat-favs/:uid/:favcat_id', FavoriteController.getFavCatFavorites);

// faculty related routes
app.post('/faculty/create', FacultyController.createFaculty);
app.post('/faculty/create-department', FacultyController.createDepartment);
app.get('/faculty/get-all', FacultyController.getAllFaculties);
app.get('/faculty/get-faculty-departments/:fid', FacultyController.getDepartmentsForFaculty);

// profile related routes
app.get('/profile/:user_id', UserController.getUserProfile);
app.get('/related/:uid', UserController.getUserRelatedContacts);

// employee related routes
app.get('/employee/workareas', EmployeeController.getDistinctWorkAreas);
app.post('/employee/create-op', EmployeeController.createEmployeeOperation);

// search related routes
app.get('/search', SearchController.search);
app.post('/search/history/create', SearchController.createSearchHistory);
app.get('/search/user-histories/:uid', SearchController.getSearchHistory);
app.delete('/search/history/delete/:shid', SearchController.deleteSearchHistory);

// post related routes
app.post('/post/create', PostController.createPost);

// space related routes
app.post('/space/create', SpaceController.createSpace);

// esp relationship related routes
app.post('/esp/create', ESPRelationshipController.createESPRelationship);

// contactable related routes
app.get('/contactable/info/:cid/:uid', ContactableController.getContactableInfo);

// group related routes
app.post('/group/create', GroupController.createGroup);
app.get('/group/get-emp-groups/:emp_id', GroupController.getGroupsByEmployee);
app.get('/group/get-group-members/:gid', GroupController.getGroupMembers);

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
