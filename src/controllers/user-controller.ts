import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../model/User';
import jwt from 'jsonwebtoken';
import Product from "../model/productModel";

async function registerUser(req: any, res: any) {
	console.log("registeration payload", req.body);
	try {
		const { userName, email, password, type = "client", location } = req.body;

		// Validate input fields
		if (!userName || !email || !password) {
			return res.status(400).json({
				message: "Please provide all required fields",
			});
		}
		if (password.length < 8) {
			return res.status(400).json({
				message: "Password must be at least 8 characters long",
			});
		}
		const existingUser = await User.findOne({
			$or: [{ email }, { userName }],
		});

		if (existingUser) {
			return res.status(409).json({
				message: "User with this email or username already exists",
			});
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const newUser = new User({
			userName,
			email,
			password: hashedPassword,
			type,
			location: location || "",
			createdAt: new Date(),
		});
		await newUser.save();

		return res.status(201).json({
			message: "User registered successfully",
			user: {
				userName: newUser.userName,
				email: newUser.email,
				type: newUser.type,
				location: newUser.location,
			},
		});
	} catch (error: any) {
		console.error("Registration error:", error);

		// Handle specific mongoose validation errors
		if (error?.name === "ValidationError") {
			return res.status(400).json({
				message: "Validation failed",
				errors: Object.values(error.errors).map((err: any) => err?.message),
			});
		}

		// Generic server error
		res.status(500).json({
			message: "Server error during registration",
		});
	}
}

async function login(req: any, res: any) {
	try {
		const { email, password } = req.body;

		console.log(email, password);

		// Validate input
		if (!email || !password) {
			return res.status(400).json({
				message: "Please provide both email/username and password",
			});
		}

		// Find user by email or username
		const user = await User.findOne({
			$or: [{ email: email }, { userName: email }],
		});

		if (!user) {
			return res.status(401).json({
				message: "Invalid credentials",
			});
		}

		// Compare passwords
		const isMatch = await bcrypt.compare(password, user?.password);
		if (!isMatch) {
			return res.status(401).json({
				message: "Invalid credentials",
			});
		}

		// Create JWT token
		const token = jwt.sign(
			{
				userId: user._id,
				userType: user.type,
			},
			process.env.JWT_SECRET!,
			{ expiresIn: "1h" }
		);

		console.log("login success", user);

		// Return success response with token
		return res.status(200).json({
			message: "Login successful",
			user: {
				id: user._id,
				userName: user.userName,
				email: user.email,
				type: user.type,
				location: user.location,
			},
			token,
		});
	} catch (error) {
		console.error("Login error:", error);

		// Handle JWT errors
		if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({
				message: "Invalid token",
			});
		}

		// Generic server error
		res.status(500).json({
			message: "Server error during login",
		});
	}
}

export const getFarmers = async (req: any, res: any) => {
	try {
		const farmers = await User.find({ type: "farmer" })
			.select("name email avatar location description")
			.lean()
			.exec();

		// Add products count to each farmer
		const farmersWithCounts = await Promise.all(
			farmers.map(async (farmer) => {
				const count = await Product.countDocuments({ farmer: farmer._id });
				return { ...farmer, productsCount: count };
			})
		);

		res.json({
			success: true,
			data: farmersWithCounts,
		});
	} catch (error) {
		console.error("Error fetching farmers:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch farmers",
		});
	}
};

export const getFarmerDetails = async (req: any, res: any) => {
	try {
		const farmer = await User.findById(req.params.id)
			.select(
				"userName email profileImage location description phone createdAt"
			)
			.populate({
				path: "orders",
				select: "status totalAmount createdAt",
				match: { status: { $ne: "cancelled" } }, // Optional: filter out cancelled orders
				options: { sort: { createdAt: -1 }, limit: 10 }, // Get latest 10 orders
			})
			.lean()
			.exec();

		if (!farmer) {
			return res.status(404).json({
				success: false,
				error: "Farmer not found",
			});
		}

		// Get products count
		const productsCount = await Product.countDocuments({
			farmer: req.params.id,
		});

		res.json({
			success: true,
			data: {
				...farmer,
				productsCount,
			},
		});
	} catch (error) {
		console.error("Error fetching farmer details:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch farmer details",
		});
	}
};

  export {registerUser, login} 