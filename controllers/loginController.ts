import { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import { createError } from "../utils/createError";
import { generateToken } from "../utils/generateToken";

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(createError(404, "User not found"));

    const validePassword = await user.comparePassword(password);
    if (!validePassword)
      return next(createError(401, "Invalid email or password"));

    const token = generateToken(String(user._id), user.role);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
