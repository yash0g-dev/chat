import { Router } from "express";
import mongoose from "mongoose";
import { Message } from "../models/messages.model";

const router = Router();

router.get("/", async (req, res) => {
  try {
    await mongoose.connection.db?.admin().ping();
    const messageCount = await Message.estimatedDocumentCount();
    res.status(200).json({
      status: "healthy",
      database: "connected",
      uptime: process.uptime(),
      messageCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});
export const healthRoutes = router;
