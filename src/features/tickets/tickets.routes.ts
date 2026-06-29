import { Router } from "express";
import { createTicketsModule } from "../../composition/create-tickets-module.js";
import { routeHandler } from "../../http/route-handler.js";
import {
  validateBody,
  validateListTicketsQuery,
} from "../../http/validate-request.js";
import { createTicketCommentBodySchema } from "./dtos/create-ticket-comment.dto.js";
import { createTicketSchema } from "./dtos/create-ticket.dto.js";
import { updateTicketStatusBodySchema } from "./dtos/update-ticket-status.dto.js";

const { controller } = createTicketsModule();
const router = Router();

router.get(
  "/",
  validateListTicketsQuery(),
  routeHandler((request, response) =>
    controller.index(request, response),
  ),
);

router.get(
  "/summary",
  routeHandler((request, response) =>
    controller.summary(request, response),
  ),
);

router.get(
  "/:id",
  routeHandler((request, response) =>
    controller.show(request, response),
  ),
);

router.post(
  "/",
  validateBody(createTicketSchema),
  routeHandler((request, response) =>
    controller.store(request, response),
  ),
);

router.patch(
  "/:id/status",
  validateBody(updateTicketStatusBodySchema),
  routeHandler((request, response) =>
    controller.updateStatus(request, response),
  ),
);

router.post(
  "/:id/comments",
  validateBody(createTicketCommentBodySchema),
  routeHandler((request, response) =>
    controller.storeComment(request, response),
  ),
);

export { router as ticketsRouter };
