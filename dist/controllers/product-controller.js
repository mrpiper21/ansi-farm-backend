"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getFarmerProducts = exports.getProducts = exports.createProduct = void 0;
const productModel_1 = __importDefault(require("../model/productModel"));
const cloudinary_1 = require("../config/cloudinary"); // Optional for image uploads
const mongoose_1 = __importDefault(require("mongoose"));
const createProduct = async (req, res) => {
    try {
        const { name, category, description, price, quantity } = req.body;
        const farmerId = req.params.id;
        console.log("user id ----- ", farmerId);
        // Validate required fields
        if (!name || !category || !price) {
            return res.status(400).json({
                success: false,
                message: "Name, category, and price are required fields",
            });
        }
        // Handle image upload if exists
        let imageUrl;
        if (req.file) {
            const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(req.file);
            imageUrl = uploadResult.secure_url;
        }
        else if (req.body.image) {
            // If image is passed as base64 or URL
            imageUrl = req.body.image;
        }
        // Create new product
        const newProduct = new productModel_1.default({
            name,
            category,
            description,
            price: parseFloat(price),
            quantity,
            imageUrl,
            farmer: farmerId,
        });
        await newProduct.save();
        res.status(201).json({
            success: true,
            data: newProduct,
            message: "Product listed successfully",
        });
    }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating product",
        });
    }
};
exports.createProduct = createProduct;
const getProducts = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};
        const products = await productModel_1.default.find(filter)
            .populate("farmer", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: products,
        });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching products",
        });
    }
};
exports.getProducts = getProducts;
const getFarmerProducts = async (req, res) => {
    try {
        const farmerId = req.params.id;
        const products = await productModel_1.default.find({ farmer: farmerId });
        res.status(200).json({
            success: true,
            data: products,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error while fetching products",
        });
    }
};
exports.getFarmerProducts = getFarmerProducts;
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updates = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }
        const product = await productModel_1.default.findOne({
            _id: productId,
            // farmer: req.user._id // Ensure the logged-in user owns this product
        });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or you don't have permission to edit it",
            });
        }
        if (updates.category &&
            !["fruits", "vegetables", "grains", "dairy", "herbs"].includes(updates.category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product category",
            });
        }
        if (updates.price && updates.price < 0) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be negative",
            });
        }
        const updatedProduct = await productModel_1.default.findByIdAndUpdate(productId, {
            ...updates,
            updatedAt: Date.now(),
        }, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            data: updatedProduct,
            message: "Product updated successfully",
        });
    }
    catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating product",
        });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }
        const product = await productModel_1.default.findOne({
            _id: productId,
            // farmer: req.user._id // Ensure the logged-in user owns this product
        });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or you don't have permission to delete it",
            });
        }
        await productModel_1.default.findByIdAndDelete(productId);
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting product",
        });
    }
};
exports.deleteProduct = deleteProduct;
