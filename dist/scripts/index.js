"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCode = exports.generate4DigitPin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generate4DigitPin = () => {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
};
exports.generate4DigitPin = generate4DigitPin;
const validateCode = async (storedCode, inputCode) => {
    return await bcryptjs_1.default.compare(inputCode, storedCode);
};
exports.validateCode = validateCode;
