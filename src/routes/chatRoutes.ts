import { getAllChats, getChatMessages, startNewChat } from "../controllers/chatController";
import express from "express";
import { Request, Response } from "express";

const router = express.Router();

// Middleware to check if user is authenticated
// const authenticate = (req: Request, res: Response, next: Function) => {
//   if (!req.user) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
//   next();
// };

// Get all chats for a user
router.get("/all/:id", getAllChats);

// Get messages for a specific chat
router.get("/:chatId/:userId/messages", getChatMessages);

// Start a new chat
router.post("/:userId", startNewChat);

export default router;