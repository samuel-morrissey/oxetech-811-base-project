import { Router, type Request, type Response } from "express";
import { UsersRepository } from "./users.repository.js";
import { UsersController } from "./users.controller.js";
import { UsersService } from "./users.service.js";

const router = Router();
const repository = new UsersRepository();
const service = new UsersService(repository);
const controller = new UsersController(service);

router.get("/", (request: Request, response: Response) =>
  controller.index(request, response),
);

export { router as usersRouter };
