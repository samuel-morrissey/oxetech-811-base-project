import { Router } from "express";
import type { Ticket, TicketStatus } from "../types";
import { generateId, calculatePriority } from "../utils/utils";
import { readDatabase, writeDatabase } from "../repository/ticket-repository";
import { getTicketsSummary, updateTicketStatus, enrichTickets, filterTickets} from "../service/ticket-service";

const router = Router();

router.get("/tickets", (request, response) => {
  const database = readDatabase();
  let tickets = filterTickets(database.tickets, request.query);
  const result = enrichTickets(tickets, database);

  response.json(result);
});

router.get("/tickets/summary", (_request, response) => {
  const database = readDatabase();
  const summary = getTicketsSummary(database.tickets);
  response.json(summary);
});


router.get("/tickets/:id", (request, response) => {
  const database = readDatabase();
  const ticket = database.tickets.find((item) => item.id === request.params.id);

  if (!ticket) {
    response.status(404).json({ error: "Ticket nao encontrado", id: request.params.id });
    return;
  }

  const requester = database.users.find((user) => user.id === ticket.requesterId);
  const assigned = database.users.find((user) => user.id === ticket.assignedToId);
  const comments = database.comments
    .filter((comment) => comment.ticketId === ticket.id)
    .map((comment) => ({
      ...comment,
      author: database.users.find((user) => user.id === comment.authorId),
    }));

  response.json({ ...ticket, requester, assigned, comments });
});

router.post("/tickets", (request, response) => {
  const database = readDatabase();
  const body = request.body;

  if (!body.title || !body.description || !body.category || !body.requesterId) {
    response.status(400).json({
      message: "Campos obrigatorios ausentes",
      required: ["title", "description", "category", "requesterId"],
      received: body,
    });
    return;
  }

  const user = database.users.find((item) => item.id === body.requesterId);
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

  database.tickets.push(ticket);
  writeDatabase(database);

  response.status(201).json(ticket);
});



router.patch("/tickets/:id/status", (request, response) => {
  const database = readDatabase();

  try {
    const ticket = updateTicketStatus(
      database,
      request.params.id,
      request.body.status as TicketStatus,
      request.body.authorId,
      request.body.comment
    );
    response.json(ticket);
  } catch (error: any) {
    if (error.message === "NOT_FOUND") {
      response.status(404).json({ message: "Ticket não encontrado" });
    } else if (error.message === "INVALID_STATUS") {
      response.status(400).json({ message: "Status inválido" });
    } else if (error.message === "COMMENT_REQUIRED") {
      response.status(400).json({ message: "Informe um comentário para fechar o chamado" });
    } else {
      response.status(500).json({ message: "Erro interno" });
    }
  }
});

router.post("/tickets/:id/comments", (request, response) => {
  const database = readDatabase();
  const ticket = database.tickets.find((item) => item.id === request.params.id);
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

  database.comments.push(comment);
  ticket.updatedAt = new Date().toISOString();
  writeDatabase(database);

  response.status(201).json(comment);
});

export default router;