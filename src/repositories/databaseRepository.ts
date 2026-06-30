import fs from "node:fs";
import path from "node:path";
import type { Database } from "../models/types";

const dataFilePath = process.env.DATA_FILE || "data/db.json";
const databasePath = path.resolve(process.cwd(), dataFilePath);

export function readDatabase(): Database {
	const content = fs.readFileSync(databasePath, "utf-8");
	return JSON.parse(content) as Database;
}

export function writeDatabase(database: Database) {
	fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
}

export const databaseRepository = {
	readDatabase,
	writeDatabase,
};
