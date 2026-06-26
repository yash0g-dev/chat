import ChatItem from "./ChatItem";

interface ChatListProps {
  chats: any[]; // Replace with Chat[] type
  currentUserId?: string;
  activeChatId?: string;
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
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500 mt-8">
        No conversations found
      </p>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
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
