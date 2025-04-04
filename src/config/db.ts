import mongoose from "mongoose";

// Debug: Verify the URI is loaded
console.log(
	"DB Connection - MONGO_URI:",
	process.env.MONGO_URI ? "*****" : "MISSING"
);

const MONGO_URI = process.env.MONGO_URI as string; // Type assertion since we verified it exists

if (!MONGO_URI) {
	throw new Error("MongoDB URI is required in environment variables");
}

const connectDB = async () => {
	try {
		console.log("Attempting to connect to MongoDB...");

		await mongoose.connect(MONGO_URI, {
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 30000,
		});

		console.log("MongoDB connected successfully");
	} catch (error) {
		console.error("MongoDB connection failed:", error);
		throw error; // Rethrow to handle in server startup
	}
};

mongoose.connection.on("error", (err) => {
	console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
	console.log("Mongoose disconnected");
});

export default connectDB;
