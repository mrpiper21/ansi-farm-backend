import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../model/User';
import jwt from 'jsonwebtoken';

async function registerUser(req: any, res: any) {
  console.log("registeration payload", req.body)
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

  export {registerUser, login} 