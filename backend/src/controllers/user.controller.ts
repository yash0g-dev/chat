import type { Response } from "express";
import prisma from "../config/prisma.config.js";
import { ApiError } from "../utils/utils.js";
import type { AuthController } from "../middlewares/auth.middleware.ts";

export const getMe: AuthController = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to retrieve profile");
  }
};

// Search for other users by username (useful for adding friends later)
export const searchUsers: AuthController = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || typeof username !== "string") {
      throw new ApiError(400, "Please provide a valid username query");
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username,
          mode: "insensitive",
        },
        // Don't include the logged-in user in search results
        NOT: { id: req.userId },
      },
      select: {
        id: true,
        username: true,
      },
      take: 10,
    });

    res.status(200).json({ success: true, users });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "User search failed");
  }
};
