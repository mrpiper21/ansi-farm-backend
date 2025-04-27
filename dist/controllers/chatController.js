"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startNewChat = exports.getChatMessages = exports.getAllChats = void 0;
const chatModel_1 = require("../model/chatModel");
const getAllChats = async (req, res) => {
    try {
        const userId = req.params.id;
        const chats = await chatModel_1.Chat.find({
            participants: userId,
        })
            .populate("participants", "userName profileImage type")
            .populate({
            path: "messages",
            options: { sort: { timestamp: -1 }, limit: 1 },
        });
        res.json(chats);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getAllChats = getAllChats;
const getChatMessages = async (req, res) => {
    try {
        const chat = await chatModel_1.Chat.findById(req.params.chatId)
            .populate("participants", "userName profileImage type")
            .populate({
            path: "messages",
            options: { sort: { timestamp: 1 } },
        });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        const user = req.user;
        if (!chat.participants.some((p) => p._id.equals(req.params.userId))) {
            return res.status(403).json({ message: "Not authorized to view this chat" });
        }
        res.json(chat);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getChatMessages = getChatMessages;
const startNewChat = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { receiverId } = req.body;
        if (!receiverId) {
            return res.status(400).json({ message: "Receiver ID is required" });
        }
        const existingChat = await chatModel_1.Chat.findOne({
            participants: { $all: [userId, receiverId], $size: 2 },
        });
        if (existingChat) {
            return res.status(200).json(existingChat);
        }
        const newChat = new chatModel_1.Chat({
            participants: [userId, receiverId],
            messages: [],
        });
        await newChat.save();
        res.status(201).json(newChat);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.startNewChat = startNewChat;
