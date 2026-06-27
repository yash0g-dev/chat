"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { createDirectChat, createGroupChat } from "@/store/chatSlice";
import { api } from "@/lib/api";
import { Search, X, Loader2, UserPlus, UserCheck, MessageSquare, Users, User, Plus } from "lucide-react";

interface UserResult {
  id: string;
  username: string;
  avatarUrl?: string;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "chat" | "group";

export default function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  
  // Search & Query States
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Group Form Creation States
  const [groupName, setGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  // Mock Friend State
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

  // Debounced API User Lookup
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await api.get(`/user/search?username=${searchQuery}`);
        setResults(response.data.users);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to search users");
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 400);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle direct message link creation
  const handleStartChat = async (userId: string) => {
    try {
      await dispatch(createDirectChat(userId)).unwrap();
      handleCloseAndReset();
    } catch (err) {
      setError("Failed to create chat");
    }
  };

  // Handle building new group channels
  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedGroupMembers.length === 0) return;

    setIsCreatingGroup(true);
    setError("");

    try {
      await dispatch(
        createGroupChat({
          name: groupName.trim(),
          members: selectedGroupMembers,
        })
      ).unwrap();
      handleCloseAndReset();
    } catch (err: any) {
      setError(err?.message || "Failed to build group room");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleToggleMemberCheckbox = (userId: string) => {
    setSelectedGroupMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSendFriendRequest = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setPendingRequests((prev) => {
      const newSet = new Set(prev);
      newSet.add(userId);
      return newSet;
    });
    console.log(`Friend request dispatched to ${userId}`);
  };

  const handleCloseAndReset = () => {
    setSearchQuery("");
    setGroupName("");
    setSelectedGroupMembers([]);
    setResults([]);
    setError("");
    setActiveTab("chat");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-2xl transition-all flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {activeTab === "chat" ? "New Message" : "Create Group Chat"}
          </h2>
          <button
            onClick={handleCloseAndReset}
            className="text-gray-400 hover:text-white transition bg-gray-800/50 hover:bg-gray-800 p-1.5 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="relative mb-3 shrink-0">
          <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search users to add..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-gray-950 border border-gray-800 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            autoFocus
          />
        </div>

        {/* Modern Nav Tabs Controls */}
        <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800 mb-4 shrink-0">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "chat"
                ? "bg-gray-800 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <User size={16} />
            Direct Chat
          </button>
          <button
            onClick={() => setActiveTab("group")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "group"
                ? "bg-gray-800 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Users size={16} />
            Create Group
          </button>
        </div>

        {error && <p className="text-sm text-red-400 mb-3 shrink-0">{error}</p>}

        {/* Dynamic Inner Panel Viewport Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          
          {/* GROUP CREATION FORM INFO HEADER */}
          {activeTab === "group" && (
            <div className="mb-4 bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-2 shrink-0">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Group Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter group subject name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              />
              {selectedGroupMembers.length > 0 && (
                <p className="text-xs text-blue-400 font-medium pt-1">
                  {selectedGroupMembers.length} member{selectedGroupMembers.length > 1 ? "s" : ""} checked
                </p>
              )}
            </div>
          )}

          {/* SHARED DYNAMIC LOOKUP FEED RESULTS LIST */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1.5 pr-1">
              {results.map((user) => {
                const isPending = pendingRequests.has(user.id);
                const isChecked = selectedGroupMembers.includes(user.id);

                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      if (activeTab === "group") {
                        handleToggleMemberCheckbox(user.id);
                      } else {
                        handleStartChat(user.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors group ${
                      isChecked && activeTab === "group" 
                        ? "bg-blue-600/10 border border-blue-500/30" 
                        : "hover:bg-gray-800 border border-transparent"
                    }`}
                  >
                    {/* User profile identifier fields */}
                    <div className="flex items-center gap-3">
                      {/* Checkbox placement indicator circle */}
                      {activeTab === "group" && (
                        <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked 
                            ? "bg-blue-500 border-blue-600 text-white" 
                            : "border-gray-600 group-hover:border-gray-400"
                        }`}>
                          {isChecked && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                        </div>
                      )}
                      
                      <div className="h-10 w-10 shrink-0 rounded-full border border-gray-700 bg-gray-800 flex items-center justify-center font-bold text-sm text-white uppercase overflow-hidden">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
                        ) : (
                          user.username.charAt(0)
                        )}
                      </div>
                      <span className="font-medium text-gray-200 text-sm group-hover:text-white transition-colors">
                        {user.username}
                      </span>
                    </div>

                    {/* Conditional controls depending on selected active tab */}
                    {activeTab === "chat" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleSendFriendRequest(e, user.id)}
                          disabled={isPending}
                          title={isPending ? "Request Sent" : "Add Friend"}
                          className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                            isPending
                              ? "bg-green-500/10 text-green-500 cursor-default"
                              : "bg-gray-800 text-gray-400 hover:bg-blue-600/20 hover:text-blue-500"
                          }`}
                        >
                          {isPending ? <UserCheck size={18} /> : <UserPlus size={18} />}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartChat(user.id);
                          }}
                          title="Send Message"
                          className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-blue-600/20 hover:text-blue-500 transition-colors"
                        >
                          <MessageSquare size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : searchQuery.trim() ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Search className="text-gray-600 mb-2" size={28} />
              <p className="text-sm text-gray-400">No matching user tracks found</p>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500 py-10">
              Type a username to display platform profiles.
            </p>
          )}
        </div>

        {/* STICKY FOOTER GROUP CONFIRMATION TRIGGER BUTTON BUTTON */}
        {activeTab === "group" && (
          <div className="pt-4 border-t border-gray-800 mt-3 shrink-0">
            <button
              onClick={handleCreateGroupSubmit}
              disabled={isCreatingGroup || !groupName.trim() || selectedGroupMembers.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:text-gray-500 disabled:cursor-not-allowed shadow-lg shadow-blue-500/10"
            >
              {isCreatingGroup ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus size={18} strokeWidth={2.5} />
                  <span>Build Group Channel</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
