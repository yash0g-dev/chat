import { Router } from "express";
import { getMe, searchUsers } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

// Both routes are protected by our auth guard middleware
router.get("/me", protectRoute, getMe);
router.get("/search", protectRoute, searchUsers);

export const userRoutes = router;
