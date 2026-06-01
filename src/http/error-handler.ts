import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./api-error.js";

export function apiErrorHandler(
  error: Error,
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (error instanceof ApiError) {
    error.send(response);
    return;
  }

  next(error);
}
