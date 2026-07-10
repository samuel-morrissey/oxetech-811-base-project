import { Router } from "express";
import { AppError } from "./errors";
import { findAllUsers } from "./userRepository";
import {
  addTicketComment,
  createTicket,
  getTicketDetails,
  getTicketsSummary,
  listTickets,
  updateTicketStatus,
} from "./ticketService";
import {
  validateAddCommentInput,
  validateCreateTicketInput,
  validateUpdateStatusInput,
} from "./validation";

const router = Router();

router.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "oxetech-helpdesk" });
});

router.get("/users", (_request, response) => {
  response.json(findAllUsers());
});

router.get("/tickets", (request, response) => {
  const result = listTickets({
    status: request.query.status ? String(request.query.status) : undefined,
    category: request.query.category ? String(request.query.category) : undefined,
    search: request.query.search ? String(request.query.search) : undefined,
  });

  response.json(result);
});

router.get("/tickets/summary", (_request, response) => {
  response.json(getTicketsSummary());
});

router.get("/tickets/:id", (request, response, next) => {
  try {
    const ticket = getTicketDetails(request.params.id);

    if (!ticket) {
      throw new AppError(404, "Ticket nao encontrado", { id: request.params.id });
    }

    response.json(ticket);
  } catch (error) {
    next(error);
  }
});

router.post("/tickets", (request, response, next) => {
  try {
    const input = validateCreateTicketInput(request.body);
    const ticket = createTicket(input);
    response.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

router.patch("/tickets/:id/status", (request, response, next) => {
  try {
    const input = validateUpdateStatusInput(request.body);
    const ticket = updateTicketStatus(request.params.id, input);

    if (!ticket) {
      throw new AppError(404, "Ticket nao encontrado", { id: request.params.id });
    }

    response.json(ticket);
  } catch (error) {
    next(error);
  }
});

router.post("/tickets/:id/comments", (request, response, next) => {
  try {
    const input = validateAddCommentInput(request.body);
    const comment = addTicketComment(request.params.id, input);

    if (!comment) {
      throw new AppError(404, "Ticket nao encontrado", { id: request.params.id });
    }

    response.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

export default router;
