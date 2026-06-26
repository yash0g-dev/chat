import { Router } from "express";
import {
  getUserChats,
  createChat,
  createGroupChannel,
} from "../controllers/chat.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/get-chats", protectRoute, getUserChats); // Get user chats
router.post("/create-chat", protectRoute, createChat); // Create chat
router.post("/create-group", protectRoute, createGroupChannel); // Create group chat

export const chatRoutes = router;
