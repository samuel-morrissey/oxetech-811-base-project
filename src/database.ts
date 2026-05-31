import fs from "node:fs";
import path from "node:path";
import type { Database } from "./types";

const dataFile = process.env.DATA_FILE || "data/db.json";
export const databasePath = path.resolve(process.cwd(), dataFile);

export function readDatabaseFromPath(filePath: string): Database {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as Database;
  } catch {
    throw new Error(
      `Banco de dados não encontrado em "${filePath}". Execute "npm run seed" para criar o arquivo inicial.`,
    );
  }
}

export function readDatabase(): Database {
  return readDatabaseFromPath(databasePath);
}

export function writeDatabase(database: Database): void {
  fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
}
