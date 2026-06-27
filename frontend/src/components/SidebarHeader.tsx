import { Plus } from "lucide-react";

interface SidebarHeaderProps {
  currentUser: any; // Replace 'any' with your User type
  onOpenNewChat: () => void;
}

export default function SidebarHeader({
  currentUser,
  onOpenNewChat,
}: SidebarHeaderProps) {
  // Safely extract the avatar based on your backend response
  const avatarUrl = currentUser?.avatarUrl || currentUser?.image || null;

  console.log("avatar", currentUser);

  return (
    <div className="px-5 py-4 border-b border-gray-800/60 flex items-center justify-between bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
      <h2 className="text-xl font-bold text-gray-100 tracking-tight">
        Messages
      </h2>

      <div className="flex items-center gap-3.5">
        <button
          onClick={onOpenNewChat}
          className="h-9 w-9 rounded-full bg-gray-800/80 border border-gray-700/50 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 hover:border-gray-600 transition-all duration-200 active:scale-95"
          title="New Chat"
          aria-label="New Chat"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>

        {/* User Profile Avatar with Image Support */}
        <div
          className="relative h-9 w-9 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
          title={currentUser?.username || "Profile"}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={currentUser?.username || "Profile"}
              className="h-full w-full rounded-full object-cover border border-gray-700 shadow-sm"
            />
          ) : (
            <div className="h-full w-full rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white uppercase shadow-md shadow-blue-500/20 border border-blue-500">
              {currentUser?.username?.charAt(0) || "U"}
            </div>
          )}

          {/* Online Indicator Dot (Green) */}
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-gray-900"></span>
        </div>
      </div>
    </div>
  );
}
