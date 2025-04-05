import dotenv from "dotenv";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import resourceRoute from "./routes/resourcRoutes";
import db from "./config/db";
import morgan from "morgan";
import { seedDatabase } from "./config/seeResources";
dotenv.config();

// Verify environment variables are loaded
console.log("Environment:", {
	MONGO_URI: process.env.MONGO_URI ? "*****" : "NOT FOUND",
	NODE_ENV: process.env.NODE_ENV,
});

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Database connection and server startup
const startServer = async () => {
	try {
		// 1. First connect to database
		await db();
		// await seedDatabase();

		// 3. Only then start the server
		const PORT: number = parseInt(process.env.PORT || "5000", 10);
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Failed to initialize server:", error);
		process.exit(1);
	}
};

// Routes
app.use("/api/users", userRoutes);
app.use("/api", resourceRoute);

// Health check
app.get("/", (req: Request, res: Response) => {
	res.json({ message: "API is running" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error(err.stack);
	res.status(500).json({ error: "Internal Server Error" });
});

startServer();
