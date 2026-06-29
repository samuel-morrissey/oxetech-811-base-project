import fs from "node:fs";
import { DATABASE_PATH } from "../../config/database.js";
import { getUptimeSeconds } from "../../utils/app-start-time.js";

export interface HealthStatus {
  status: "ok";
  service: string;
  timestamp: string;
  uptime: number;
  database: "reachable" | "missing";
}

export function getHealthStatus(): HealthStatus {
  return {
    status: "ok",
    service: "oxetech-helpdesk",
    timestamp: new Date().toISOString(),
    uptime: getUptimeSeconds(),
    database: fs.existsSync(DATABASE_PATH) ? "reachable" : "missing",
  };
}
