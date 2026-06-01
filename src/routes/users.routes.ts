import { Router } from "express";
import { readDatabase } from "../database/jsonDatabase.js";
import type { Database } from "../types.js";

const router = Router();

router.get("/", (_request, response) => {
  const database: Database = readDatabase();

  response.json(database.users);
});

export default router;
