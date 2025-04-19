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
		const filter: mongoose.FilterQuery<typeof Product> = {};

		// Validate and apply category filter
		if (category) {
			if (typeof category !== "string") {
				return res.status(400).json({
					success: false,
					message: "Category must be a string",
				});
			}

			const validCategories = [
				"fruits",
				"vegetables",
				"grains",
				"dairy",
				"herbs",
			];
			if (!validCategories.includes(category)) {
				return res.status(400).json({
					success: false,
					message: `Invalid product category. Must be one of: ${validCategories.join(
						", "
					)}`,
				});
			}
			filter.category = category;
		}

		if (farmerId) {
			if (typeof farmerId !== "string") {
				return res.status(400).json({
					success: false,
					message: "Farmer ID must be a string",
				});
			}

			if (!mongoose.Types.ObjectId.isValid(farmerId)) {
				return res.status(400).json({
					success: false,
					message: "Invalid farmer ID format",
				});
			}
			filter.farmer = new mongoose.Types.ObjectId(farmerId);
		}

		// Execute query
		const products = await Product.find(filter)
			.populate({
				path: "farmer",
				select: "userName email avatar",
				model: "User", // Explicitly specify the model
			})
			.sort({ createdAt: -1 })
			.lean()
			.exec(); // Always use exec() with promises

		res.status(200).json({
			success: true,
			count: products.length,
			data: products,
		});
	} catch (error: unknown) {
		console.error("Error fetching products:", error);

		// Type-safe error handling
		if (error instanceof mongoose.Error.ValidationError) {
			return res.status(400).json({
				success: false,
				message: "Validation error",
				errors: error.errors,
			});
		}

		if (error instanceof mongoose.Error.CastError) {
			return res.status(400).json({
				success: false,
				message: "Invalid data format",
				field: error.path,
			});
		}

		if (error instanceof Error) {
			return res.status(500).json({
				success: false,
				message: "Server error while fetching products",
				error:
					process.env.NODE_ENV === "development" ? error.message : undefined,
			});
		}

		res.status(500).json({
			success: false,
			message: "Unknown server error",
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


export const getProductDetails = async (req: any, res: any) => {
    try {
			const productId = req.params.id;
			const product = await Product.findById(productId)
				.populate("farmer", "userName email avatar") // only include needed fields
				.lean()
				.exec();

			if (!product) {
				return res.status(404).json({ message: "Product not found" });
			}

			return res.json(product);
		} catch (error) {
			console.error("Error fetching product details:", error);
			res.status(500).json({ message: "Internal server error" });
		}
};