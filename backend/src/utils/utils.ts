export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const getDmKey = (userA: string, userB: string) => {
  if (userA === userB) {
    throw new Error("Cannot create a chat with yourself.");
  }

  return [userA, userB].sort().join(":");
};
