import { Request, Response, NextFunction } from "express";

export const validateUser = (req: Request, res: Response, next: NextFunction): void => {
  const errors: string[] = [];

  const { name, role, email, password } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("The email is not valid.");
  }

 
  if (typeof password !== "string" || password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }

 
  if (typeof name !== "string" || name.trim().length === 0) {
    errors.push("Name must be a valid string.");
  }

  
  if (typeof role !== "string" || !["admin", "user"].includes(role)) {
    errors.push("Role must be either 'admin' or 'user'.");
  }

  
  if (errors.length > 0) {
    res.status(400).json({ errors });
  } else {
    next();
  }
};
