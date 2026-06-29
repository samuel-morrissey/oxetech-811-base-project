import path from "node:path";
import { env } from "./env.js";

export const DATABASE_PATH = path.resolve(
  process.cwd(),
  env.DATA_FILE,
);
