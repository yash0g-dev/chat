"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Send, MessageSquareOff, Video, PhoneOff } from "lucide-react";
import { setChatHistory, receiveMessage } from "@/store/chatSlice";
import { useSocket } from "@/providers/SocketProvider";

// LiveKit Imports
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";

export default function ChatWindow() {
  const dispatch = useDispatch();
  const socket = useSocket();
  const currentUser = useSelector((state: any) => state.auth.user);

  const { activeChatId, chats, messagesByChat, hasFetchedHistory } = useSelector(
    (state: any) => state.chat
  );

  const [text, setText] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  // --- VIDEO CALL STATES ---
  const [inCall, setInCall] = useState(false);
  const [videoToken, setVideoToken] = useState("");

  const messages = activeChatId ? messagesByChat[activeChatId] || [] : [];
  const isFetchingHistory = activeChatId && !hasFetchedHistory[activeChatId];

  // --- DERIVE CHAT TITLE ---
  const activeChat = chats.find((c: any) => c.id === activeChatId);
  let chatTitle = "Conversation";

  if (activeChat) {
    if (activeChat.isGroup && activeChat.name) {
      chatTitle = activeChat.name;
    } else {
      const otherMember = activeChat.members?.find(
        (m: any) => m.user.id !== currentUser?.id
      );
      if (otherMember) chatTitle = otherMember.user.username;
    }
  }

  // --- HANDLE HISTORY FETCHING ---
  useEffect(() => {
    if (!socket || !activeChatId) return;

    const handleHistory = (historyMessages: any[]) => {
      const chatId = historyMessages.length ? historyMessages[0].channelId : activeChatId;
      const orderedMessages = [...historyMessages].reverse();
      
      dispatch(
        setChatHistory({
          chatId: chatId,
          messages: orderedMessages,
        })
      );
    };

    socket.on("history", handleHistory);

    if (!hasFetchedHistory[activeChatId]) {
      socket.emit("fetch_history", activeChatId);
    }

    return () => {
      socket.off("history", handleHistory);
    };
  }, [socket, activeChatId, dispatch, hasFetchedHistory]);

  // --- RESET CALL STATE ON CHAT CHANGE ---
  useEffect(() => {
    setInCall(false);
    setVideoToken("");
  }, [activeChatId]);

  // --- FETCH LIVEKIT TOKEN ---
  useEffect(() => {
    if (inCall && activeChatId && currentUser) {
      fetch(
        `http://localhost:5000/api/get-livekit-token?room=${activeChatId}&identity=${currentUser.username}`
      )
        .then((res) => res.json())
        .then((data) => {
          setVideoToken(data.token);
        })
        .catch((err) => console.error("Failed to fetch LiveKit token", err));
    } else {
      setVideoToken("");
    }
  }, [inCall, activeChatId, currentUser]);

  // --- AUTO SCROLL ---
  useEffect(() => {
    if (!isFetchingHistory) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isFetchingHistory]);

  // --- SEND MESSAGE ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !socket || !currentUser) return;

    const newMessage = {
      id: Date.now().toString(),
      channelId: activeChatId,
      content: text.trim(),
      sender: {
        id: currentUser.id,
        username: currentUser.username,
      },
      createdAt: new Date().toISOString(),
    };

    socket.emit("send_message", newMessage);
    dispatch(receiveMessage(newMessage)); 
    setText("");
  };

  // --- EMPTY STATE ---
  if (!activeChatId) {
    return (
      <div className="hidden flex-1 flex-col items-center justify-center bg-gray-950 px-4 text-center sm:flex">
        <div className="rounded-full bg-gray-900 border border-gray-800 p-6 mb-4 text-gray-500 shadow-xl shadow-blue-500/5">
          <MessageSquareOff size={48} />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">
          No Conversation Selected
        </h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">
          Select a chat channel from your sidebar or start a new conversation.
        </p>
      </div>
    );
  }

  // --- EXTRACTED MESSAGES & INPUT COMPONENT ---
  // We extract this so we can easily render it alongside the video when in a call
  const ChatMessagesAndInput = (
    <div className="flex flex-1 flex-col min-h-0 bg-[#030712]">
      {isFetchingHistory ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-sm text-gray-400 font-medium">Loading messages...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg: any, index: number) => {
            const isMe = msg.sender?.username === currentUser?.username;

            return (
              <div
                key={msg.id || msg._id || index}
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm shadow-md transition-all ${
                    isMe
                      ? "bg-blue-600 text-white rounded-tr-none font-medium"
                      : "bg-gray-800 border border-gray-700/60 text-gray-100 rounded-tl-none"
                  }`}
                >
                  {!isMe && activeChat?.isGroup && (
                    <p className="text-xs font-bold text-indigo-400 mb-1 tracking-wide">
                      @{msg.sender?.username}
                    </p>
                  )}
                  <p className="leading-relaxed break-words">{msg.content}</p>
                  {msg.createdAt && (
                    <span
                      className={`block text-[10px] mt-1.5 font-mono select-none ${
                        isMe ? "text-blue-200 text-right" : "text-gray-400 text-left"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messageEndRef} />
        </div>
      )}

      {/* INPUT AREA */}
      <form
        onSubmit={handleSendMessage}
        className="shrink-0 p-4 bg-[#030712] border-t border-white/5 flex gap-3 items-center"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isFetchingHistory}
          placeholder={isFetchingHistory ? "Loading..." : `Message ${chatTitle}...`}
          className="flex-1 rounded-xl bg-gray-900 border border-gray-800 px-5 py-3.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!text.trim() || isFetchingHistory}
          className="group rounded-xl bg-blue-600 px-5 py-3.5 flex items-center justify-center shadow-lg shadow-blue-500/10 transition hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </form>
    </div>
  );

  // --- ACTIVE CHAT UI ---
  return (
    <div className="flex h-full flex-1 flex-col bg-[#030712]">
      {/* HEADER */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-white/5 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-blue-500/20">
            {chatTitle.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{chatTitle}</h3>
            {activeChat?.isGroup && (
              <p className="text-xs text-gray-400">
                {activeChat.members?.length} members
              </p>
            )}
          </div>
        </div>

        {/* Call Action Button */}
        {!inCall && (
          <button
            onClick={() => setInCall(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-600/20 px-4 py-2 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-600/30"
          >
            <Video size={16} />
            Join Call
          </button>
        )}
      </div>

      {/* DYNAMIC CONTENT AREA */}
      {inCall ? (
        <div className="flex flex-1 flex-col lg:flex-row min-h-0">
          
          {/* LEFT: Video Container */}
          <div className="flex flex-[2] relative bg-black flex-col border-b lg:border-b-0 lg:border-r border-gray-800">
            {videoToken ? (
              <div className="w-full h-full relative">
                <LiveKitRoom
                  video={true}
                  audio={true}
                  token={videoToken}
                  serverUrl="http://localhost:7880"
                  connect={true}
                  onDisconnected={() => setInCall(false)}
                  className="w-full h-full"
                >
                  <VideoConference />
                  <RoomAudioRenderer />
                </LiveKitRoom>
                
                {/* Custom Hangup Button Overlay */}
                <button
                  onClick={() => setInCall(false)}
                  className="absolute top-4 right-4 p-3 bg-red-600 hover:bg-red-500 rounded-full transition shadow-lg z-50 text-white"
                  title="Leave Call"
                >
                  <PhoneOff size={20} />
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4"></div>
                <p className="text-sm text-gray-400">Connecting to room...</p>
              </div>
            )}
          </div>

          {/* RIGHT: Chat Container (Shrunk down when in call) */}
          <div className="flex flex-1 flex-col min-h-0 lg:max-w-md">
            {ChatMessagesAndInput}
          </div>

        </div>
      ) : (
        /* NORMAL CHAT VIEW */
        ChatMessagesAndInput
      )}
    </div>
  );
}
