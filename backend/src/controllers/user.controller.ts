import type { Response } from "express";
import prisma from "../config/prisma.config.js";
import { ApiError } from "../utils/utils.js";
import type { AuthController } from "../middlewares/auth.middleware.ts";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary.service.js";

export const getMe: AuthController = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        email: true,
        avatarUrl: true,
        isOnline: true,
        lastSeenAt: true,
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
        displayName: true,
        bio: true,
        email: true,
        avatarUrl: true,
      },
      take: 10,
    });

    res.status(200).json({ success: true, users });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "User search failed");
  }
};

export const patchUser: AuthController = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, email } = req.body;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!username && !email) {
      throw new ApiError(400, "Please provide at least one field to update");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        email,
      },
    });

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to update user");
  }
};
export const patchAvatar: AuthController = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!req.file) {
      throw new ApiError(400, "Avatar image is required");
    }

    const upload = await uploadToCloudinary(req.file);

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarPublicId: true },
    });

    // Delete previous avatar if it exists
    if (existingUser?.avatarPublicId) {
      await deleteFromCloudinary(existingUser.avatarPublicId);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: upload.secure_url,
        avatarPublicId: upload.public_id,
      },
    });

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(500, "Failed to update avatar");
  }
};
