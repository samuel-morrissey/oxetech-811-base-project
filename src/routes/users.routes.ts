import { Router, type Request, type Response } from "express";
import { UsersController } from "../controllers/users-controller.js";

const router = Router();
const controller = new UsersController();

router.get("/", (request: Request, response: Response) =>
  controller.index(request, response),
);

export { router as usersRouter };
