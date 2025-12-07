import express from "express";
import sequelize from "./config/database.js";
import { Request, Response } from "express";
import dotenv from "dotenv";

// Controllers
import { AuthController } from "./controllers/auth.controller.js";

// Import associations function
import { applyAssociations } from "./models/associations.js";
import { FavoriteController } from "./controllers/favorite.controller.js";

const app = express();
const PORT = 4000;

app.use(express.json());

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

// favorite stuff related reoutes
app.post('/favorite/add-favorite-category', FavoriteController.addFavoriteCategory);

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
