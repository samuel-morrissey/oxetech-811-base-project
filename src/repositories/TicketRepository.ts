import { readDatabase, writeDatabase } from "../database";
import type { Ticket, TicketComment } from "../types";

export interface ITicketRepository {
  findAll(filters?: { status?: string; category?: string; search?: string }): Ticket[];
  findById(id: string): Ticket | undefined;
  create(ticket: Ticket): Ticket;
  update(ticket: Ticket): Ticket;
  createComment(comment: TicketComment): TicketComment;
  findCommentsByTicketId(ticketId: string): TicketComment[];
  findAllComments(): TicketComment[];
}

export class TicketRepository implements ITicketRepository {
  findAll(filters?: { status?: string; category?: string; search?: string }): Ticket[] {
    const db = readDatabase();
    let tickets = db.tickets;

    if (filters) {
      if (filters.status) {
        tickets = tickets.filter((ticket) => ticket.status === filters.status);
      }
      if (filters.category) {
        tickets = tickets.filter((ticket) => ticket.category === filters.category);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        tickets = tickets.filter(
          (ticket) =>
            ticket.title.toLowerCase().includes(search) ||
            ticket.description.toLowerCase().includes(search) ||
            ticket.category.toLowerCase().includes(search)
        );
      }
    }

    return tickets;
  }

  findById(id: string): Ticket | undefined {
    const db = readDatabase();
    return db.tickets.find((ticket) => ticket.id === id);
  }

  create(ticket: Ticket): Ticket {
    const db = readDatabase();
    db.tickets.push(ticket);
    writeDatabase(db);
    return ticket;
  }

  update(updatedTicket: Ticket): Ticket {
    const db = readDatabase();
    const index = db.tickets.findIndex((ticket) => ticket.id === updatedTicket.id);
    if (index !== -1) {
      db.tickets[index] = updatedTicket;
      writeDatabase(db);
    }
    return updatedTicket;
  }

  createComment(comment: TicketComment): TicketComment {
    const db = readDatabase();
    db.comments.push(comment);
    writeDatabase(db);
    return comment;
  }

  findCommentsByTicketId(ticketId: string): TicketComment[] {
    const db = readDatabase();
    return db.comments.filter((comment) => comment.ticketId === ticketId);
  }

  findAllComments(): TicketComment[] {
    const db = readDatabase();
    return db.comments;
  }
}
