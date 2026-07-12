import fs from "node:fs";
import path from "node:path";
import type { Database } from "../types";

const dataFile = process.env.DATA_FILE || "data/db.json";
const databasePath = path.resolve(process.cwd(), dataFile);

export function readDatabase(): Database {
  const content = fs.readFileSync(databasePath, "utf-8");
  return JSON.parse(content) as Database;
}

export function writeDatabase(database: Database): void {
  fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}
