import { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import { createError } from "../utils/createError";

// CREATE USER
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return next(createError(409, "Email already registered"));

    const user = await User.create({ name, email, password, role });

    return res.status(201).json({
      statusCode: 201,
      message: "User created successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL USERS
export const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find().select("-password");

    if (!users.length) return next(createError(404, "No users found"));

    return res.status(200).json({ count: users.length, users });
  } catch (err) {
    next(err);
  }
};
