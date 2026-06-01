import type { Request, Response } from "express";
import { HttpStatus } from "../http/http-status.js";

export const notFoundFallback = (
  _request: Request,
  response: Response,
) => {
  response
    .status(HttpStatus.NOT_FOUND)
    .json({ message: "Rota nao encontrada" });
};
