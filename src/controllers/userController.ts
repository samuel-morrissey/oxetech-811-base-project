import type { Request, Response } from "express";

import { readDatabase } from "../repositories/database";

export function listUsers(_request: Request, response: Response): void {
  const database = readDatabase();
  response.json(database.users);
}
