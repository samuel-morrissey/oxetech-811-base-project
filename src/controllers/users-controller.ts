import type { Request, Response } from "express";
import { readDatabase } from "../database/jsonDatabase.js";
import { HttpStatus } from "../http/http-status.js";
import type { Database } from "../types.js";
import type { Controller } from "./controller.js";

export class UsersController implements Controller {
  index(_request: Request, response: Response): void {
    const database: Database = readDatabase();

    response.status(HttpStatus.OK).json(database.users);
  }
}
