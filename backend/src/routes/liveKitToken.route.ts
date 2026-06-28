import type { Request, Response } from "express";
import { AccessToken } from "livekit-server-sdk";

export const liveKitToken = async (req: Request, res: Response) => {
  const room = (req.query.room as string) || "test-room";
  const identity =
    (req.query.identity as string) ||
    `user-${Math.floor(Math.random() * 1000)}`;

  // Using the exact token initialization format from the docs
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: identity,
      ttl: "10m",
    },
  );

  at.addGrant({
    roomJoin: true,
    room: room,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  res.json({ token });
};
