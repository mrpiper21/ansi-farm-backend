"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/Tip.ts
const mongoose_1 = __importDefault(require("mongoose"));
const tipSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    type: {
        type: String,
        required: true,
        enum: ['article', 'video']
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['soil', 'irrigation', 'crops', 'pests']
    },
    imageUrl: {
        type: String,
        required: function () { return this.type === 'article'; }
    },
    videoUrl: {
        type: String,
        required: function () { return this.type === 'video'; }
    },
    thumbnail: {
        type: String,
        required: function () { return this.type === 'video'; }
    },
    duration: {
        type: String,
        required: function () { return this.type === 'video'; }
    },
    createdAt: { type: Date, default: Date.now }
});
const Tip = mongoose_1.default.model('Tip', tipSchema);
exports.default = Tip;
