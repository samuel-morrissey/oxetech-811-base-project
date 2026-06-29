import cors from "cors";
import express, { type Application, json } from "express";
import { apiErrorHandler } from "./http/error-handler.js";
import { router } from "./routes/index.js";
import { notFoundFallback } from "./routes/fallbacks.js";

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(json());
  app.use("/api", router);
  app.use(notFoundFallback);
  app.use(apiErrorHandler);

  return app;
}
