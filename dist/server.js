"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // This should be at the very top
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const resourcRoutes_1 = __importDefault(require("./routes/resourcRoutes"));
const db_1 = __importDefault(require("./config/db"));
const morgan_1 = __importDefault(require("morgan"));
const seeResources_1 = require("./config/seeResources");
// Verify environment variables are loaded
console.log("Environment:", {
    MONGO_URI: process.env.MONGO_URI ? "*****" : "NOT FOUND",
    NODE_ENV: process.env.NODE_ENV,
});
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, morgan_1.default)("dev"));
// Database connection and server startup
const startServer = async () => {
    try {
        // 1. First connect to database
        await (0, db_1.default)();
        // 2. Then seed database if needed
        await (0, seeResources_1.seedDatabase)();
        // 3. Only then start the server
        const PORT = parseInt(process.env.PORT || "5000", 10);
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to initialize server:", error);
        process.exit(1);
    }
};
// Routes
app.use("/api/users", userRoutes_1.default);
app.use("/api", resourcRoutes_1.default);
// Health check
app.get("/", (req, res) => {
    res.json({ message: "API is running" });
});
// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});
// Start the server
startServer();
