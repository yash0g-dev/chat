import type { Response } from "express";
import prisma from "../config/prisma.config.js";
import { ApiError } from "../utils/utils.js";
import type { AuthController } from "../middlewares/auth.middleware.js";

// Create a new group channel
export const createChannel: AuthController = async (req, res) => {
  try {
    const { name, isGroup } = req.body;
    const userId = req.userId; // Retrieved securely from our auth middleware

    if (isGroup && !name) {
      throw new ApiError(400, "Group channels require a name");
    }

    // Use a database transaction to ensure both operations succeed or both fail
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the channel
      const channel = await tx.channel.create({
        data: {
          name: isGroup ? name : null,
          isGroup: isGroup || false,
          ownerId: userId as string,
        },
      });

      // 2. Automatically add the creator as a member of this channel
      await tx.channelMember.create({
        data: {
          channelId: channel.id,
          userId: userId as string,
        },
      });

      return channel;
    });

    res.status(201).json({ success: true, channel: result });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to create channel");
  }
};

// Get all channels that the current logged-in user is a member of
export const getMyChannels: AuthController = async (req, res) => {
  try {
    const userId = req.userId;

    // Find all memberships for this user, and include the channel details
    const memberships = await prisma.channelMember.findMany({
      where: { userId },
      include: {
        channel: {
          include: {
            members: {
              select: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Extract just the channel objects out of the membership array
    const channels = memberships.map((m) => m.channel);

    res.status(200).json({ success: true, channels });
  } catch (error) {
    throw new ApiError(500, "Failed to retrieve channels");
  }
};
