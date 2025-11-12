import express, { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import { validateUser } from "../middlewares/validateUser"; 
const users = express.Router();

users.post("/users/create", validateUser, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists." });
        }

    const newUser = new User({ name, email, password, role });
    const savedUser = await newUser.save();

    res.status(201).json({
      statusCode: 201,
      message: "User created successfully",
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
    } catch (error) {
    next(error);
    }
})


users.get("/users", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find().select("-password");
        if (users.length === 0) {
            return res.status(404).json({ message: "No users found." });
        }
        res.status(200).json({ users });
    } catch (error) {
        next(error)
    }
})

export default users;