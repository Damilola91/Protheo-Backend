import { Router } from "express";
import { createUser, getAllUsers } from "../controllers/userController";
import { validateUser } from "../middlewares/validateUser";

const users = Router();

users.post("/", validateUser, createUser); // CREATE
users.get("/", getAllUsers); // GET all

export default users;
