import prisma from "../config/prisma.config.js";
import { ApiError } from "../utils/utils.js";
import type { AuthController } from "../middlewares/auth.middleware.ts";
import { Message } from "../models/messages.model.ts";

export const getUserChats: AuthController = async (req, res) => {
  const userId = req.userId;
  try {
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }
    console.log("about to quuey", userId);
    const channels = await prisma.channel.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          select: {
            lastReadAt: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });
    console.log("channels", channels);
    res.status(200).json({ success: true, channels });
  } catch (error) {
    console.error("FULL ERROR");
    console.dir(error, { depth: null });

    throw error;
  }
  // } catch (error) {
  //   if (error instanceof ApiError) {
  //     throw error;
  //   }
  //   throw new ApiError(500, "Internal server error");
  // }
};

export const createChat: AuthController = async (req, res) => {
  const myId = req.userId;
  const { targetUserId } = req.body;

  try {
    if (!myId || !targetUserId) {
      throw new ApiError(400, "Missing user information");
    }

    const existingChannel = await prisma.channel.findFirst({
      where: {
        isGroup: false,
        members: {
          some: {
            userId: myId,
          },
        },
        AND: [
          {
            members: {
              some: {
                userId: targetUserId,
              },
            },
          },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (existingChannel && existingChannel.members.length === 2) {
      return res.status(200).json({
        success: true,
        channel: existingChannel,
      });
    }

    const channel = await prisma.channel.create({
      data: {
        isGroup: false,
        ownerId: myId,

        members: {
          create: [
            {
              userId: myId,
            },
            {
              userId: targetUserId,
            },
          ],
        },
      },

      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      channel,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Internal server error");
  }
};

export const createGroupChannel: AuthController = async (req, res) => {
  const userId = req.userId;
  const { name, members } = req.body as { name: string; members: string[] };

  try {
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }
    if (!members) {
      throw new ApiError(400, "Missing user information");
    }

    const uniqueMembers = [...new Set([...members, userId])];

    if (uniqueMembers.length < 3) {
      throw new ApiError(400, "Group chat requires at least 3 participants");
    }

    const channel = await prisma.channel.create({
      data: {
        isGroup: true,
        ownerId: userId,
        name,
        members: {
          create: uniqueMembers.map((memberId) => ({
            userId: memberId,
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      channel,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Internal server error");
  }
};
