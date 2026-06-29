import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

const WRITE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

export function requestLogger(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  if (WRITE_METHODS.has(request.method)) {
    logger.info(`${request.method} ${request.path}`);
  }

  next();
}
