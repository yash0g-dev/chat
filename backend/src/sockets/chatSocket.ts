import { Server, Socket } from "socket.io";
import { Message } from "../models/messages.model";
import prisma from "../config/prisma.config.js";

export const registerChatHandlers = (io: Server, socket: Socket) => {
  // 1. JUST join the room. No database calls.
  // This lets the user silently subscribe to all their chats on login.
  socket.on("join_room", (roomName: string) => {
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room ${roomName}`);
  });

  // 2. NEW EVENT: Fetch history ONLY when requested
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

  // 3. Send message handler
  socket.on(
    "send_message",
    async (message: {
      channelId: string;
      sender: { id: string; username: string };
      content: string;
    }) => {
      try {
        const newMessage = new Message(message);
        await newMessage.save(); // Saves to MongoDB, generating _id and createdAt

        // Update Postgres metrics
        await prisma.channel.update({
          where: { id: message.channelId },
          data: {
            lastMessage: message.content,
            lastMessageAt: newMessage.createdAt,
          },
        });

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

        // CRITICAL FIX: Emit `newMessage` (the DB document), not the raw `message`
        // This ensures the receiver gets the proper `createdAt` and `_id`
        socket.broadcast.to(message.channelId).emit("new_message", newMessage);
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
  );

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
};
