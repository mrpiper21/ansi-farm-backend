"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/db/connectDB.ts
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const connectDB = async () => {
    try {
        if (!env_1.MONGO_URI) {
            throw new Error("MongoDB connection URI is not defined");
        }
        await mongoose_1.default.connect(env_1.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            maxPoolSize: 10, // Maintain up to 10 socket connections
            retryWrites: true,
            w: "majority",
        });
        console.log("MongoDB connected successfully");
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
// Connection events
mongoose_1.default.connection.on("connected", () => {
    console.log("Mongoose connected to DB cluster");
});
mongoose_1.default.connection.on("error", (error) => {
    console.error("Mongoose connection error:", error);
});
mongoose_1.default.connection.on("disconnected", () => {
    console.log("Mongoose disconnected");
});
// Close the Mongoose connection when the Node process ends
process.on("SIGINT", async () => {
    await mongoose_1.default.connection.close();
    process.exit(0);
});
exports.default = connectDB;
