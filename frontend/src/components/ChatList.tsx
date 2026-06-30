import ChatItem from "./ChatItem";
import { MessageSquareOff } from "lucide-react";
import type { Chat } from "@/store/chatSlice";

interface ChatListProps {
  chats: Chat[];
  currentUserId?: string;
  activeChatId?: string | null;
  isLoading: boolean;
  onSelectChat: (chatId: string) => void;
}

export default function ChatList({
  chats,
  currentUserId,
  activeChatId,
  isLoading,
  onSelectChat,
}: ChatListProps) {
  //  Skeleton Loader
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-full flex items-center gap-3 px-4 py-4 border-b border-gray-800/20 animate-pulse"
          >
            <div className="h-12 w-12 rounded-full bg-gray-800 shrink-0"></div>
            <div className="flex-1 space-y-2.5 min-w-0">
              <div className="h-4 bg-gray-800 rounded-md w-1/3"></div>
              <div className="h-3 bg-gray-800 rounded-md w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  //  Empty State
  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center text-gray-500 mt-12">
        <div className="h-12 w-12 bg-gray-900 rounded-full flex items-center justify-center mb-3">
          <MessageSquareOff size={24} className="text-gray-600" />
        </div>
        <p className="text-sm font-medium text-gray-400">
          No conversations yet
        </p>
        <p className="text-xs mt-1">Start a chat to break the ice.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pt-1">
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          currentUserId={currentUserId}
          isActive={chat.id === activeChatId}
          onSelectChat={onSelectChat}
        />
      ))}
    </div>
  );
}
