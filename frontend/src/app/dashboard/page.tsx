"use client";

import React, { useEffect } from "react";
import Sidebar from "@/components/Sidebar"; // Adjust path if needed
import ChatWindow from "@/components/ChatWindow"; // Adjust path if needed
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { receiveMessage } from "@/store/chatSlice";
import { SocketProvider, useSocket } from "@/providers/SocketProvider";

// Inner component to consume the socket context
function DashboardContent() {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { chats } = useSelector((state: RootState) => state.chat);

  // 1. Join rooms whenever the chats array changes (e.g., on load or new chat created)
  useEffect(() => {
    if (!socket || !chats.length) return;

    chats.forEach((chat) => {
      socket.emit("join_room", chat.id);
    });
  }, [socket, chats]);

  // 2. Global listener for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (incomingMsg: any) => {
      // Pushes to Redux: updates sidebar, unread count, and chat window instantly
      dispatch(receiveMessage(incomingMsg));
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, dispatch]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-950 text-white selection:bg-blue-500/30">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}

// Wrapper component to handle Auth and provide Context
export default function MainDashboard() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <DashboardContent />
    </SocketProvider>
  );
}
