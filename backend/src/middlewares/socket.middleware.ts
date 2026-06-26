import { Socket } from "socket.io";

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void,
): Promise<void> => {
  console.log("socket started ");
  try {
    const token = socket.handshake.headers.authorization;
    console.log(token);

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
    ) as { id: string };

    socket.data.userId = decoded.id;

    next();
  } catch {
    next(new Error("Unauthorized"));
  }
};
