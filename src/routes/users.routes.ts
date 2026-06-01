import { Router, type Request, type Response } from "express";
import { UsersController } from "../controllers/users-controller.js";
import { UsersService } from "../services/users-service.js";

const router = Router();
const service = new UsersService();
const controller = new UsersController(service);

router.get("/", (request: Request, response: Response) =>
  controller.index(request, response),
);

export { router as usersRouter };
