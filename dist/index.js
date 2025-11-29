import express from "express";
import sequelize from "./config/database.js";
const app = express();
const PORT = 4000;
app.get("/", (req, res) => {
    res.send("Hello, TypeScript + Node.js backend with Sequelize!");
});
// -------------------------
// Connect to DB and sync models
// -------------------------
(async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected!");
        // Sync all models
        await sequelize.sync(); // use { force: true } to drop & recreate tables
        console.log("✅ Models synced!");
        // Optional: create a test user
        // await User.create({ national_code: '1234567890', name: 'Ali', phone: '09123456789' });
    }
    catch (error) {
        console.error("❌ Unable to connect to the database:", error);
    }
})();
// -------------------------
// Start server
// -------------------------
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map