import { Router } from "express";
import {
  registerUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController";

import { validateUser } from "../middlewares/validateUser";
import { verifyToken, authorizeAdmin } from "../middlewares/authGuard";

const users = Router();

users.post("/register", validateUser, registerUser);

users.get("/list", verifyToken, authorizeAdmin, getAllUsers);

users.get("/details/:userId", verifyToken, getUserById);

users.patch("/update/:userId", verifyToken, updateUser);

users.delete("/remove/:userId", verifyToken, authorizeAdmin, deleteUser);

export default users;
