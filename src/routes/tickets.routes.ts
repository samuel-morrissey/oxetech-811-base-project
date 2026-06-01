import { Router } from "express";
import {
  readDatabase,
  writeDatabase,
} from "../database/jsonDatabase.js";
import { calculatePriority } from "../domain/calculate-priority.js";
import {
  enrichTicketForList,
  enrichTicketWithComments,
} from "../domain/enrich-ticket.js";
import {
  filterTickets,
  parseTicketFilters,
} from "../domain/filter-tickets.js";
import { findUserById } from "../domain/find-user-by-id.js";
import {
  isValidTicketStatus,
  TICKET_STATUSES,
} from "../domain/ticket-status.js";
import { buildTicketSummary } from "../domain/ticket-summary.js";
import { BadRequest, NotFound } from "../http/api-error.js";
import type { Database, Ticket } from "../types.js";
import { generateId } from "../utils/generate-id.js";

const router = Router();

router.get("/", (request, response) => {
  const database: Database = readDatabase();
  const tickets = filterTickets(
    database.tickets,
    parseTicketFilters(request.query),
  );

  const result = tickets.map((ticket) =>
    enrichTicketForList(database, ticket),
  );

  response.json(result);
});

router.get("/summary", (_request, response) => {
  const database: Database = readDatabase();

  response.json(buildTicketSummary(database.tickets));
});

router.get("/:id", (request, response) => {
  const database: Database = readDatabase();
  const ticket = database.tickets.find(
    (item) => item.id === request.params.id,
  );

  if (!ticket) {
    new NotFound("Ticket nao encontrado", {
      id: request.params.id,
    }).send(response);
    return;
  }

  response.json(enrichTicketWithComments(database, ticket));
});

router.post("/", (request, response) => {
  const database: Database = readDatabase();
  const body = request.body;

  if (
    !body.title ||
    !body.description ||
    !body.category ||
    !body.requesterId
  ) {
    new BadRequest("Campos obrigatorios ausentes", {
      required: ["title", "description", "category", "requesterId"],
      received: body,
    }).send(response);
    return;
  }

  const user = findUserById(database, body.requesterId);
  if (!user) {
    new BadRequest("Solicitante invalido").send(response);
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

router.patch("/:id/status", (request, response) => {
  const database: Database = readDatabase();
  const ticket = database.tickets.find(
    (item) => item.id === request.params.id,
  );
  const rawStatus = request.body.status;

  if (!ticket) {
    new NotFound("Ticket nao encontrado").send(response);
    return;
  }

  if (
    typeof rawStatus !== "string" ||
    !isValidTicketStatus(rawStatus)
  ) {
    new BadRequest("Status invalido", {
      allowed: [...TICKET_STATUSES],
    }).send(response);
    return;
  }

  const newStatus = rawStatus;

  if (newStatus === "closed" && !request.body.comment) {
    new BadRequest(
      "Informe um comentario para fechar o chamado",
    ).send(response);
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

router.post("/:id/comments", (request, response) => {
  const database: Database = readDatabase();
  const ticket = database.tickets.find(
    (item) => item.id === request.params.id,
  );
  const body = request.body;

  if (!ticket) {
    new NotFound("Ticket nao encontrado").send(response);
    return;
  }

  if (!body.message || !body.authorId) {
    new BadRequest("Comentario e autor sao obrigatorios").send(
      response,
    );
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

export { router as ticketsRouter };
