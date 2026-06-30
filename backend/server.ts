import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { registerChatHandlers } from "./src/sockets/chatSocket";
import connectMongooseDB from "./src/config/mongoose.config";
import { liveKitToken } from "./src/routes/liveKitToken.route.ts";
import { errorHandler } from "./src/middlewares/error.middleware";
import { authRoutes } from "./src/routes/auth.routes";
import { userRoutes } from "./src/routes/user.route";
import { channelRoutes } from "./src/routes/channel.route";
import { friendshipRoutes } from "./src/routes/friends.routes";
import cookieParser from "cookie-parser";
import { socketAuthMiddleware } from "./src/middlewares/socket.middleware";
import { chatRoutes } from "./src/routes/chat.routes";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

await connectMongooseDB();

const port = process.env.PORT || 5000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  registerChatHandlers(io, socket);
  console.log("user disconnected");
});

app.set("io", io);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/friendship", friendshipRoutes);
app.use("/api/chat", chatRoutes);
app.get("/api/get-livekit-token", liveKitToken);

app.use(errorHandler);

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
