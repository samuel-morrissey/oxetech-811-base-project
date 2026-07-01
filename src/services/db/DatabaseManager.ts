import fs from "node:fs";
import path from "node:path";
import { Database } from "../../types/types";
import { ContentAdapter } from "./ContentAdapter";

export class DatabaseManager {
    private static instance: DatabaseManager;
    private database: Database;

    private constructor() {
        const dataFile = process.env.DATA_FILE || "data/db.json";
        const databasePath = path.resolve(process.cwd(), dataFile);
        this.database = this.readFromFile(databasePath);
    }

    static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    getDatabase(): Database {
        return this.database;
    }

    saveDatabase(data: Database) {
        this.writeToFile(data);
    }

    private readFromFile(databasePath: string): Database {
        const adapter = new ContentAdapter();
        return adapter.getDatabaseObject(databasePath);
    }

    private writeToFile(data: Database) {
        const dataFile = process.env.DATA_FILE || "data/db.json";
        const databasePath = path.resolve(process.cwd(), dataFile);
        fs.writeFileSync(databasePath, JSON.stringify(data, null, 2));
    }
}