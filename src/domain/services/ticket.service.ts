import type { Ticket, TicketStatus, TicketComment } from "../types";
import { generateId, calculatePriority } from "../utils/ticket.utils";
import * as repository from "../../infrastructure/database/prisma.repository";
import { ValidationError, NotFoundError } from "../errors/app-error";
import { VALID_TICKET_STATUSES, VALID_TICKET_CATEGORIES } from "../ticket.constants";
import { prisma } from "../../infrastructure/database/prisma";

export async function createTicket(payload: {
  title: string;
  description: string;
  category: string;
  requesterId: string;
  assignedToId?: string;
}): Promise<Ticket> {
  const { title, description, category, requesterId, assignedToId } = payload;

  if (!title || !description || !category || !requesterId) {
    throw new ValidationError("Campos obrigatorios ausentes");
  }

  if (!VALID_TICKET_CATEGORIES.includes(category as any)) {
    throw new ValidationError(`Categoria invalida. Permitidas: ${VALID_TICKET_CATEGORIES.join(", ")}`);
  }

  const user = await prisma.user.findUnique({ where: { id: requesterId } });
  if (!user) {
    throw new ValidationError("Solicitante invalido");
  }

  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: generateId("ticket"),
    title,
    description,
    category: category as any,
    requesterId,
    assignedToId,
    status: "open",
    priority: calculatePriority(category as any, description),
    createdAt: now,
    updatedAt: now,
  };

  await repository.saveTicket(ticket);
  return ticket;
}

export async function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
  authorId?: string,
  commentText?: string,
): Promise<Ticket> {
  const tickets = await repository.getTickets();
  const ticket = tickets.find((item) => item.id === ticketId);

  if (!ticket) {
    throw new NotFoundError("Ticket nao encontrado");
  }

  if (!VALID_TICKET_STATUSES.includes(newStatus)) {
    throw new ValidationError(`Status invalido. Permitidos: ${VALID_TICKET_STATUSES.join(", ")}`);
  }

  if (newStatus === "closed" && !commentText) {
    throw new ValidationError("Informe um comentario para fechar o chamado");
  }

  if (authorId) {
    const author = await prisma.user.findUnique({ where: { id: authorId } });
    if (!author) {
      throw new ValidationError("Autor do comentario invalido");
    }
  }

  ticket.status = newStatus;
  ticket.updatedAt = new Date().toISOString();

  await repository.updateTicket(ticket);

  if (commentText) {
    const comment: TicketComment = {
      id: generateId("comment"),
      ticketId: ticket.id,
      authorId: authorId || ticket.requesterId,
      message: commentText,
      createdAt: new Date().toISOString(),
    };
    await repository.saveComment(comment);
  }

  return ticket;
}

export async function addTicketComment(
  ticketId: string,
  authorId: string,
  message: string,
): Promise<TicketComment> {
  const tickets = await repository.getTickets();
  const ticket = tickets.find((item) => item.id === ticketId);

  if (!ticket) {
    throw new NotFoundError("Ticket nao encontrado");
  }

  if (!message || !authorId) {
    throw new ValidationError("Comentario e autor sao obrigatorios");
  }

  const author = await prisma.user.findUnique({ where: { id: authorId } });
  if (!author) {
    throw new ValidationError("Autor do comentario invalido");
  }

  const comment: TicketComment = {
    id: generateId("comment"),
    ticketId,
    authorId,
    message,
    createdAt: new Date().toISOString(),
  };

  await repository.saveComment(comment);

  ticket.updatedAt = new Date().toISOString();
  await repository.updateTicket(ticket);

  return comment;
}
