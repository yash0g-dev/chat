import { Router } from "express";
import {
  getUserChats,
  createChat,
  createGroupChannel,
  sendMessageWithAttachments,
} from "../controllers/chat.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
router.get("/get-chats", protectRoute, getUserChats); // Get user chats
router.post("/create-chat", protectRoute, createChat); // Create chat
router.post("/create-group", protectRoute, createGroupChannel); // Create group chat
router.post(
  "/message",
  protectRoute,
  upload.array("attachments"),
  sendMessageWithAttachments,
); // Send message

export const chatRoutes = router;
