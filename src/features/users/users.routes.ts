import { Router } from "express";
import { createUsersModule } from "../../composition/create-users-module.js";
import { routeHandler } from "../../http/route-handler.js";

const { controller } = createUsersModule();
const router = Router();

router.get(
  "/",
  routeHandler((request, response) =>
    controller.index(request, response),
  ),
);

export { router as usersRouter };
