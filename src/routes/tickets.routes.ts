import { Router, type Request, type Response } from "express";
import { TicketController } from "../controllers/ticket-controller.js";

const router = Router();
const controller = new TicketController();

router.get("/", (request, response) =>
  controller.index(request, response),
);

router.get("/summary", (request, response) =>
  controller.summary(request, response),
);

router.get("/:id", (request, response) =>
  controller.show(request, response),
);

router.post("/", (request, response) =>
  controller.store(request, response),
);

router.patch("/:id/status", (request, response) =>
  controller.updateStatus(request, response),
);

router.post("/:id/comments", (request: Request, response: Response) =>
  controller.storeComment(request, response),
);

export { router as ticketsRouter };
