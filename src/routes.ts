import { Router } from "express";
import { AppError } from "./errors";
import { VALID_STATUSES, type TicketStatus } from "./types";
import { findAllUsers, findUserById } from "./userRepository";
import {
  addTicketComment,
  createTicket,
  getTicketDetails,
  getTicketsSummary,
  listTickets,
  updateTicketStatus,
} from "./ticketService";

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
    const body = request.body;

    if (!body.title || !body.description || !body.category || !body.requesterId) {
      throw new AppError(400, "Campos obrigatorios ausentes", {
        required: ["title", "description", "category", "requesterId"],
      });
    }

    const user = findUserById(body.requesterId);
    if (!user) {
      throw new AppError(400, "Solicitante invalido");
    }

    const ticket = createTicket({
      title: body.title,
      description: body.description,
      category: body.category,
      requesterId: body.requesterId,
      assignedToId: body.assignedToId,
    });

    response.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

router.patch("/tickets/:id/status", (request, response, next) => {
  try {
    const newStatus = request.body.status as TicketStatus;

    if (!VALID_STATUSES.includes(newStatus)) {
      throw new AppError(400, "Status invalido", { allowed: VALID_STATUSES });
    }

    if (newStatus === "closed" && !request.body.comment) {
      throw new AppError(400, "Informe um comentario para fechar o chamado");
    }

    const ticket = updateTicketStatus(request.params.id, {
      status: newStatus,
      authorId: request.body.authorId,
      comment: request.body.comment,
    });

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
    const body = request.body;

    if (!body.message || !body.authorId) {
      throw new AppError(400, "Comentario e autor sao obrigatorios");
    }

    const comment = addTicketComment(request.params.id, {
      authorId: body.authorId,
      message: body.message,
    });

    if (!comment) {
      throw new AppError(404, "Ticket nao encontrado", { id: request.params.id });
    }

    response.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

export default router;
