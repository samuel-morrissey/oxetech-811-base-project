import path from "node:path";

export const DATA_FILE = process.env.DATA_FILE || "data/db.json";
export const DATABASE_PATH = path.resolve(process.cwd(), DATA_FILE);
