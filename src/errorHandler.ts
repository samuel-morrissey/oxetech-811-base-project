import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errors";

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      message: error.message,
      ...error.details,
    });
    return;
  }

  console.error(error);
  response.status(500).json({ message: "Erro interno do servidor" });
}
