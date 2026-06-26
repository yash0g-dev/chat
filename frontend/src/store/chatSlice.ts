import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../lib/api";

interface Message {
  id: string;
  channelId: string;
  content: string;

  createdAt: string;
  sender: {
    id: string;
    username: string;
  };
}

export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  updatedAt: string;

  unreadCount: number;

  members: {
    lastReadAt?: string;
    user: {
      id: string;
      username: string;
    };
  }[];

  lastMessage?: string;
  lastMessageAt?: string;
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
      const response = await api.get("/chat/get-chats");
      // Unwrap the 'channels' array from your backend response
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
      // Hits the standard '/' route with the payload your controller expects
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
      // Hits the '/group' route you just made
      const response = await api.post("/chat/create-group-chat", payload);
      return response.data.channel as Chat;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create group chat",
      );
    }
  },
);

// Note: If you are using WebSockets (Socket.io) to fetch history from Mongoose,
// you actually don't need this REST thunk! But I'll leave it in case you built a REST route for it.
export const fetchChatMessages = createAsyncThunk(
  "chat/fetchChatMessages",
  async (chatId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      return response.data.messages as Message[]; // Make sure to unwrap this too!
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

      state.messagesByChat[chatId].push(message);

      const chat = state.chats.find((c) => c.id === chatId);

      if (!chat) return;

      chat.lastMessage = message.content;
      chat.lastMessageAt = message.createdAt;
      chat.updatedAt = message.createdAt;

      if (state.activeChatId !== chatId) {
        chat.unreadCount++;
      }

      state.chats.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    },
    clearMessages: (state) => {
      state.messagesByChat = {};
    },
    // Adding this back in case you use Socket.io for history loading
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
        // Only unshift if it doesn't already exist (in case backend returns existing chat)
        const exists = state.chats.find((c) => c.id === action.payload.id);
        if (!exists) {
          state.chats.unshift(action.payload);
        }
        state.isChatLoading = false;
        // Optionally auto-open the newly created chat
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

export const { setActiveChat, receiveMessage, clearMessages, setChatHistory } =
  chatSlice.actions;
export default chatSlice.reducer;
