"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFarmerCode = exports.generateFarmerCode = void 0;
const scripts_1 = require("../scripts");
const farmerCodeModel_1 = __importDefault(require("../model/farmerCodeModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateFarmerCode = async (req, res) => {
    try {
        const { email } = req.body;
        const pin = (0, scripts_1.generate4DigitPin)();
        const codeEntry = await farmerCodeModel_1.default.create({ email: email, code: pin, createdAt: new Date() });
        // Return plain text code for admin to share
        return res.status(201).json({
            success: true,
            code: pin,
            createdAt: new Date()
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error generating farmer code'
        });
    }
};
exports.generateFarmerCode = generateFarmerCode;
// Validate code
const validateFarmerCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        // Find valid code
        const codeEntry = await farmerCodeModel_1.default.findOne({
            email,
            createdAt: { $gt: new Date(Date.now() - 600000) }
        });
        if (!codeEntry) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired code'
            });
        }
        // Validate code
        const isValid = await bcryptjs_1.default.compare(code, codeEntry.code);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid code'
            });
        }
        // Code validated successfully
        res.json({
            success: true,
            message: 'Code validated successfully'
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Validation error'
        });
    }
};
exports.validateFarmerCode = validateFarmerCode;
