import { Image as ImageIcon } from "lucide-react";

interface ChatItemProps {
  chat: any;
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
  // 1. Extract details dynamically based on chat type
  let chatTitle = "Conversation";
  let avatarUrl = null;
  let isOnline = false;

  if (chat.isGroup && chat.name) {
    chatTitle = chat.name;
    avatarUrl = chat.avatarUrl || null;
  } else if (chat.members) {
    // Find the OTHER user in the chat
    const otherMember = chat.members.find(
      (m: any) => m.user.id !== currentUserId,
    );
    if (otherMember) {
      chatTitle = otherMember.user.displayName || otherMember.user.username;
      avatarUrl = otherMember.user.avatarUrl;
      isOnline = otherMember.user.isOnline;
    }
  }

  const lastMsg = chat.lastMessage;
  const lastMsgAt = chat.lastMessageAt;
  const unreadCount = chat.unreadCount || 0;

  // Helper to determine what text to show for the last message
  const renderLastMessageContent = () => {
    if (!lastMsg) return "No messages yet";

    if (lastMsg.type === "image" || lastMsg.imageUrl) {
      return (
        <span className="flex items-center gap-1">
          <ImageIcon size={12} className="shrink-0" />
          <span>Photo</span>
        </span>
      );
    }

    return typeof lastMsg === "string"
      ? lastMsg
      : lastMsg.text || "New message";
  };

  return (
    <button
      onClick={() => onSelectChat(chat.id)}
      className={`w-full group flex items-center gap-3 px-4 py-3.5 transition-all duration-200 text-left border-b border-gray-800/30 outline-none ${
        isActive
          ? "bg-blue-600/10"
          : "hover:bg-gray-800/40 focus-visible:bg-gray-800/40"
      }`}
    >
      {isActive && (
        <div className="absolute left-0 w-1 h-10 bg-blue-500 rounded-r-md"></div>
      )}

      {/* Avatar Container */}
      <div className="relative h-12 w-12 shrink-0 transition-transform duration-200 group-active:scale-95">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={chatTitle}
            className="h-full w-full rounded-full object-cover border border-gray-800"
          />
        ) : (
          <div
            className={`h-full w-full rounded-full flex items-center justify-center font-bold uppercase border ${
              isActive
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-gray-800 border-gray-700 text-gray-300"
            }`}
          >
            {chatTitle.charAt(0)}
          </div>
        )}

        {/* Online Indicator */}
        {!chat.isGroup && isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-gray-950"></span>
        )}
      </div>

      {/* Chat Details Container */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between mb-1">
          <h3
            className={`font-semibold text-[15px] truncate ${
              unreadCount > 0 && !isActive ? "text-white" : "text-gray-200"
            }`}
          >
            {chatTitle}
          </h3>
          {lastMsgAt && (
            <span
              className={`text-[11px] shrink-0 ml-2 ${
                unreadCount > 0 && !isActive
                  ? "text-blue-400 font-medium"
                  : "text-gray-500"
              }`}
            >
              {new Date(lastMsgAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-[13px] truncate ${
              unreadCount > 0 && !isActive
                ? "text-gray-300 font-medium"
                : "text-gray-400"
            }`}
          >
            {renderLastMessageContent()}
          </p>

          {unreadCount > 0 && !isActive && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white shadow-sm ring-2 ring-gray-950">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
