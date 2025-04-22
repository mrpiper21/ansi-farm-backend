"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const farmerCodeSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600
    }
});
// Hash code before saving
farmerCodeSchema.pre('save', async function (next) {
    if (this.isModified('code')) {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.code = await bcryptjs_1.default.hash(this.code, salt);
    }
    next();
});
const FarmerCode = mongoose_1.default.model('FarmerCode', farmerCodeSchema);
exports.default = FarmerCode;
