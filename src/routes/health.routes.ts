import { Router, type Request, type Response } from "express";
import { HealthController } from "../controllers/health-controller.js";

const router = Router();
const controller = new HealthController();

router.get("/", (request: Request, response: Response) =>
  controller.index(request, response),
);

export { router as healthRouter };
