import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.config";
import { ApiError } from "../utils/utils";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary.service";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: "15m",
    },
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "7d",
    },
  );
  return { accessToken, refreshToken };
}

const setCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  let avatarPublicId: string | undefined;
  try {
    if (!username || !email || !password) {
      throw new ApiError(400, "Please provide all the fields");
    }

    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { username } }),
    ]);

    if (existingEmail) {
      throw new ApiError(400, "Email already exists");
    }

    if (existingUsername) {
      throw new ApiError(400, "Username already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let avatarUrl: string | undefined;

    if (req.file) {
      const upload = await uploadToCloudinary(req.file, "avatar");

      avatarUrl = upload.secure_url;
      avatarPublicId = upload.public_id;
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        avatarUrl,
        avatarPublicId,
      },
    });

    const token = generateTokens(user.id);
    setCookies(res, token.accessToken, token.refreshToken);

    res.status(201).json({
      message: "Registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    // Clean up uploaded avatar if user creation fails
    console.error(error);
    if (req.file && avatarPublicId) {
      await deleteFromCloudinary(avatarPublicId).catch(console.error);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Something went wrong");
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Please provide all the fields");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(400, "Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      throw new ApiError(400, "Invalid credentials");
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isOnline: true,
      },
    });

    const token = generateTokens(updatedUser.id);
    setCookies(res, token.accessToken, token.refreshToken);
    console.log(updatedUser);
    res.status(200).json({
      message: "Logged in successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,

        avatarUrl: updatedUser.avatarUrl,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,

        isOnline: updatedUser.isOnline,
        lastSeenAt: updatedUser.lastSeenAt,

        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error(error); // <- fix typo (was "conosle")

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Something went wrong");
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Something went wrong");
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new ApiError(400, "Refresh token not found");
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as { id: string };
    const token = generateTokens(decoded.id);
    setCookies(res, token.accessToken, token.refreshToken);
    res.status(200).json({
      message: "Token refreshed successfully",
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Something went wrong");
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    throw new ApiError(401, "Not authenticated");
  }

  // Decode the token to get the user ID
  const decoded = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET as string,
  ) as { id: string };

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      email: true,
      avatarUrl: true,
      isOnline: true,
      lastSeenAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  res.status(200).json({ user });
};
