import { getChatTitle } from "@/utils/chatHelpers";

interface ChatItemProps {
  chat: any; // Replace with Chat type
  currentUserId?: string;
  isActive: boolean;
  onSelectChat: (chatId: string) => void;
}

export default function ChatItem({
  chat,
  currentUserId,
  isActive,
  onSelectChat,
}: ChatItemProps) {
  const chatTitle = getChatTitle(chat, currentUserId);
  const lastMsg = chat.lastMessage;
  const lastMsgAt = chat.lastMessageAt;

  // 1. Extract the unread count (defaulting to 0)
  const unreadCount = chat.unreadCount || 0;

  return (
    <button
      onClick={() => onSelectChat(chat.id)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 transition text-left border-b border-gray-800/40 ${
        isActive
          ? "bg-blue-600/10 border-l-4 border-l-blue-500"
          : "hover:bg-gray-800/50"
      }`}
    >
      <div className="h-11 w-11 shrink-0 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-gray-300 uppercase">
        {chatTitle.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-0.5">
          {/* Highlight title slightly if there are unread messages */}
          <h3
            className={`font-semibold text-sm truncate ${unreadCount > 0 && !isActive ? "text-white" : "text-gray-200"}`}
          >
            {chatTitle}
          </h3>
          {lastMsg && (
            <span
              className={`text-[10px] font-mono shrink-0 ${unreadCount > 0 && !isActive ? "text-blue-400 font-medium" : "text-gray-500"}`}
            >
              {new Date(lastMsgAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        {/* Wrap the last message and badge in a flex container */}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={`text-xs truncate ${unreadCount > 0 && !isActive ? "text-gray-300 font-medium" : "text-gray-400"}`}
          >
            {lastMsg ? lastMsg || (lastMsg as any).text : "No messages yet"}
          </p>

          {/* 2. Render the Unread Badge if count > 0 */}
          {unreadCount > 0 && !isActive && (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
