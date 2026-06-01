import { Router } from "express";
import {
  readDatabase,
  writeDatabase,
} from "./database/jsonDatabase.js";
import { calculatePriority } from "./domain/calculate-priority.js";
import { findUserById } from "./domain/find-user-by-id.js";
import {
  isValidTicketStatus,
  TICKET_STATUSES,
} from "./domain/ticket-status.js";
import type { Database, Ticket } from "./types.js";
import { generateId } from "./utils/generate-id.js";

const router = Router();

router.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "oxetech-helpdesk" });
});

router.get("/users", (_request, response) => {
  const database: Database = readDatabase();

  response.json(database.users);
});

router.get("/tickets", (request, response) => {
  const database: Database = readDatabase();
  let tickets: Ticket[] = database.tickets;

  if (typeof request.query.status === "string") {
    tickets = tickets.filter(
      (ticket) => ticket.status === request.query.status,
    );
  }

  if (typeof request.query.category === "string") {
    tickets = tickets.filter(
      (ticket) => ticket.category === request.query.category,
    );
  }

  if (typeof request.query.search === "string") {
    const search = request.query.search.toLowerCase();
    tickets = tickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(search) ||
        ticket.description.toLowerCase().includes(search) ||
        ticket.category.toLowerCase().includes(search),
    );
  }

  const result = tickets.map((ticket) => {
    const requester = findUserById(database, ticket.requesterId);
    const assigned = ticket.assignedToId
      ? findUserById(database, ticket.assignedToId)
      : undefined;
    const comments = database.comments.filter(
      (comment) => comment.ticketId === ticket.id,
    );

    return {
      ...ticket,
      requester,
      assigned,
      commentsCount: comments.length,
    };
  });

  response.json(result);
});

router.get("/tickets/summary", (_request, response) => {
  const database: Database = readDatabase();
  const summary = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
  };

  for (const ticket of database.tickets) {
    if (ticket.status === "open") summary.open++;
    if (ticket.status === "in_progress") summary.in_progress++;
    if (ticket.status === "resolved") summary.resolved++;
    if (ticket.status === "closed") summary.closed++;
    if (ticket.priority === "urgent") summary.urgent++;
  }

  response.json(summary);
});

router.get("/tickets/:id", (request, response) => {
  const database: Database = readDatabase();
  const ticket = database.tickets.find(
    (item) => item.id === request.params.id,
  );

  if (!ticket) {
    response.status(404).json({
      error: "Ticket nao encontrado",
      id: request.params.id,
    });
    return;
  }

  const requester = findUserById(database, ticket.requesterId);
  const assigned = ticket.assignedToId
    ? findUserById(database, ticket.assignedToId)
    : undefined;
  const comments = database.comments
    .filter((comment) => comment.ticketId === ticket.id)
    .map((comment) => ({
      ...comment,
      author: findUserById(database, comment.authorId),
    }));

  response.json({ ...ticket, requester, assigned, comments });
});

router.post("/tickets", (request, response) => {
  const database: Database = readDatabase();
  const body = request.body;

  if (
    !body.title ||
    !body.description ||
    !body.category ||
    !body.requesterId
  ) {
    response.status(400).json({
      message: "Campos obrigatorios ausentes",
      required: ["title", "description", "category", "requesterId"],
      received: body,
    });
    return;
  }

  const user = findUserById(database, body.requesterId);
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
  const database: Database = readDatabase();
  const ticket = database.tickets.find(
    (item) => item.id === request.params.id,
  );
  const rawStatus = request.body.status;

  if (!ticket) {
    response.status(404).json({ message: "Ticket nao encontrado" });
    return;
  }

  if (
    typeof rawStatus !== "string" ||
    !isValidTicketStatus(rawStatus)
  ) {
    response.status(400).json({
      message: "Status invalido",
      allowed: [...TICKET_STATUSES],
    });
    return;
  }

  const newStatus = rawStatus;

  if (newStatus === "closed" && !request.body.comment) {
    response.status(400).json({
      message: "Informe um comentario para fechar o chamado",
    });
    return;
  }

  ticket.status = newStatus;
  ticket.updatedAt = new Date().toISOString();

  if (request.body.comment) {
    database.comments.push({
      id: generateId("comment"),
      ticketId: ticket.id,
      authorId: request.body.authorId || ticket.requesterId,
      message: request.body.comment,
      createdAt: new Date().toISOString(),
    });
  }

  writeDatabase(database);
  response.json(ticket);
});

router.post("/tickets/:id/comments", (request, response) => {
  const database: Database = readDatabase();
  const ticket = database.tickets.find(
    (item) => item.id === request.params.id,
  );
  const body = request.body;

  if (!ticket) {
    response.status(404).json({ error: "Ticket nao encontrado" });
    return;
  }

  if (!body.message || !body.authorId) {
    response
      .status(400)
      .json({ error: "Comentario e autor sao obrigatorios" });
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
