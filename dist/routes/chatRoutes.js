"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chatController_1 = require("../controllers/chatController");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Middleware to check if user is authenticated
// const authenticate = (req: Request, res: Response, next: Function) => {
//   if (!req.user) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
//   next();
// };
// Get all chats for a user
router.get("/all/:id", chatController_1.getAllChats);
// Get messages for a specific chat
router.get("/:chatId/:userId/messages", chatController_1.getChatMessages);
// Start a new chat
router.post("/:userId", chatController_1.startNewChat);
exports.default = router;
