import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refreshToken", refreshToken);
router.get("/profile", getMe);

export const authRoutes = router;
