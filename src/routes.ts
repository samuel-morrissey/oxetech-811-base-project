import { Router } from "express";
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

router.get("/tickets/:id", (request, response) => {
  const ticket = getTicketDetails(request.params.id);

  if (!ticket) {
    response.status(404).json({ error: "Ticket nao encontrado", id: request.params.id });
    return;
  }

  response.json(ticket);
});

router.post("/tickets", (request, response) => {
  const body = request.body;

  if (!body.title || !body.description || !body.category || !body.requesterId) {
    response.status(400).json({
      message: "Campos obrigatorios ausentes",
      required: ["title", "description", "category", "requesterId"],
      received: body,
    });
    return;
  }

  const user = findUserById(body.requesterId);
  if (!user) {
    response.status(400).json({ message: "Solicitante invalido" });
    return;
  }

  const ticket = createTicket({
    title: body.title,
    description: body.description,
    category: body.category,
    requesterId: body.requesterId,
    assignedToId: body.assignedToId,
  });

  response.status(201).json(ticket);
});

router.patch("/tickets/:id/status", (request, response) => {
  const newStatus = request.body.status as TicketStatus;

  if (!VALID_STATUSES.includes(newStatus)) {
    response.status(400).json({ message: "Status invalido", allowed: VALID_STATUSES });
    return;
  }

  if (newStatus === "closed" && !request.body.comment) {
    response.status(400).json({ message: "Informe um comentario para fechar o chamado" });
    return;
  }

  const ticket = updateTicketStatus(request.params.id, {
    status: newStatus,
    authorId: request.body.authorId,
    comment: request.body.comment,
  });

  if (!ticket) {
    response.status(404).json({ message: "Ticket nao encontrado" });
    return;
  }

  response.json(ticket);
});

router.post("/tickets/:id/comments", (request, response) => {
  const body = request.body;

  if (!body.message || !body.authorId) {
    response.status(400).json({ error: "Comentario e autor sao obrigatorios" });
    return;
  }

  const comment = addTicketComment(request.params.id, {
    authorId: body.authorId,
    message: body.message,
  });

  if (!comment) {
    response.status(404).json({ error: "Ticket nao encontrado" });
    return;
  }

  response.status(201).json(comment);
});

export default router;
