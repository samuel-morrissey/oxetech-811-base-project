import { prisma } from "./prisma";
import type { User, Ticket, TicketComment } from "../../domain/types";

export async function getUsers(): Promise<User[]> {
  return prisma.user.findMany();
}

export async function getTickets(): Promise<Ticket[]> {
  const rows = await prisma.ticket.findMany({
    orderBy: { createdAt: "asc" },
  });
  return rows.map((row) => ({
    ...row,
    assignedToId: row.assignedToId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  })) as Ticket[];
}

export async function getComments(): Promise<TicketComment[]> {
  const rows = await prisma.ticketComment.findMany({
    orderBy: { createdAt: "asc" },
  });
  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function saveTicket(ticket: Ticket): Promise<void> {
  await prisma.ticket.create({
    data: {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
      requesterId: ticket.requesterId,
      assignedToId: ticket.assignedToId || null,
      createdAt: new Date(ticket.createdAt),
      updatedAt: new Date(ticket.updatedAt),
    },
  });
}

export async function updateTicket(ticket: Ticket): Promise<void> {
  await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
      requesterId: ticket.requesterId,
      assignedToId: ticket.assignedToId || null,
      updatedAt: new Date(ticket.updatedAt),
    },
  });
}

export async function saveComment(comment: TicketComment): Promise<void> {
  await prisma.ticketComment.create({
    data: {
      id: comment.id,
      ticketId: comment.ticketId,
      authorId: comment.authorId,
      message: comment.message,
      createdAt: new Date(comment.createdAt),
    },
  });
}
