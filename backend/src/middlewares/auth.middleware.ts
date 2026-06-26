import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  userId: string;
}

type AuthHandler = (req: Request, res: Response, next: NextFunction) => void;

export type AuthController = (
  req: AuthenticatedRequest,
  res: Response,
) => Promise<void>;

export const protectRoute: AuthHandler = (req, res, next) => {
  try {
    // Read the access token from the parsed httpOnly cookies
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      next(new Error("Authentication token missing or expired"));
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string,
    ) as { id: string };

    req.userId = decoded.id;
    next();
  } catch (error) {
    next(new Error("Invalid authentication token"));
  }
};

// export const adminAuthMiddleware = (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): void => {
//   const accessToken = req.cookies.accessToken;
//   if (!accessToken) {
//     throw new ApiError(401, "Access token not found");
//   }
//   try {
//     const decoded = jwt.verify(
//       accessToken,
//       process.env.ACCESS_TOKEN_SECRET as { id: string },
//     );
//     req.userId = decoded.id;
//     if (decoded.role) {
//       next();
//     } else {
//       throw new ApiError(401, "Unauthorized");
//     }
//   } catch (error) {
//     if (error instanceof ApiError) {
//       throw error;
//     }
//     throw new ApiError(500, "Something went wrong");
//   }
// };
