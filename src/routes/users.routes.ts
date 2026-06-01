import { Router, type Request, type Response } from "express";
import { readDatabase } from "../database/jsonDatabase.js";
import type { Database } from "../types.js";
import { HttpStatus } from "../http/http-status.js";

const router = Router();

router.get("/", (_request: Request, response: Response) => {
  const database: Database = readDatabase();

  response.status(HttpStatus.OK).json(database.users);
});

export { router as usersRouter };
