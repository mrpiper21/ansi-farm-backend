// src/db/connectDB.ts
import mongoose from "mongoose";
import { MONGO_URI } from "../config/env";

const connectDB = async () => {
	try {
		if (!MONGO_URI) {
			throw new Error("MongoDB connection URI is not defined");
		}

		await mongoose.connect(MONGO_URI, {
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
			maxPoolSize: 10, // Maintain up to 10 socket connections
			retryWrites: true,
			w: "majority",
		});

		console.log("MongoDB connected successfully");
	} catch (error) {
		console.error("MongoDB connection error:", error);
		process.exit(1);
	}
};

// Connection events
mongoose.connection.on("connected", () => {
	console.log("Mongoose connected to DB cluster");
});

mongoose.connection.on("error", (error) => {
	console.error("Mongoose connection error:", error);
});

mongoose.connection.on("disconnected", () => {
	console.log("Mongoose disconnected");
});

// Close the Mongoose connection when the Node process ends
process.on("SIGINT", async () => {
	await mongoose.connection.close();
	process.exit(0);
});

export default connectDB;
