"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchSidebarChats, setActiveChat } from "@/store/chatSlice";
import { getChatTitle } from "@/utils/chatHelpers";
import SidebarHeader from "./SidebarHeader";
import SidebarSearch from "./SidebarSearch";
import ChatList from "./ChatList";
import NewChatModal from "./NewChatModal";

export default function Sidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { chats, activeChatId, isChatLoading } = useSelector(
    (state: RootState) => state.chat,
  );

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSidebarChats());
  }, [dispatch]);

  const handleSelectChat = (chatId: string) => {
    dispatch(setActiveChat(chatId));
  };

  const filteredChats = chats.filter((chat) => {
    const displayTitle = getChatTitle(chat, currentUser?.id);
    return displayTitle.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <div className="flex h-full w-full shrink-0 flex-col border-r border-gray-800 bg-gray-900 sm:w-80 md:w-96">
        <SidebarHeader
          currentUser={currentUser}
          onOpenNewChat={() => setIsModalOpen(true)}
        />

        <SidebarSearch search={search} onSearchChange={setSearch} />

        <ChatList
          chats={filteredChats}
          currentUserId={currentUser?.id}
          activeChatId={activeChatId}
          isLoading={isChatLoading}
          onSelectChat={handleSelectChat}
        />
      </div>

      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
