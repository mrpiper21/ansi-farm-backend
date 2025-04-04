"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(env_1.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout for initial connection
        });
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process with failure
    }
};
// Connection events
mongoose_1.default.connection.on('connected', () => {
    console.log('Mongoose connected to DB cluster');
});
mongoose_1.default.connection.on('error', (error) => {
    console.error('Mongoose connection error:', error);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});
exports.default = connectDB;
