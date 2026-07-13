import { type RequestHandler, Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { HealthController } from "../controllers/HealthController";
import { TicketController } from "../controllers/TicketController";
import { UserController } from "../controllers/UserController";

export interface RouterControllers {
  healthController: HealthController;
  authController: AuthController;
  userController: UserController;
  ticketController: TicketController;
  requireAuth: RequestHandler;
}

export function createRouter(controllers: RouterControllers): Router {
  const { healthController, authController, userController, ticketController, requireAuth } = controllers;
  const router = Router();

  // Rotas publicas: nao exigem sessao.
  router.get("/health", healthController.check);
  router.post("/auth/login", authController.login);
  router.post("/auth/logout", authController.logout);

  // A partir daqui todas as rotas exigem um usuario autenticado.
  router.use(requireAuth);

  router.get("/auth/me", authController.me);

  router.get("/users", userController.list);

  router.get("/tickets", ticketController.list);
  router.get("/tickets/summary", ticketController.summary);
  router.get("/tickets/:id", ticketController.getById);
  router.post("/tickets", ticketController.create);
  router.patch("/tickets/:id/status", ticketController.updateStatus);
  router.post("/tickets/:id/comments", ticketController.addComment);
  router.patch("/comments/:id", ticketController.updateComment);

  return router;
}

export default createRouter;
