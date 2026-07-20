import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import type { Database} from "../types";

const router = Router();
const databasePath = path.resolve(process.cwd(), "data/db.json");

function readDatabase(): Database {
  const content = fs.readFileSync(databasePath, "utf-8");
  return JSON.parse(content) as Database;
}

router.get("/users", (_request, response) => {
  const database = readDatabase();

  response.json(database.users);
});

export default router;