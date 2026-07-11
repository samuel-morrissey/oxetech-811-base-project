import { Router } from "express";
import type { Database, PublicUser, Ticket, TicketCategory, TicketPriority, TicketStatus, User } from "./types";
import { readDatabase, writeDatabase } from "./database";
import { AppError } from "./errors/AppError";
import {
  validateBody,
  validateCreateTicket,
  validateUpdateStatus,
  validateCreateComment,
} from "./middlewares/validation.middleware";

const router = Router();

const LONG_DESCRIPTION_THRESHOLD = 220;
const VALID_STATUSES: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function toPublicUser(user: User): PublicUser {
  const { password: _password, ...rest } = user;
  return rest;
}

function enrichTicket(ticket: Ticket, database: Database) {
  const usersMap = new Map(database.users.map((user) => [user.id, user]));
  const requester = usersMap.get(ticket.requesterId);
  const assigned = ticket.assignedToId ? usersMap.get(ticket.assignedToId) : undefined;
  const comments = database.comments
    .filter((comment) => comment.ticketId === ticket.id)
    .map((comment) => ({
      ...comment,
      author: comment.authorId ? usersMap.get(comment.authorId) : undefined,
    }));

  return { ...ticket, requester, assigned, comments };
}

export function calculatePriority(category: TicketCategory, description: string): TicketPriority {
  if (category === "infra" || description.toLowerCase().includes("urgente")) {
    return "urgent";
  }

  if (category === "sistemas" || description.length > LONG_DESCRIPTION_THRESHOLD) {
    return "high";
  }

  if (category === "academico") {
    return "medium";
  }

  return "low";
}

router.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "oxetech-helpdesk" });
});

router.get("/users", (_request, response) => {
  const database = readDatabase();
  response.json(database.users.map(toPublicUser));
});

router.get("/tickets", (request, response) => {
  const database = readDatabase();
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

  const usersMap = new Map(database.users.map((user) => [user.id, user]));
  const commentCountsMap = new Map<string, number>();
  for (const comment of database.comments) {
    commentCountsMap.set(comment.ticketId, (commentCountsMap.get(comment.ticketId) || 0) + 1);
  }

  const result = tickets.map((ticket) => {
    const requester = usersMap.get(ticket.requesterId);
    const assigned = ticket.assignedToId ? usersMap.get(ticket.assignedToId) : undefined;
    const commentsCount = commentCountsMap.get(ticket.id) || 0;
    return {
      ...ticket,
      requester,
      assigned,
      commentsCount,
    };
  });

  response.json(result);
});

router.get("/tickets/summary", (_request, response) => {
  const database = readDatabase();
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

router.get("/tickets/:id", (request, response, next) => {
  try {
    const database = readDatabase();
    const ticket = database.tickets.find((item) => item.id === request.params.id);

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    response.json(enrichTicket(ticket, database));
  } catch (error) {
    next(error);
  }
});

router.post(
  "/tickets",
  validateBody(validateCreateTicket),
  (request, response, next) => {
    try {
      const database = readDatabase();
      const body = request.body;

      const user = database.users.find((item) => item.id === body.requesterId);
      if (!user) {
        throw new AppError("Solicitante inválido", 400);
      }

      if (body.assignedToId) {
        const assignedUser = database.users.find((item) => item.id === body.assignedToId);
        if (!assignedUser) {
          throw new AppError("Responsável inválido", 400);
        }
      }

      const now = new Date().toISOString();
      const ticket: Ticket = {
        id: generateId("ticket"),
        title: body.title,
        description: body.description,
        category: body.category as TicketCategory,
        requesterId: body.requesterId,
        assignedToId: body.assignedToId,
        status: "open",
        priority: calculatePriority(body.category as TicketCategory, body.description),
        createdAt: now,
        updatedAt: now,
      };

      database.tickets.push(ticket);
      writeDatabase(database);

      response.status(201).json(ticket);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/tickets/:id/status",
  validateBody(validateUpdateStatus),
  (request, response, next) => {
    try {
      const database = readDatabase();
      const ticket = database.tickets.find((item) => item.id === request.params.id);
      const newStatus = request.body.status as TicketStatus;

      if (!ticket) {
        throw new AppError("Ticket não encontrado", 404);
      }

      ticket.status = newStatus;
      ticket.updatedAt = new Date().toISOString();

      if (request.body.comment) {
        const authorId = request.body.authorId || ticket.requesterId;
        const author = database.users.find((user) => user.id === authorId);
        if (!author) {
          throw new AppError("Autor do comentário inválido", 400);
        }
        database.comments.push({
          id: generateId("comment"),
          ticketId: ticket.id,
          authorId,
          message: request.body.comment,
          createdAt: new Date().toISOString(),
        });
      }

      writeDatabase(database);
      response.json(ticket);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/tickets/:id/comments",
  validateBody(validateCreateComment),
  (request, response, next) => {
    try {
      const database = readDatabase();
      const ticket = database.tickets.find((item) => item.id === request.params.id);
      const body = request.body;

      if (!ticket) {
        throw new AppError("Ticket não encontrado", 404);
      }

      const author = database.users.find((user) => user.id === body.authorId);
      if (!author) {
        throw new AppError("Autor do comentário inválido", 400);
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
    } catch (error) {
      next(error);
    }
  }
);

export default router;