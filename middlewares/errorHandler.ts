import { Request, Response, NextFunction } from "express";

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  path?: string;
  details?: unknown;
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode ?? err.status ?? 500;
  const response: ApiErrorResponse = {
    statusCode,
    message: err.message ?? "Internal server error",
    path: req.originalUrl,
    ...(err.details && { details: err.details }),
  };

  if (statusCode >= 500) console.error("[SERVER ERROR]", err);

  return res.status(statusCode).json(response);
};
export default errorHandler;
