import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/createError";

export const validateLogin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  if (errors.length > 0) {
    return next(createError(400, "Login validation failed", errors));
  }

  next();
};
