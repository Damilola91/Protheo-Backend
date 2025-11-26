import init from "./db";
import cors from "cors";
import express, { Request, Response } from "express";
import users from "./routes/users";
import errorHandler, { ApiErrorResponse } from "./middlewares/errorHandler";

const server = express();
const PORT = process.env.PORT || 4154;

server.use(express.json());
server.use(cors());

server.use("/api/users", users);

server.use((req: Request, res: Response) => {
  const response: ApiErrorResponse = {
    statusCode: 404,
    message: "Resource not Found",
    path: req.originalUrl,
  };

  res.status(404).json(response);
});

server.use(errorHandler);

init();

server.listen(PORT, () => console.log(`Server is runnin' on PORT ${PORT}`));
