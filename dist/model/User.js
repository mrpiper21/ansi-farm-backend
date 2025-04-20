"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    profileImage: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["client", "farmer"],
        default: "client",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    location: {
        type: String,
    },
    description: {
        type: String,
    },
    phone: {
        type: String,
    },
    orders: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Order",
        },
    ],
});
exports.default = (0, mongoose_1.model)("User", userSchema);
