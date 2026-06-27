import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../lib/api";

export interface Attachment {
  url: string;
  fileName: string;
  type: string;
  size: number;
}

export interface Message {
  id?: string; // Local temporary ID for optimistic UI
  _id?: string; // MongoDB real ID
  channelId: string;
  content: string;
  attachments?: Attachment[];
  status?: "sending" | "sent" | "delivered" | "read";
  createdAt: string;
  sender: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
}

export interface ChatMember {
  lastReadAt?: string | null;
  user: {
    id: string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    isOnline: boolean;
    lastSeenAt?: string | null;
  };
}

export interface Chat {
  id: string;
  isGroup: boolean;
  name?: string | null;
  dmKey?: string | null;
  createdAt: string;
  updatedAt: string; // Added to match sorting logic
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  members: ChatMember[];
}

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  messagesByChat: Record<string, Message[]>;
  hasFetchedHistory: Record<string, boolean>;
  isChatLoading: boolean;
  isMessageLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  activeChatId: null,
  messagesByChat: {},
  hasFetchedHistory: {},
  isChatLoading: false,
  isMessageLoading: false,
  error: null,
};

// 1. Fetch Sidebar Chats
export const fetchSidebarChats = createAsyncThunk(
  "chat/fetchSidebarChats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/channel");
      return response.data.channels as Chat[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch chats",
      );
    }
  },
);

// 2. Create 1-on-1 Chat
export const createDirectChat = createAsyncThunk(
  "chat/createDirectChat",
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/chat/create-chat", { targetUserId });
      return response.data.channel as Chat;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create chat",
      );
    }
  },
);

// 3. Create Group Chat
export const createGroupChat = createAsyncThunk(
  "chat/createGroupChat",
  async (payload: { name: string; members: string[] }, { rejectWithValue }) => {
    try {
      const response = await api.post("/chat/create-group-chat", payload);
      return response.data.channel as Chat;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create group chat",
      );
    }
  },
);

// 4. Fetch Chat Messages (REST fallback if not using sockets for history)
export const fetchChatMessages = createAsyncThunk(
  "chat/fetchChatMessages",
  async (chatId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      return response.data.messages as Message[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages",
      );
    }
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveChat: (state, action: PayloadAction<string>) => {
      state.activeChatId = action.payload;
    },
    receiveMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const chatId = message.channelId;

      if (!state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = [];
      }

      const existingIndex = state.messagesByChat[chatId].findIndex(
        (m) =>
          (m._id && m._id === message._id) || (m.id && m.id === message.id),
      );

      if (existingIndex === -1) {
        // If it doesn't exist, push it
        state.messagesByChat[chatId].push(message);
      } else {
        // If it DOES exist, just update the existing one (good for handling status changes)
        state.messagesByChat[chatId][existingIndex] = {
          ...state.messagesByChat[chatId][existingIndex],
          ...message,
        };
      }

      // Update sidebar chat details
      const chat = state.chats.find((c) => c.id === chatId);
      if (!chat) return;

      chat.lastMessage =
        message.content ||
        (message.attachments?.length ? "📷 Photo" : "New message");
      chat.lastMessageAt = message.createdAt;
      chat.updatedAt = message.createdAt;

      // Only increment unread if chat isn't active AND message wasn't sent by me
      if (state.activeChatId !== chatId && message.status !== "sending") {
        chat.unreadCount++;
      }

      // Bubble chat to top
      state.chats.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    },
    // NEW: Replace temporary optimistic message with real message from server
    updateMessage: (
      state,
      action: PayloadAction<{
        channelId: string;
        tempId: string;
        realMessage: Message;
      }>,
    ) => {
      const { channelId, tempId, realMessage } = action.payload;
      const messages = state.messagesByChat[channelId];
      if (messages) {
        const index = messages.findIndex(
          (m) => m.id === tempId || m._id === tempId,
        );
        if (index !== -1) {
          messages[index] = {
            ...messages[index],
            ...realMessage,
            status: "sent",
          };
        }
      }
    },

    // NEW: Update read/delivered status for a batch of messages
    updateMessagesStatus: (
      state,
      action: PayloadAction<{
        channelId: string;
        messageIds: string[];
        status: Message["status"];
      }>,
    ) => {
      const { channelId, messageIds, status } = action.payload;
      const messages = state.messagesByChat[channelId];
      if (messages) {
        messages.forEach((msg) => {
          // Check against both MongoDB _id and temporary id
          const idToCheck = msg._id || msg.id;
          if (idToCheck && messageIds.includes(idToCheck)) {
            msg.status = status;
          }
        });
      }
    },

    clearMessages: (state) => {
      state.messagesByChat = {};
    },

    setChatHistory: (
      state,
      action: PayloadAction<{ chatId: string; messages: Message[] }>,
    ) => {
      const { chatId, messages } = action.payload;
      state.messagesByChat[chatId] = messages;
      state.hasFetchedHistory[chatId] = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Chats
      .addCase(fetchSidebarChats.pending, (state) => {
        state.isChatLoading = true;
        state.error = null;
      })
      .addCase(fetchSidebarChats.fulfilled, (state, action) => {
        state.chats = action.payload.map((chat) => ({
          ...chat,
          unreadCount: 0,
        }));
        state.isChatLoading = false;
      })
      .addCase(fetchSidebarChats.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isChatLoading = false;
      })

      // Fetch Messages
      .addCase(fetchChatMessages.pending, (state) => {
        state.isMessageLoading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.messagesByChat[action.meta.arg] = action.payload;
        state.isMessageLoading = false;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isMessageLoading = false;
      })

      // Create Direct Chat
      .addCase(createDirectChat.pending, (state) => {
        state.isChatLoading = true;
        state.error = null;
      })
      .addCase(createDirectChat.fulfilled, (state, action) => {
        const exists = state.chats.find((c) => c.id === action.payload.id);
        if (!exists) {
          state.chats.unshift(action.payload);
        }
        state.isChatLoading = false;
        state.activeChatId = action.payload.id;
      })
      .addCase(createDirectChat.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isChatLoading = false;
      })

      // Create Group Chat
      .addCase(createGroupChat.pending, (state) => {
        state.isChatLoading = true;
        state.error = null;
      })
      .addCase(createGroupChat.fulfilled, (state, action) => {
        state.chats.unshift(action.payload);
        state.isChatLoading = false;
        state.activeChatId = action.payload.id;
      })
      .addCase(createGroupChat.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isChatLoading = false;
      });
  },
});

export const {
  setActiveChat,
  receiveMessage,
  updateMessage,
  updateMessagesStatus,
  clearMessages,
  setChatHistory,
} = chatSlice.actions;

export default chatSlice.reducer;
