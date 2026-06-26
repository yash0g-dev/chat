import { Router } from "express";
import {
  createChannel,
  getMyChannels,
} from "../controllers/channel.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", protectRoute, createChannel);
router.get("/", protectRoute, getMyChannels);

export const channelRoutes = router;
