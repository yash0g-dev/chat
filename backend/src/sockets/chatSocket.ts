import { Server, Socket } from "socket.io";
import { Message } from "../models/messages.model";
import prisma from "../config/prisma.config.js";

export const registerChatHandlers = (io: Server, socket: Socket) => {
  // 1. Join room
  socket.on("join_room", (roomName: string) => {
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room ${roomName}`);
  });

  // 2. Fetch history
  socket.on("fetch_history", async (roomName: string) => {
    try {
      const history = await Message.find({ channelId: roomName })
        .sort({ createdAt: -1 })
        .limit(50);

      socket.emit("history", history);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  });

  // 3. Send message handler WITH Acknowledgement Callback & Attachments
  socket.on(
    "send_message",
    async (
      message: {
        channelId: string;
        sender: { id: string; username: string; avatarUrl?: string };
        content: string;
        attachments?: any[]; // Added to support your new frontend attachments
      },
      callback?: (response: {
        success: boolean;
        data?: any;
        error?: string;
      }) => void,
    ) => {
      try {
        // Create and save to MongoDB
        const newMessage = new Message({
          ...message,
          status: "sent", // Explicitly set status to sent
        });
        await newMessage.save();

        // Update Postgres metrics
        await prisma.channel.update({
          where: { id: message.channelId },
          data: {
            lastMessage:
              message.content || (message.attachments?.length ? "Photo" : ""),
            lastMessageAt: newMessage.createdAt,
          },
        });

        // Update the sender's last read time
        await prisma.channelMember.update({
          where: {
            channelId_userId: {
              channelId: message.channelId,
              userId: message.sender.id,
            },
          },
          data: {
            lastReadAt: new Date(),
          },
        });

        // Broadcast to receiver(s)
        socket.broadcast.to(message.channelId).emit("new_message", newMessage);

        // Tell the sender's frontend that the message was successfully saved!
        if (typeof callback === "function") {
          callback({ success: true, data: newMessage });
        }
      } catch (err: any) {
        console.error("Failed to send message:", err);
        if (typeof callback === "function") {
          callback({ success: false, error: err.message });
        }
      }
    },
  );

  // 4. NEW: Mark Messages as Seen
  socket.on(
    "mark_seen",
    async ({
      messageIds,
      channelId,
      userId,
    }: {
      messageIds: string[];
      channelId: string;
      userId: string;
    }) => {
      try {
        // Update MongoDB messages to "read"
        await Message.updateMany(
          { _id: { $in: messageIds } },
          { $set: { status: "read" } },
        );

        // Update Postgres lastReadAt for this user
        await prisma.channelMember.update({
          where: {
            channelId_userId: {
              channelId: channelId,
              userId: userId,
            },
          },
          data: {
            lastReadAt: new Date(),
          },
        });

        // Let the sender know their messages were read (so ticks turn blue)
        socket.broadcast
          .to(channelId)
          .emit("messages_read", { messageIds, channelId, userId });
      } catch (err) {
        console.error("Failed to mark messages as seen:", err);
      }
    },
  );

  // 5. Disconnect (Set user offline)
  socket.on("disconnect", async () => {
    console.log(`Socket disconnected: ${socket.id}`);

    // NOTE: To make this work, you must attach the userId to the socket object
    // when they first connect (e.g., via auth middleware: socket.data.userId = user.id)
    const userId = socket.data?.userId;

    if (userId) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            isOnline: false,
            lastSeenAt: new Date(),
          },
        });

        // Optional: Broadcast to everyone that this user went offline
        // io.emit("user_status_change", { userId, isOnline: false, lastSeenAt: new Date() });
      } catch (err) {
        console.error("Failed to update user offline status:", err);
      }
    }
  });
};
