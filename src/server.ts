import cors from "cors";
import express, { Application } from "express";
import { env } from "./config/env.js";
import { router } from "./routes/index.js";
import { notFoundFallback } from "./routes/fallbacks.js";

export class App {
  private readonly app: Application;
  private readonly port: number;

  constructor() {
    this.app = express();
    this.port = env.PORT;
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  routes() {
    this.app.use("/api", router);
    this.app.use(notFoundFallback);
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
