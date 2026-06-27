import prisma from "../config/prisma.config.js";
import { ApiError } from "../utils/utils.js";
import type { AuthController } from "../middlewares/auth.middleware.ts";
import { Message } from "../models/messages.model.ts";
import { getDmKey } from "../utils/utils.js";
import { uploadToCloudinary } from "../services/cloudinary.service.ts";

export const getUserChats: AuthController = async (req, res) => {
  const userId = req.userId;
  try {
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }
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

    if (myId === targetUserId) {
      throw new ApiError(400, "You cannot create a chat with yourself.");
    }

    const dmKey = getDmKey(myId, targetUserId);

    const existingChannel = await prisma.channel.findUnique({
      where: {
        dmKey,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                isOnline: true,
                lastSeenAt: true,
              },
            },
          },
        },
      },
    });

    if (existingChannel) {
      return res.status(200).json({
        success: true,
        channel: existingChannel,
      });
    }

    const channel = await prisma.channel.create({
      data: {
        isGroup: false,
        dmKey,
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
                avatarUrl: true,
                isOnline: true,
                lastSeenAt: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
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

// Helper to map mimetype to Cloudinary config types
const getFileType = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "image/gif") return "gif";
  return "file";
};

export const sendMessageWithAttachments: AuthController = async (req, res) => {
  try {
    const { channelId, content, senderId, senderUsername, senderAvatarUrl } =
      req.body;

    const files = req.files as Express.Multer.File[];

    let uploadedAttachments = [];

    // 1. Upload files to Cloudinary if they exist
    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const type = getFileType(file.mimetype);
        console.log("file", file);
        console.log("type", type);
        const uploadResult = await uploadToCloudinary(file, type as any);

        return {
          fileName: file.originalname,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          size: file.size,
          mimeType: file.mimetype,
          type:
            type === "audio" || type === "video"
              ? "video"
              : type === "image"
                ? "image"
                : type === "gif"
                  ? "gif"
                  : "file",
        };
      });

      uploadedAttachments = await Promise.all(uploadPromises);
    }

    // 2. Save to MongoDB
    const newMessage = new Message({
      channelId,
      content,
      sender: {
        id: senderId,
        username: senderUsername,
        avatarUrl: senderAvatarUrl,
      },
      attachments: uploadedAttachments,
      status: "sent",
    });

    await newMessage.save();

    // 3. Update Postgres Metrics
    await prisma.channel.update({
      where: { id: channelId },
      data: {
        lastMessage:
          content || (uploadedAttachments.length ? "Attachment" : ""),
        lastMessageAt: newMessage.createdAt,
      },
    });

    await prisma.channelMember.update({
      where: {
        channelId_userId: {
          channelId: channelId,
          userId: senderId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    // 4. Broadcast via Socket.io
    // Access the io instance we attached to the app earlier
    const io = req.app.get("io");
    if (io) {
      io.to(channelId).emit("new_message", newMessage);
    }

    // 5. Respond to the sender
    res.status(201).json({ success: true, data: newMessage });
  } catch (error: any) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};
