"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const resourcRoutes_1 = __importDefault(require("./routes/resourcRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const db_1 = __importDefault(require("./config/db"));
const morgan_1 = __importDefault(require("morgan"));
const multer_1 = __importDefault(require("multer"));
dotenv_1.default.config();
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
        // await seedDatabase();
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
app.use("/api/products", productRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use((err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size too large. Maximum size is 5MB.",
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    // For other errors
    console.error(err);
    res.status(500).json({
        success: false,
        message: "Something went wrong",
    });
});
// Health check
app.get("/", (req, res) => {
    res.json({ message: "API is running" });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});
startServer();
