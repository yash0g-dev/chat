import type { Response } from "express";
import prisma from "../config/prisma.config.js";
import { ApiError } from "../utils/utils.js";
import type { AuthController } from "../middlewares/auth.middleware.ts";

// 1. Send a friend request
export const sendFriendRequest: AuthController = async (req, res) => {
  try {
    const senderId = req.userId;
    const { receiverId } = req.body;

    if (!receiverId || senderId === receiverId) {
      throw new ApiError(400, "Invalid receiver ID");
    }

    // Check if a request already exists in either direction
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existing) {
      throw new ApiError(
        400,
        "Friendship status already exists between these users",
      );
    }

    const friendship = await prisma.friendship.create({
      data: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });

    res.status(201).json({ success: true, friendship });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to send friend request");
  }
};

// 2. Accept a friend request
export const acceptFriendRequest: AuthController = async (req, res) => {
  try {
    const userId = req.userId as string;
    const { requestId } = req.params;

    // Find the pending request where the current user is the receiver
    const request = await prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (
      !request ||
      request.receiverId !== userId ||
      request.status !== "PENDING"
    ) {
      throw new ApiError(404, "Pending friend request not found");
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });

    res.status(200).json({ success: true, friendship: updatedFriendship });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to accept friend request");
  }
};

// 3. Get all accepted friends
export const getFriends = async (req, res): Promise<void> => {
  try {
    const userId = req.userId;

    // Find all friendships where status is ACCEPTED and user is either sender or receiver
    const friendships = await prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } },
      },
    });

    // Clean up the data so it just returns a simple array of the *other* user's profiles
    const friends = friendships.map((f) =>
      f.senderId === userId ? f.receiver : f.sender,
    );

    res.status(200).json({ success: true, friends });
  } catch (error) {
    throw new ApiError(500, "Failed to retrieve friends");
  }
};

// 4. Get pending incoming requests
export const getPendingRequests: AuthController = async (req, res) => {
  try {
    const userId = req.userId as string;

    const requests = await prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      include: {
        sender: { select: { id: true, username: true } },
      },
    });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    throw new ApiError(500, "Failed to retrieve pending requests");
  }
};

// 5. Reject a friend request
export const rejectFriendRequest: AuthController = async (req, res) => {
  try {
    const userId = req.userId as string;
    const { requestId } = req.params;

    // Find the pending request where the current user is the receiver
    const request = await prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (
      !request ||
      request.receiverId !== userId ||
      request.status !== "PENDING"
    ) {
      throw new ApiError(404, "Pending friend request not found");
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });

    res.status(200).json({ success: true, friendship: updatedFriendship });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to reject friend request");
  }
};
