import { Router } from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  getPendingRequests,
} from "../controllers/friendship.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all friendship routes

router.post("/request", protectRoute, sendFriendRequest); // Send request
router.put("/accept/:requestId", protectRoute, acceptFriendRequest); // Accept request
router.put("/reject/:requestId", protectRoute, acceptFriendRequest); // reject  request
router.get("/", getFriends); // List all friends
router.get("/pending", protectRoute, getPendingRequests); // List incoming requests

export const friendshipRoutes = router;
