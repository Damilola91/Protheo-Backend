import { Request, Response, NextFunction } from "express";

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  path?: string;
  details?: unknown;
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode =
    typeof (err as { status?: number }).status === "number"
      ? (err as { status: number }).status
      : typeof (err as { statusCode?: number }).statusCode === "number"
      ? (err as { statusCode: number }).statusCode
      : 500;

  const message =
    (err as { message?: string }).message || "Internal server error";
  const details = (err as { details?: unknown }).details;

  const response: ApiErrorResponse = {
    statusCode,
    message,
    path: req.originalUrl,
  };

  if (details !== undefined) {
    response.details = details;
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
