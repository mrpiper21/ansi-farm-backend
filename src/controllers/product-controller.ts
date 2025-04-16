import Product, { IProduct } from "../model/productModel";
import { uploadToCloudinary } from "../config/cloudinary"; // Optional for image uploads
import mongoose from "mongoose";

export const createProduct = async (req: any, res: any) => {
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
			const uploadResult = await uploadToCloudinary(req.file);
			imageUrl = uploadResult.secure_url;
		} else if (req.body.image) {
			// If image is passed as base64 or URL
			imageUrl = req.body.image;
		}

		// Create new product
		const newProduct: IProduct = new Product({
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
	} catch (error) {
		console.error("Error creating product:", error);
		res.status(500).json({
			success: false,
			message: "Server error while creating product",
		});
	}
};

export const getProducts = async (req: any, res: any) => {
	console.log("Fetching farmer produce...");
	try {
		const { category, farmerId } = req.query;

		// Create filter object
		const filter: any = {};

		if (category) {
			if (
				!["fruits", "vegetables", "grains", "dairy", "herbs"].includes(category)
			) {
				return res.status(400).json({
					success: false,
					message: "Invalid product category",
				});
			}
			filter.category = category;
		}

		if (farmerId) {
			if (!mongoose.Types.ObjectId.isValid(farmerId)) {
				return res.status(400).json({
					success: false,
					message: "Invalid farmer ID",
				});
			}
			filter.farmer = farmerId;
		}

		console.log("Query filter:", filter);

		const products = await Product.find(filter)
			.populate("farmer", "name email avatar")
			.sort({ createdAt: -1 })
			.lean();

		console.log(`Found ${products.length} products`);

		res.status(200).json({
			success: true,
			count: products.length,
			data: products,
		});
	} catch (error) {
		console.error("Error fetching products:", error);
		let errorMessage = "Server error while fetching products";
		if (error instanceof mongoose.Error.ValidationError) {
			errorMessage = "Data validation error";
		} else if (error instanceof mongoose.Error.CastError) {
			errorMessage = "Invalid data format";
		}

		res.status(500).json({
			success: false,
			message: errorMessage,
		});
	}
};

export const getFarmerProducts = async (req: any, res: any) => {
	try {
		const farmerId = req.params.id;

		const products = await Product.find({ farmer: farmerId });

		res.status(200).json({
			success: true,
			data: products,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Server error while fetching products",
		});
	}
};

export const updateProduct = async (req: any, res: any) => {
	try {
		const productId = req.params.id;
		const updates = req.body;

		if (!mongoose.Types.ObjectId.isValid(productId)) {
			return res.status(400).json({
				success: false,
				message: "Invalid product ID",
			});
		}

		const product = await Product.findOne({
			_id: productId,
			// farmer: req.user._id // Ensure the logged-in user owns this product
		});

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found or you don't have permission to edit it",
			});
		}

		if (
			updates.category &&
			!["fruits", "vegetables", "grains", "dairy", "herbs"].includes(
				updates.category
			)
		) {
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

		const updatedProduct = await Product.findByIdAndUpdate(
			productId,
			{
				...updates,
				updatedAt: Date.now(),
			},
			{ new: true, runValidators: true }
		);

		res.status(200).json({
			success: true,
			data: updatedProduct,
			message: "Product updated successfully",
		});
	} catch (error) {
		console.error("Error updating product:", error);
		res.status(500).json({
			success: false,
			message: "Server error while updating product",
		});
	}
};

export const deleteProduct = async (req: any, res: any) => {
	try {
		const productId = req.params.id;

		if (!mongoose.Types.ObjectId.isValid(productId)) {
			return res.status(400).json({
				success: false,
				message: "Invalid product ID",
			});
		}

		const product = await Product.findOne({
			_id: productId,
			// farmer: req.user._id // Ensure the logged-in user owns this product
		});

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found or you don't have permission to delete it",
			});
		}

		await Product.findByIdAndDelete(productId);

		res.status(200).json({
			success: true,
			message: "Product deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting product:", error);
		res.status(500).json({
			success: false,
			message: "Server error while deleting product",
		});
	}
};
