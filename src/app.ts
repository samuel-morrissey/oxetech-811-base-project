import cors from "cors";
import express, { type Application, json } from "express";
import { apiErrorHandler } from "./http/error-handler.js";
import { requestLogger } from "./http/request-logger.js";
import { router } from "./routes/index.js";
import { notFoundFallback } from "./routes/fallbacks.js";
import { logger } from "./utils/logger.js";

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(json());
  app.use(requestLogger);
  app.use("/api", router);
  app.use(notFoundFallback);
  app.use(apiErrorHandler);

  return app;
}

export function logStartup(port: number): void {
  logger.info(`API running on http://localhost:${port}`);
}
