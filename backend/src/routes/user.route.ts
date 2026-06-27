import { Router } from "express";
import {
  getMe,
  searchUsers,
  patchUser,
  patchAvatar,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
});
// Both routes are protected by our auth guard middleware
router.get("/me", protectRoute, getMe);
router.get("/search", protectRoute, searchUsers);
router.patch("/me", protectRoute, patchUser);
router.patch("/avatar", protectRoute, upload.single("avatar"), patchAvatar);

export const userRoutes = router;
