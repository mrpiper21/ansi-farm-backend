// config/db.ts
import mongoose from "mongoose";

const connectDB = async () => {
	try {
		if (!process.env.MONGO_URI) {
			throw new Error("MONGO_URI environment variable is not defined");
		}

		const conn = await mongoose.connect(process.env.MONGO_URI);
		console.log(`MongoDB Connected: ${conn.connection.host}`);
		return conn;
	} catch (error) {
		console.error(
			`Error connecting to MongoDB: ${
				error instanceof Error ? error.message : error
			}`
		);
		process.exit(1);
	}
};

export default connectDB;
