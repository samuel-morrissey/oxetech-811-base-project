import "dotenv/config";
import { z } from "zod";

const envConfigSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().min(1024).max(65535).default(3000),
  DATA_FILE: z.string().min(1).default("data/db.json"),
});

export type envConfig = z.infer<typeof envConfigSchema>;
export const env = envConfigSchema.parse(process.env);
