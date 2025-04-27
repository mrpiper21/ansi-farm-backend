"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const resourcRoutes_1 = __importDefault(require("./routes/resourcRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const db_1 = __importDefault(require("./config/db"));
const morgan_1 = __importDefault(require("morgan"));
const multer_1 = __importDefault(require("multer"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const chatModel_1 = require("./model/chatModel");
const User_1 = __importDefault(require("./model/User"));
dotenv_1.default.config();
// Verify environment variables are loaded
console.log("Environment:", {
    MONGO_URI: process.env.MONGO_URI ? "*****" : "NOT FOUND",
    NODE_ENV: process.env.NODE_ENV,
});
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Socket.io setup
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "exp://172.20.10.8:8081",
        methods: ["GET", "POST"],
    },
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, morgan_1.default)("dev"));
// Socket.io connection handler
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    // Join a room based on user ID
    socket.on("join", async (userId) => {
        try {
            // Validate user exists
            const user = await User_1.default.findById(userId);
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
        }
        catch (error) {
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
                User_1.default.findById(senderId),
                User_1.default.findById(receiverId),
            ]);
            if (!sender || !receiver) {
                throw new Error("Sender or receiver not found");
            }
            // Create and save message
            const newMessage = new chatModel_1.Message({
                sender: sender._id,
                receiver: receiver._id,
                content,
            });
            await newMessage.save();
            // Update chat with new message
            const updatedChat = await chatModel_1.Chat.findByIdAndUpdate(chatId, {
                $push: { messages: newMessage._id },
                $set: { updatedAt: new Date() },
            }, { new: true }).populate("participants");
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
            const receiverChat = await chatModel_1.Chat.findOneAndUpdate({ _id: chatId, participants: receiverId }, { $inc: { unreadCount: 1 } }, { new: true });
        }
        catch (error) {
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
            await chatModel_1.Message.findByIdAndUpdate(messageId, { read: true });
            // Update unread count in chat
            await chatModel_1.Chat.findOneAndUpdate({ messages: messageId, participants: userId }, { $inc: { unreadCount: -1 } });
        }
        catch (error) {
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
        await (0, db_1.default)();
        // await seedDatabase();
        // 3. Only then start the server
        const PORT = parseInt(process.env.PORT || "5000", 10);
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to initialize server:", error);
        process.exit(1);
    }
};
// Routes
app.use("/api/users", userRoutes_1.default);
app.use("/api", resourcRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/chats", chatRoutes_1.default);
app.use((err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
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
app.get("/", (req, res) => {
    res.json({ message: "API is running" });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});
startServer();
