"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  MessageSquareOff,
  Video,
  PhoneOff,
  Check,
  CheckCheck,
} from "lucide-react";
import {
  setChatHistory,
  receiveMessage,
  updateMessage,
  updateMessagesStatus,
} from "@/store/chatSlice";
import { useSocket } from "@/providers/SocketProvider";
import { api } from "@/lib/api";

// LiveKit Imports
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";

// Custom Components
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import CallPane from "./CallPane";

export default function ChatWindow() {
  const dispatch = useDispatch();
  const socket = useSocket();
  const currentUser = useSelector((state: any) => state.auth.user);
  const { activeChatId, chats, messagesByChat, hasFetchedHistory } =
    useSelector((state: any) => state.chat);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const [inCall, setInCall] = useState(false);
  const [videoToken, setVideoToken] = useState("");

  const rawMessages = activeChatId ? messagesByChat[activeChatId] || [] : [];
  const messages = Array.from(
    new Map(rawMessages.map((m: any) => [m._id || m.id, m])).values(),
  );
  const isFetchingHistory = activeChatId && !hasFetchedHistory[activeChatId];

  // --- DERIVE CHAT METADATA ---
  const activeChat = chats.find((c: any) => c.id === activeChatId);
  let chatTitle = "Conversation";
  let chatAvatar: string | null = null;
  let isOnline = false;
  let lastSeenAt: string | null = null;
  let memberCount = 0;

  if (activeChat) {
    if (activeChat.isGroup && activeChat.name) {
      chatTitle = activeChat.name;
      chatAvatar = activeChat.avatarUrl || null;
      memberCount = activeChat.members?.length || 0;
    } else {
      const otherMember = activeChat.members?.find(
        (m: any) => m.user.id !== currentUser?.id,
      );
      if (otherMember) {
        chatTitle = otherMember.user.displayName || otherMember.user.username;
        chatAvatar = otherMember.user.avatarUrl;
        isOnline = otherMember.user.isOnline;
        lastSeenAt = otherMember.user.lastSeenAt;
      }
    }
  }

  // --- SOCKET & HISTORY LOGIC ---
  useEffect(() => {
    if (!socket || !activeChatId) return;

    const handleHistory = (historyMessages: any[]) => {
      const chatId = historyMessages.length
        ? historyMessages[0].channelId
        : activeChatId;
      dispatch(
        setChatHistory({ chatId, messages: [...historyMessages].reverse() }),
      );
    };

    socket.on("history", handleHistory);
    if (!hasFetchedHistory[activeChatId])
      socket.emit("fetch_history", activeChatId);

    return () => {
      socket.off("history", handleHistory);
    };
  }, [socket, activeChatId, dispatch, hasFetchedHistory]);

  // --- JOIN ROOM & LISTEN FOR NEW MESSAGES ---
  useEffect(() => {
    if (!socket || !activeChatId) return;
    socket.emit("join_room", activeChatId);
    const handleNewMessage = (msg: any) => dispatch(receiveMessage(msg));
    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, activeChatId, dispatch]);

  // --- MARK READ & LISTEN FOR RECEIPTS ---
  useEffect(() => {
    if (!socket || !activeChatId || !currentUser) return;
    const unread = messages
      .filter(
        (m: any) => m.sender?.id !== currentUser.id && m.status !== "read",
      )
      .map((m: any) => m._id || m.id);
    if (unread.length > 0) {
      socket.emit("mark_seen", {
        messageIds: unread,
        channelId: activeChatId,
        userId: currentUser.id,
      });
      dispatch(
        updateMessagesStatus({
          channelId: activeChatId,
          messageIds: unread,
          status: "read",
        }),
      );
    }
    const handleRead = ({ messageIds, channelId }: any) => {
      if (channelId === activeChatId)
        dispatch(
          updateMessagesStatus({ channelId, messageIds, status: "read" }),
        );
    };
    socket.on("messages_read", handleRead);
    return () => {
      socket.off("messages_read", handleRead);
    };
  }, [messages, activeChatId, currentUser, socket, dispatch]);

  // --- VIDEO CALL LOGIC ---
  useEffect(() => {
    setInCall(false);
    setVideoToken("");
  }, [activeChatId]);

  useEffect(() => {
    if (inCall && activeChatId && currentUser) {
      fetch(
        `http://localhost:5000/api/get-livekit-token?room=${activeChatId}&identity=${currentUser.username}`,
      )
        .then((res) => res.json())
        .then((data) => setVideoToken(data.token))
        .catch(console.error);
    }
  }, [inCall, activeChatId, currentUser]);

  useEffect(() => {
    if (!isFetchingHistory)
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isFetchingHistory]);

  // --- SEND MESSAGE ---
  const handleSendMessage = async (text: string, files: File[]) => {
    if (!currentUser) return;
    const tempId = Date.now().toString();
    const localAttachments = files.map((f) => ({
      fileName: f.name,
      url: URL.createObjectURL(f),
      size: f.size,
      type: f.type.startsWith("image/") ? "image" : "file",
    }));

    dispatch(
      receiveMessage({
        id: tempId,
        channelId: activeChatId,
        content: text,
        sender: {
          id: currentUser.id,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
        },
        attachments: localAttachments,
        createdAt: new Date().toISOString(),
        status: "sending",
      }),
    );

    try {
      const formData = new FormData();
      formData.append("channelId", activeChatId);
      formData.append("content", text);
      formData.append("senderId", currentUser.id);
      formData.append("senderUsername", currentUser.username);
      files.forEach((f) => formData.append("attachments", f));
      const res = await api.post("/chat/message", formData);
      dispatch(
        updateMessage({
          channelId: activeChatId,
          tempId,
          realMessage: res.data.data,
        }),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const renderMessageStatus = (status: string) => {
    switch (status) {
      case "read":
        return <CheckCheck size={14} className="text-blue-400" />;
      case "delivered":
        return <CheckCheck size={14} className="text-gray-400" />;
      default:
        return <Check size={14} className="text-gray-400" />;
    }
  };

  // --- RENDERING ---
  if (!activeChatId)
    return (
      <div className="hidden flex-1 items-center justify-center bg-[#030712] sm:flex">
        <MessageSquareOff size={48} className="text-gray-800" />
      </div>
    );

  const ChatMessagesAndInput = (
    <div className="flex flex-1 flex-col min-h-0 bg-[#030712]">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg: any, i: number) => (
          <MessageBubble
            key={msg._id || msg.id || i}
            msg={msg}
            isMe={msg.sender?.id === currentUser?.id}
            isGroup={activeChat?.isGroup}
            renderMessageStatus={renderMessageStatus}
          />
        ))}
        <div ref={messageEndRef} />
      </div>
      <ChatInput
        onSendMessage={handleSendMessage}
        isFetchingHistory={isFetchingHistory}
        chatTitle={chatTitle}
      />
    </div>
  );

  return (
    <div className="flex h-full flex-1 flex-col bg-[#030712]">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-white/5 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {chatAvatar ? (
            <img
              src={chatAvatar}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
              {chatTitle[0]}
            </div>
          )}
          <div>
            <h3 className="font-bold text-white text-sm">{chatTitle}</h3>
            <p className="text-xs text-gray-400">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        {!inCall && (
          <button
            onClick={() => setInCall(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-600/10 px-4 py-2 text-sm text-emerald-500 hover:bg-emerald-600/20"
          >
            <Video size={18} /> Join
          </button>
        )}
      </div>
      {inCall ? (
        <div className="flex flex-1 flex-col lg:flex-row min-h-0">
          <CallPane videoToken={videoToken} onHangup={() => setInCall(false)} />
          <div className="flex flex-1 flex-col min-h-0 lg:max-w-md">
            {ChatMessagesAndInput}
          </div>
        </div>
      ) : (
        ChatMessagesAndInput
      )}
    </div>
  );
}
