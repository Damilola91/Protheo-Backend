import { Router } from "express";
import { loginUser } from "../controllers/loginController";
import { validateLogin } from "../middlewares/validateLogin";

const login = Router();

login.post("/login", validateLogin, loginUser);

export default login;
