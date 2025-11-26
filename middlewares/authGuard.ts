import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { createError } from "../utils/createError";

interface AuthPayload extends JwtPayload {
  id: string;
  role: "admin" | "user";
}

export const verifyToken = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header) return next(createError(401, "Missing auth token"));

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    (req as any).user = decoded; // 🔥 ora funziona
    next();
  } catch {
    next(createError(401, "Invalid or expired token"));
  }
};

export const authorizeAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;
  if (!user) return next(createError(401, "Not authenticated"));
  if (user.role !== "admin")
    return next(createError(403, "Admin access required"));
  next();
};
