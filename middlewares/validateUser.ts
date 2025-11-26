import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/createError";

export const validateUser = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];
  const { name, role, email, password } = req.body;

  if (
    !email ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.push("Invalid or missing email.");
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name must be a valid string of at least 2 characters.");
  }

  if (role && !["admin", "user"].includes(role)) {
    errors.push("Role must be 'admin' or 'user' if provided.");
  }

  if (errors.length > 0) {
    return next(createError(400, "User validation failed", errors));
  }

  next();
};
