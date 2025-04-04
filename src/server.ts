import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import resourceRoute from "./routes/resourcRoutes";
import db from "./config/db";
import morgan from "morgan";
import { seedDatabase } from "./config/seeResources";

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Database connection;
db();

// Routes

app.use("/api/users", userRoutes);
app.use("/api", resourceRoute);
seedDatabase();

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API is running' });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT: number = parseInt(process.env.PORT || '5000', 10);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});