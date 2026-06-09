import { Router } from "express";
import { VALID_TICKET_STATUSES } from "./domain/ticket.constants";
import type { Ticket, TicketStatus } from "./domain/types";
import {
  calculatePriority,
  calculateTicketSummary,
  filterTickets,
  generateId,
} from "./domain/utils/ticket.utils";
import {
  getComments,
  getTickets,
  getUsers,
  saveComment,
  saveTicket,
  updateTicket,
} from "./infrastructure/database/file.repository";

const router = Router();

router.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "oxetech-helpdesk" });
});

router.get("/users", (_request, response) => {
  const users = getUsers();
  response.json(users);
});

router.get("/tickets", (request, response) => {
  const tickets = getTickets();
  const users = getUsers();
  const comments = getComments();

  const { status, category, search } = request.query;

  const filteredTickets = filterTickets(tickets, {
    status: status as string,
    category: category as string,
    search: search as string,
  });

  const result = filteredTickets.map((ticket) => {
    const requester = users.find((user) => user.id === ticket.requesterId);
    const assigned = users.find((user) => user.id === ticket.assignedToId);
    const ticketComments = comments.filter((comment) => comment.ticketId === ticket.id);

    return {
      ...ticket,
      requester,
      assigned,
      commentsCount: ticketComments.length,
    };
  });

  response.json(result);
});

router.get("/tickets/summary", (_request, response) => {
  const tickets = getTickets();
  const summary = calculateTicketSummary(tickets);
  response.json(summary);
});

router.get("/tickets/:id", (request, response) => {
  const tickets = getTickets();
  const ticket = tickets.find((item) => item.id === request.params.id);

  if (!ticket) {
    response.status(404).json({ error: "Ticket nao encontrado", id: request.params.id });
    return;
  }

  const users = getUsers();
  const comments = getComments();

  const requester = users.find((user) => user.id === ticket.requesterId);
  const assigned = users.find((user) => user.id === ticket.assignedToId);
  const ticketComments = comments
    .filter((comment) => comment.ticketId === ticket.id)
    .map((comment) => ({
      ...comment,
      author: users.find((user) => user.id === comment.authorId),
    }));

  response.json({ ...ticket, requester, assigned, comments: ticketComments });
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

  const users = getUsers();
  const user = users.find((item) => item.id === body.requesterId);
  if (!user) {
    response.status(400).json({ message: "Solicitante invalido" });
    return;
  }

  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: generateId("ticket"),
    title: body.title,
    description: body.description,
    category: body.category,
    requesterId: body.requesterId,
    assignedToId: body.assignedToId,
    status: "open",
    priority: calculatePriority(body.category, body.description),
    createdAt: now,
    updatedAt: now,
  };

  saveTicket(ticket);

  response.status(201).json(ticket);
});

router.patch("/tickets/:id/status", (request, response) => {
  const tickets = getTickets();
  const ticket = tickets.find((item) => item.id === request.params.id);
  const newStatus = request.body.status as TicketStatus;

  if (!ticket) {
    response.status(404).json({ message: "Ticket nao encontrado" });
    return;
  }

  if (!VALID_TICKET_STATUSES.includes(newStatus)) {
    response.status(400).json({
      message: "Status invalido",
      allowed: VALID_TICKET_STATUSES,
    });
    return;
  }

  if (newStatus === "closed" && !request.body.comment) {
    response.status(400).json({ message: "Informe um comentario para fechar o chamado" });
    return;
  }

  ticket.status = newStatus;
  ticket.updatedAt = new Date().toISOString();

  updateTicket(ticket);

  if (request.body.comment) {
    const comment = {
      id: generateId("comment"),
      ticketId: ticket.id,
      authorId: request.body.authorId || ticket.requesterId,
      message: request.body.comment,
      createdAt: new Date().toISOString(),
    };
    saveComment(comment);
  }

  response.json(ticket);
});

router.post("/tickets/:id/comments", (request, response) => {
  const tickets = getTickets();
  const ticket = tickets.find((item) => item.id === request.params.id);
  const body = request.body;

  if (!ticket) {
    response.status(404).json({ error: "Ticket nao encontrado" });
    return;
  }

  if (!body.message || !body.authorId) {
    response.status(400).json({ error: "Comentario e autor sao obrigatorios" });
    return;
  }

  const comment = {
    id: generateId("comment"),
    ticketId: ticket.id,
    authorId: body.authorId,
    message: body.message,
    createdAt: new Date().toISOString(),
  };

  saveComment(comment);

  ticket.updatedAt = new Date().toISOString();
  updateTicket(ticket);

  response.status(201).json(comment);
});

export default router;
