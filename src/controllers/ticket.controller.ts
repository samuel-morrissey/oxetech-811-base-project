import type { Request, Response } from "express";
import { ValidationError, NotFoundError } from "../domain/errors/app-error";
import { VALID_TICKET_STATUSES, VALID_TICKET_CATEGORIES } from "../domain/ticket.constants";
import type { Ticket, TicketStatus } from "../domain/types";
import { mapTicketDetails } from "../domain/utils/ticket.mapper";
import {
  calculatePriority,
  calculateTicketSummary,
  filterTickets,
  generateId,
} from "../domain/utils/ticket.utils";
import { sanitizeUser } from "../domain/utils/user.mapper";
import { prisma } from "../infrastructure/database/prisma";
import {
  getComments,
  getTickets,
  getUsers,
  saveComment,
  saveTicket,
  updateTicket,
} from "../infrastructure/database/file.repository";

export function healthCheck(_request: Request, response: Response) {
  response.json({ status: "ok", service: "oxetech-helpdesk" });
}

export function listUsers(_request: Request, response: Response) {
  const users = getUsers();
  const sanitizedUsers = users.map((user) => sanitizeUser(user));
  response.json(sanitizedUsers);
}

export function listTickets(request: Request, response: Response) {
  const tickets = getTickets();
  const users = getUsers();
  const comments = getComments();

  const { status, category, search } = request.query;

  const filteredTickets = filterTickets(tickets, {
    status: status as string,
    category: category as string,
    search: search as string,
  });

  const result = filteredTickets.map((ticket) => mapTicketDetails(ticket, users, comments));

  response.json(result);
}

export function getTicketSummary(_request: Request, response: Response) {
  const tickets = getTickets();
  const summary = calculateTicketSummary(tickets);
  response.json(summary);
}

export function getTicketById(request: Request, response: Response) {
  const tickets = getTickets();
  const ticket = tickets.find((item) => item.id === request.params.id);

  if (!ticket) {
    throw new NotFoundError("Ticket nao encontrado");
  }

  const users = getUsers();
  const comments = getComments();

  const enrichedTicket = mapTicketDetails(ticket, users, comments, true);

  response.json(enrichedTicket);
}

export async function createTicket(request: Request, response: Response) {
  const body = request.body;

  if (!body.title || !body.description || !body.category || !body.requesterId) {
    throw new ValidationError("Campos obrigatorios ausentes");
  }

  if (!VALID_TICKET_CATEGORIES.includes(body.category)) {
    throw new ValidationError(`Categoria invalida. Permitidas: ${VALID_TICKET_CATEGORIES.join(", ")}`);
  }

  const user = await prisma.user.findUnique({ where: { id: body.requesterId } });
  if (!user) {
    throw new ValidationError("Solicitante invalido");
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
}

export async function updateTicketStatus(request: Request, response: Response) {
  const tickets = getTickets();
  const ticket = tickets.find((item) => item.id === request.params.id);
  const newStatus = request.body.status as TicketStatus;

  if (!ticket) {
    throw new NotFoundError("Ticket nao encontrado");
  }

  if (!VALID_TICKET_STATUSES.includes(newStatus)) {
    throw new ValidationError(`Status invalido. Permitidos: ${VALID_TICKET_STATUSES.join(", ")}`);
  }

  if (newStatus === "closed" && !request.body.comment) {
    throw new ValidationError("Informe um comentario para fechar o chamado");
  }

  if (request.body.authorId) {
    const author = await prisma.user.findUnique({ where: { id: request.body.authorId } });
    if (!author) {
      throw new ValidationError("Autor do comentario invalido");
    }
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
}

export async function addTicketComment(request: Request, response: Response) {
  const tickets = getTickets();
  const ticket = tickets.find((item) => item.id === request.params.id);
  const body = request.body;

  if (!ticket) {
    throw new NotFoundError("Ticket nao encontrado");
  }

  if (!body.message || !body.authorId) {
    throw new ValidationError("Comentario e autor sao obrigatorios");
  }

  const author = await prisma.user.findUnique({ where: { id: body.authorId } });
  if (!author) {
    throw new ValidationError("Autor do comentario invalido");
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
}
