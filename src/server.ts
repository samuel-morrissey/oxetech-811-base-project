import cors from "cors";
import express, { Application, json } from "express";
import { env } from "./config/env.js";
import { apiErrorHandler } from "./http/error-handler.js";
import { router } from "./routes/index.js";
import { notFoundFallback } from "./routes/fallbacks.js";

export class App {
  private readonly app: Application;
  private readonly port: number;

  constructor() {
    this.app = express();
    this.port = env.PORT;
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(json());
  }

  routes() {
    this.app.use("/api", router);
    this.app.use(notFoundFallback);
    this.app.use(apiErrorHandler);
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(
        `Oxetech Helpdesk API running on http://localhost:${this.port}`,
      );
    });
  }
}

export default new App().listen();
