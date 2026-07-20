import type { Ticket as TicketRow } from "@prisma/client";
import { Ticket } from "../../core/Ticket";
import { TicketRepository } from "../../core/repositories/TicketRepository";
import { prisma } from "./prisma";

function toTicket(row: TicketRow): Ticket {
  return new Ticket({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    priority: row.priority,
    requesterId: row.requesterId,
    assignedToId: row.assignedToId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

export class PrismaTicketRepository implements TicketRepository {
  async findAll(): Promise<Ticket[]> {
    const rows = await prisma.ticket.findMany();
    return rows.map(toTicket);
  }

  async findById(id: string): Promise<Ticket | undefined> {
    const row = await prisma.ticket.findUnique({ where: { id } });
    return row ? toTicket(row) : undefined;
  }

  async add(ticket: Ticket): Promise<void> {
    await prisma.ticket.create({
      data: {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        status: ticket.status,
        priority: ticket.priority,
        requesterId: ticket.requesterId,
        assignedToId: ticket.assignedToId ?? null,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
    });
  }

  async update(ticket: Ticket): Promise<void> {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        status: ticket.status,
        priority: ticket.priority,
        requesterId: ticket.requesterId,
        assignedToId: ticket.assignedToId ?? null,
        updatedAt: ticket.updatedAt,
      },
    });
  }
}
