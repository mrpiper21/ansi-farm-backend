import dotenv from "dotenv";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import resourceRoute from "./routes/resourcRoutes";
import productRoute from "./routes/productRoutes";
import orderRoute from "./routes/orderRoutes";
import chatRoutes from "./routes/chatRoutes";
import db from "./config/db";
import morgan from "morgan";
import { seedDatabase } from "./config/seeResources";
import multer from "multer";
import { createServer } from "http";
import { Server } from "socket.io";
import { Chat, Message } from "./model/chatModel";
import User from "./model/User";

dotenv.config();

// Verify environment variables are loaded
console.log("Environment:", {
	MONGO_URI: process.env.MONGO_URI ? "*****" : "NOT FOUND",
	NODE_ENV: process.env.NODE_ENV,
});

const app: Express = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
	cors: {
		origin: process.env.CLIENT_URL || "exp://172.20.10.8:8081",
		methods: ["GET", "POST"],
	},
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Socket.io connection handler
io.on("connection", (socket) => {
	console.log("A user connected:", socket.id);

	// Join a room based on user ID
	socket.on("join", async (userId: string) => {
		try {
			// Validate user exists
			const user = await User.findById(userId);
			if (!user) {
				console.log(`User ${userId} not found`);
				return;
			}

			socket.join(userId);
			console.log(`User ${userId} joined their room`);

			// Notify user they're connected
			socket.emit("connectionStatus", {
				status: "connected",
				userId,
			});
		} catch (error) {
			console.error("Error joining room:", error);
		}
	});

	// Handle sending messages
	socket.on("sendMessage", async (data) => {
		try {
			const { senderId, receiverId, content, chatId } = data;

			// Validate required fields
			if (!senderId || !receiverId || !content || !chatId) {
				throw new Error("Missing required message fields");
			}

			// Get sender and receiver
			const [sender, receiver] = await Promise.all([
				User.findById(senderId),
				User.findById(receiverId),
			]);

			if (!sender || !receiver) {
				throw new Error("Sender or receiver not found");
			}

			// Create and save message
			const newMessage = new Message({
				sender: sender._id,
				receiver: receiver._id,
				content,
			});

			await newMessage.save();

			// Update chat with new message
			const updatedChat = await Chat.findByIdAndUpdate(
				chatId,
				{
					$push: { messages: newMessage._id },
					$set: { updatedAt: new Date() },
				},
				{ new: true }
			).populate("participants");

			if (!updatedChat) {
				throw new Error("Chat not found");
			}

			// Prepare response data
			const messageData = {
				_id: newMessage._id,
				sender: {
					_id: sender._id,
					userName: sender.userName,
					profileImage: sender.profileImage,
				},
				receiver: {
					_id: receiver._id,
					userName: receiver.userName,
				},
				content,
				timestamp: newMessage.timestamp,
				read: false,
				chatId,
			};

			// Emit to sender and receiver
			io.to(senderId).emit("newMessage", messageData);
			io.to(receiverId).emit("newMessage", messageData);

			// Update unread count for receiver
			const receiverChat = await Chat.findOneAndUpdate(
				{ _id: chatId, participants: receiverId },
				{ $inc: { unreadCount: 1 } },
				{ new: true }
			);
		} catch (error: any) {
			console.error("Error sending message:", error);
			socket.emit("messageError", {
				error: "Failed to send message",
				details: error?.message,
			});
		}
	});

	// Handle message read status
	socket.on("markAsRead", async ({ messageId, userId }) => {
		try {
			await Message.findByIdAndUpdate(messageId, { read: true });

			// Update unread count in chat
			await Chat.findOneAndUpdate(
				{ messages: messageId, participants: userId },
				{ $inc: { unreadCount: -1 } }
			);
		} catch (error) {
			console.error("Error marking message as read:", error);
		}
	});

	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
	});
});

// Database connection and server startup
const startServer = async () => {
	try {
		// 1. First connect to database
		await db();
		// await seedDatabase();

		// 3. Only then start the server
		const PORT: number = parseInt(process.env.PORT || "5000", 10);
		httpServer.listen(PORT, () => {
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
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/chats", chatRoutes);
app.use((err: any, req: any, res: any, next: any) => {
	if (err instanceof multer.MulterError) {
		if (err.code === "LIMIT_FILE_SIZE") {
			return res.status(400).json({
				success: false,
				message: "File size too large. Maximum size is 5MB.",
			});
		}
		return res.status(400).json({
			success: false,
			message: err.message,
		});
	}

	// For other errors
	console.error(err);
	res.status(500).json({
		success: false,
		message: "Something went wrong",
	});
});

// Health check
app.get("/", (req: Request, res: Response) => {
	res.json({ message: "API is running" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error(err.stack);
	res.status(500).json({ error: "Internal Server Error" });
});

startServer();