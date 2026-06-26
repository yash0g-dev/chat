"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { createDirectChat } from "@/store/chatSlice";
import { api } from "@/lib/api";
import { Search, X, Loader2 } from "lucide-react";

interface UserResult {
  id: string;
  username: string;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Debounced API call to search users as you type
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        // UPDATED: Using ?username= to match your backend controller exactly
        const response = await api.get(`/user/search?username=${searchQuery}`);
        setResults(response.data.users);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to search users");
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 1000);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleStartChat = async (userId: string) => {
    try {
      await dispatch(createDirectChat(userId)).unwrap();
      onClose(); // Close modal on success
      setSearchQuery(""); // Reset search
    } catch (err) {
      setError("Failed to create chat");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight">
            New Message
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-gray-950 border border-gray-800 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            autoFocus
          />
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-blue-500" size={24} />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleStartChat(user.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition text-left"
                >
                  <div className="h-10 w-10 shrink-0 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white uppercase">
                    {user.username.charAt(0)}
                  </div>
                  <span className="font-medium text-white text-sm">
                    {user.username}
                  </span>
                </button>
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <p className="text-center text-sm text-gray-500 py-6">
              No users found.
            </p>
          ) : (
            <p className="text-center text-sm text-gray-500 py-6">
              Type a username to start searching.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
