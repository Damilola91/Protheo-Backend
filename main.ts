import init from "./db";
import cors from "cors";
import express, { Request, Response } from "express";
import users from "./routes/users";
import login from "./routes/login";
import products from "./routes/products";
import errorHandler, { ApiErrorResponse } from "./middlewares/errorHandler";

const server = express();
const PORT = process.env.PORT || 4154;

// Global Middlewares
server.use(express.json());
server.use(cors());

// Routes
server.use("/api/users", users);
server.use("/api/auth", login);
server.use("/api/products", products);

// 404 Handler
server.use((req: Request, res: Response) => {
  const response: ApiErrorResponse = {
    statusCode: 404,
    message: "Resource not Found",
    path: req.originalUrl,
  };
  res.status(404).json(response);
});

// Global Error Handler
server.use(errorHandler);

// Safe Server Boot
const start = async () => {
  await init();
  server.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  );
};

start();
