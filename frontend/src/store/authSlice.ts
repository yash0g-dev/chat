import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../lib/api";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: true, // Start true so we don't flash a login screen on refresh
  error: null,
};

// ----------------------------------------------------------------------
// ASYNC THUNKS
// ----------------------------------------------------------------------

// 1. Check Auth (Existing)
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/profile");
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Not authenticated",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", userData);
      // Backend should set the HTTP-only cookie and return the new user
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);
// 2. Register User
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData);
      // Backend should set the HTTP-only cookie and return the new user
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

// 3. Logout User
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
      // Backend clears the HTTP-only cookie
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

// 4. Refresh Token
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/refreshToken");
      // Silently resolves if the HTTP-only cookie is successfully refreshed
      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Token refresh failed",
      );
    }
  },
);

// 5. Fetch My Profile
export const fetchMyProfile = createAsyncThunk(
  "auth/myProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/profile");
      return response.data.profile;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile",
      );
    }
  },
);

// ----------------------------------------------------------------------
// SLICE DEFINITION
// ----------------------------------------------------------------------

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Manual sync fallbacks if needed
    setLogin: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.error = null;
    },
    setLogout: (state) => {
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- checkAuth ---
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        console.log("checkAuth", action.payload);
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.user = null;
        state.isLoading = false;
        // state.error = action.payload as string;
      })

      // --- registerUser ---
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload; // Auto-login on register
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // --- loginUser ---
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload; // Auto-login on register
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- logoutUser ---
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null; // Clear state on successful backend logout
      })

      .addCase(refreshToken.rejected, (state) => {
        state.user = null; // Force logout if refresh token expires/fails
      })

      // --- fetchMyProfile ---
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user.profile = action.payload;
        }
      });
  },
});

export const { setLogin, setLogout, clearError } = authSlice.actions;
export default authSlice.reducer;
