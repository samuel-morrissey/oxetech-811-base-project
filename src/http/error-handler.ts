import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./api-error.js";
import { HttpStatus } from "./http-status.js";

export function apiErrorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  void _next;
  if (error instanceof ApiError) {
    error.send(response);
    return;
  }

  if (process.env.NODE_ENV !== "test") {
    console.error(error);
  }

  response
    .status(HttpStatus.INTERNAL_SERVER_ERROR)
    .json({ message: "Erro interno do servidor" });
}
