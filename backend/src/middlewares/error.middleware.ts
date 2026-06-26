import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/utils.ts";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof Error) {
    console.error({
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  } else {
    console.error(err);
  }

  // handle known errors
  if (err instanceof ApiError) {
    res.status(err.status || 500).json({
      message: err.message || "Something went wrong",
    });
    return;
  }

  // handle unknown errors
  res.status(500).json({
    message: "Something went wrong",
  });
};
