"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.getResources = exports.createResource = void 0;
const Resource_1 = __importDefault(require("../model/Resource"));
// Create a new resource
const createResource = async (req, res) => {
    try {
        // Validate category
        const validCategories = ["crops", "soil", "pests", "irrigation"];
        if (!validCategories.includes(req.body.category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category",
            });
        }
        const resource = new Resource_1.default(req.body);
        await resource.save();
        res.status(201).json({
            success: true,
            data: resource,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.createResource = createResource;
// Get all resources with pagination and filtering
const getResources = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Build query based on filters
        const query = {};
        // Filter by category if provided
        if (req.query.category && req.query.category !== "all") {
            query.category = req.query.category;
        }
        // Filter by content type if provided
        if (req.query.contentType) {
            query.contentType = req.query.contentType;
        }
        const [resources, total] = await Promise.all([
            Resource_1.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Resource_1.default.countDocuments(query),
        ]);
        res.json({
            success: true,
            data: resources,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error?.message,
        });
    }
};
exports.getResources = getResources;
// Get resource categories
const getCategories = async (req, res) => {
    try {
        const categories = [
            { id: "all", name: "All Resources" },
            { id: "crops", name: "Crop Guides" },
            { id: "soil", name: "Soil Health" },
            { id: "pests", name: "Pest Control" },
            { id: "irrigation", name: "Irrigation" },
        ];
        res.json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getCategories = getCategories;
