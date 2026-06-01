import { Router, type Request, type Response } from "express";
import { TicketController } from "../controllers/ticket-controller.js";
import { TicketService } from "../services/ticket-service.js";

const router = Router();
const service = new TicketService();
const controller = new TicketController(service);

router.get("/", (request: Request, response: Response) =>
  controller.index(request, response),
);

router.get("/summary", (request: Request, response: Response) =>
  controller.summary(request, response),
);

router.get("/:id", (request: Request, response: Response) =>
  controller.show(request, response),
);

router.post("/", (request: Request, response: Response) =>
  controller.store(request, response),
);

router.patch("/:id/status", (request: Request, response: Response) =>
  controller.updateStatus(request, response),
);

router.post("/:id/comments", (request: Request, response: Response) =>
  controller.storeComment(request, response),
);

export { router as ticketsRouter };
