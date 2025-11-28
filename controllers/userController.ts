import { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import { createError } from "../utils/createError";
import bcrypt from "bcrypt";

// REGISTER USER
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return next(createError(409, "Email already registered"));

    const user = await User.create(req.body);

    return res.status(201).json({
      message: "User registered successfully",
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

// GET BY ID
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return next(createError(404, "User not found"));

    return res.status(200).json({ user });
  } catch {
    next(createError(400, "Invalid userId format"));
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = (req as any).user; // dal token

    const user = await User.findById(id).select("-password");
    if (!user) return next(createError(404, "User not found"));

    return res.status(200).json({
      message: "Authenticated user info",
      user,
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body.password)
      req.body.password = await bcrypt.hash(req.body.password, 10);

    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return next(createError(404, "User not found"));
    return res.status(200).json({ message: "User updated", user });
  } catch (err) {
    next(err);
  }
};

// DELETE
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const removed = await User.findByIdAndDelete(req.params.userId);
    if (!removed) return next(createError(404, "User not found"));

    return res.status(200).json({ message: "User removed" });
  } catch {
    next(createError(400, "Invalid userId format"));
  }
};
