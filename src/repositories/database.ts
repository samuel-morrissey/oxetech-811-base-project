import fs from "node:fs";
import path from "node:path";
import { CONFIG } from "../constants";
import type { Database } from "../types";

const dataFile = process.env.DATA_FILE || CONFIG.DEFAULT_DATA_FILE;
const databasePath = path.resolve(process.cwd(), dataFile);

export function readDatabase(): Database {
  const content = fs.readFileSync(databasePath, CONFIG.FILE_ENCODING);
  return JSON.parse(content) as Database;
}

export function writeDatabase(database: Database) {
  fs.writeFileSync(databasePath, JSON.stringify(database, null, CONFIG.JSON_INDENT));
}
