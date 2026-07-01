import { Database } from "../../types/types";
import fs from "node:fs";

export class ContentAdapter {
    getDatabaseObject(filePath: string): Database {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content) as Database;
    }
}