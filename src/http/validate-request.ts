import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { listTicketsQuerySchema } from "../features/tickets/dtos/list-tickets.dto.js";
import { fromZodError } from "./from-zod-error.js";

export function validateBody<T extends ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    void _res;
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(fromZodError(result.error));
      return;
    }

    req.body = result.data;
    next();
  };
}

export function validateListTicketsQuery() {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = listTicketsQuerySchema.safeParse(req.query);

    if (!result.success) {
      next(fromZodError(result.error));
      return;
    }

    res.locals.validatedQuery = result.data;
    next();
  };
}
