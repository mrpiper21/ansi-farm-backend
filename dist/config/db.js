"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Debug: Verify the URI is loaded
console.log("DB Connection - MONGO_URI:", process.env.MONGO_URI ? "*****" : "MISSING");
const MONGO_URI = process.env.MONGO_URI; // Type assertion since we verified it exists
if (!MONGO_URI) {
    throw new Error("MongoDB URI is required in environment variables");
}
const connectDB = async () => {
    try {
        console.log("Attempting to connect to MongoDB...");
        await mongoose_1.default.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 30000,
        });
        console.log("MongoDB connected successfully");
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error; // Rethrow to handle in server startup
    }
};
mongoose_1.default.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err);
});
mongoose_1.default.connection.on("disconnected", () => {
    console.log("Mongoose disconnected");
});
exports.default = connectDB;
