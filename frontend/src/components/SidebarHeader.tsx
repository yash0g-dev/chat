import { Plus } from "lucide-react";

interface SidebarHeaderProps {
  currentUser: any; // Replace 'any' with your User type
  onOpenNewChat: () => void;
}

export default function SidebarHeader({
  currentUser,
  onOpenNewChat,
}: SidebarHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-800 flex items-center justify-between">
      <h2 className="text-xl font-bold text-white tracking-tight">Messages</h2>
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenNewChat}
          className="h-8 w-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 hover:border-gray-600 transition"
          title="New Chat"
        >
          <Plus size={16} strokeWidth={3} />
        </button>
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white uppercase shadow-md shadow-blue-500/20">
          {currentUser?.username?.charAt(0) || "U"}
        </div>
      </div>
    </div>
  );
}
