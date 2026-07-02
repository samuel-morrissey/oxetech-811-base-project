import fs from "node:fs";
import path from "node:path";
import { Database } from "./types";

export class DatabaseManager {
    private static instance: DatabaseManager;

    private readonly databasePath: string;

    private constructor() {
        const dataFile = process.env.DATA_FILE || "data/db.json";
        this.databasePath = path.resolve(process.cwd(), dataFile);
    }

    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }

        return DatabaseManager.instance;
    }

    public readDatabase(): Database {
        const content = fs.readFileSync(this.databasePath, "utf-8");
        return JSON.parse(content) as Database;
    }

    public writeDatabase(database: Database): void {
        fs.writeFileSync(
            this.databasePath,
            JSON.stringify(database, null, 2)
        );
    }

    static generateId(prefix: string) {
        return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    }

}