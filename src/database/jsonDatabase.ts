import fs from "node:fs";
import { DATABASE_PATH } from "../config/database.js";
import type { Database } from "../types.js";

export function readDatabase(): Database {
  const content = fs.readFileSync(DATABASE_PATH, "utf-8");
  return JSON.parse(content) as Database;
}

export function writeDatabase(database: Database): void {
  fs.writeFileSync(DATABASE_PATH, JSON.stringify(database, null, 2));
}
