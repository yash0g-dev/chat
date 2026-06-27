import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
} from "../controllers/auth.controller";
import multer from "multer";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refreshToken", refreshToken);
router.get("/profile", getMe);

export const authRoutes = router;
