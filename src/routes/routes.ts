import { Router } from "express";
import { calculateTicketPriority, generateId } from "../services";
import type { Ticket, TicketStatus } from "../types";
import { DatabaseManager } from "../repository";


const router = Router();

router.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "oxetech-helpdesk" });
});

router.get("/users", (_request, response) => {
  const database = DatabaseManager.getInstance().readDatabase();

  response.json(database.users);
});

router.get("/tickets", (request, response) => {
  const database = DatabaseManager.getInstance().readDatabase();
  let tickets = database.tickets;

  if (request.query.status) {
    tickets = tickets.filter((ticket) => ticket.status === request.query.status);
  }

  if (request.query.category) {
    tickets = tickets.filter((ticket) => ticket.category === request.query.category);
  }

  if (request.query.search) {
    const search = String(request.query.search).toLowerCase();
    tickets = tickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(search) ||
        ticket.description.toLowerCase().includes(search) ||
        ticket.category.toLowerCase().includes(search),
    );
  }

  const result = tickets.map((ticket) => {
    const requester = database.users.find((user) => user.id === ticket.requesterId);
    const assigned = database.users.find((user) => user.id === ticket.assignedToId);
    const comments = database.comments.filter((comment) => comment.ticketId === ticket.id);

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
  const database = DatabaseManager.getInstance().readDatabase();
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
  const database = DatabaseManager.getInstance().readDatabase();
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
  const database = DatabaseManager.getInstance().readDatabase();
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
    priority: calculateTicketPriority(body.category, body.description),
    createdAt: now,
    updatedAt: now,
  };

  database.tickets.push(ticket);
  DatabaseManager.getInstance().writeDatabase(database);

  response.status(201).json(ticket);
});


router.patch("/tickets/:id/status", (request, response) => {
  const database = DatabaseManager.getInstance().readDatabase();
  const ticket = database.tickets.find((item) => item.id === request.params.id);
  const newStatus = request.body.status as TicketStatus;

  if (!ticket) {
    response.status(404).json({ message: "Ticket nao encontrado" });
    return;
  }

  if (!["open", "in_progress", "resolved", "closed"].includes(newStatus)) {
    response.status(400).json({ message: "Status invalido", allowed: ["open", "in_progress", "resolved", "closed"] });
    return;
  }

  if (newStatus === "closed" && !request.body.comment) {
    response.status(400).json({ message: "Informe um comentario para fechar o chamado" });
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

  DatabaseManager.getInstance().writeDatabase(database);
  response.json(ticket);
});

router.post("/tickets/:id/comments", (request, response) => {
  const database = DatabaseManager.getInstance().readDatabase();
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
  DatabaseManager.getInstance().writeDatabase(database);

  response.status(201).json(comment);
});

export default router;