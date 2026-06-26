"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  useToken,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Video, VideoOff, Monitor, PhoneOff } from "lucide-react";

const socket: Socket = io("http://localhost:5000");

interface Message {
  text: string;
  sender: string;
  channelId: string;
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  // Video Call States
  const [inCall, setInCall] = useState(false);
  const [roomName, setRoomName] = useState("test-room");
  const [participantName, setParticipantName] = useState(
    "User_" + Math.floor(Math.random() * 1000),
  );
  useEffect(() => {
    setParticipantName("User_" + Math.floor(Math.random() * 1000));
    setIsMounted(true);
  }, []);

  const [token, setToken] = useState("");

  useEffect(() => {
    fetch(
      `http://localhost:5000/api/get-livekit-token?room=${roomName}&identity=${participantName}`,
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("TOKEN RECEIVED", data.token);
        setToken(data.token);
      });
  }, [roomName, participantName]);
  useEffect(() => {
    socket.emit("join_room", roomName);
    socket.on("history", (data) => {
      setChatHistory(data);
    });
    socket.on("new_message", (data: Message) => {
      setChatHistory((prev) => [...prev, data]);
    });

    return () => {
      socket.off("history");
      socket.off("new_message");
    };
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messageData: Message = {
      text: message,
      sender: participantName,
      channelId: roomName,
    };
    socket.emit("send_message", messageData);
    setChatHistory((prev) => [...prev, messageData]);
    setMessage("");
  };

  if (!isMounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
        Loading VibeChat...
      </div>
    );
  }
  return (
    <main className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* LEFT PANEL: Video Canvas */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 bg-gray-950 relative">
        {!inCall ? (
          <div className="text-center space-y-4 max-w-sm">
            <h2 className="text-2xl font-bold">Ready to connect?</h2>
            <p className="text-gray-400 text-sm">
              Join the video room to start sharing your camera or screen.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white w-full focus:outline-none"
                placeholder="Your Name"
              />
            </div>
            <button
              onClick={() => setInCall(true)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-md font-semibold transition flex justify-center items-center gap-2"
            >
              <Video size={20} /> Join Video Room
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col">
            {/* LiveKit Interface automatically renders video grid and screen sharing layouts */}
            {inCall && token && (
              <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                serverUrl="http://localhost:7880" // Your local LiveKit dev instance
                connect={true}
                onDisconnected={() => setInCall(false)}
                className="flex-1 rounded-xl overflow-hidden border border-gray-800"
              >
                <VideoConference />
                <RoomAudioRenderer />
              </LiveKitRoom>
            )}

            <button
              onClick={() => setInCall(false)}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 p-4 bg-red-600 hover:bg-red-500 rounded-full transition shadow-lg z-50"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Sidebar Chat */}
      <div className="w-96 border-l border-gray-800 flex flex-col bg-gray-900">
        <header className="p-4 border-b border-gray-800 bg-gray-950 font-semibold shadow flex justify-between items-center">
          <span>Active Chat Room</span>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
            {participantName}
          </span>
        </header>

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[85%] ${
                msg.sender === participantName
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-gray-800 text-gray-200"
              }`}
            >
              <p className="text-[10px] uppercase tracking-wider font-bold opacity-50 mb-1">
                {msg.sender}
              </p>
              <p className="text-sm break-words">{msg.text}</p>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={sendMessage}
          className="p-4 border-t border-gray-800 bg-gray-950 flex gap-2"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-500 transition"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
