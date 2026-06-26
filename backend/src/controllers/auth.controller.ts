import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.config";
import { ApiError } from "../utils/utils";

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
  try {
    if (!username || !email || !password) {
      throw new ApiError(400, "Please provide all the fields");
    }
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ApiError(400, "Email already exists");
    }
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    console.log(existingUsername);

    if (existingUsername) {
      throw new ApiError(400, "Username already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
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
      },
    });
  } catch (error) {
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
    const token = generateTokens(user.id);
    setCookies(res, token.accessToken, token.refreshToken);
    console.log("logged in ", email);
    res.status(200).json({
      message: "Logged in successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
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
    select: { id: true, username: true, email: true },
  });

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  res.status(200).json({ user });
};
