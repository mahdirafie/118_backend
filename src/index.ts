import express from "express";
import sequelize from "./config/database.js";
import { Request, Response } from "express";

// Controllers
import { UserController } from "./controllers/user.controller.js";

// Import associations function
import { applyAssociations } from "./models/associations.js";

const app = express();
const PORT = 4000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Node.js backend with Sequelize!");
});

app.post("/user/signup", UserController.signupUser);

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
