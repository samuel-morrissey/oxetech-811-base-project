import type { NextFunction, Request, Response } from "express";

type RouteHandler = (
  request: Request,
  response: Response,
  next: NextFunction,
) => void;

export function routeHandler(handler: RouteHandler): RouteHandler {
  return (request, response, next) => {
    try {
      handler(request, response, next);
    } catch (error) {
      next(error);
    }
  };
}
