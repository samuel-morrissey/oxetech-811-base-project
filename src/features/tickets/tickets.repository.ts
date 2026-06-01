import {
  readDatabase,
  writeDatabase,
} from "../../utils/json-database.js";
import type { Ticket } from "./types/ticket.js";
import type { TicketComment } from "./types/ticket-comment.js";

export class TicketsRepository {
  findAll(): Ticket[] {
    return readDatabase().tickets;
  }

  findById(ticketId: string): Ticket | undefined {
    return readDatabase().tickets.find(
      (ticket) => ticket.id === ticketId,
    );
  }

  create(ticket: Ticket): Ticket {
    const database = readDatabase();
    database.tickets.push(ticket);
    writeDatabase(database);

    return ticket;
  }

  save(ticket: Ticket): Ticket {
    const database = readDatabase();
    const index = database.tickets.findIndex(
      (item) => item.id === ticket.id,
    );

    if (index !== -1) {
      database.tickets[index] = ticket;
    }

    writeDatabase(database);

    return ticket;
  }

  findCommentsByTicketId(ticketId: string): TicketComment[] {
    return readDatabase().comments.filter(
      (comment) => comment.ticketId === ticketId,
    );
  }

  createComment(
    comment: TicketComment,
    ticket?: Ticket,
  ): TicketComment {
    const database = readDatabase();
    database.comments.push(comment);

    if (ticket) {
      const index = database.tickets.findIndex(
        (item) => item.id === ticket.id,
      );

      if (index !== -1) {
        database.tickets[index] = ticket;
      }
    }

    writeDatabase(database);

    return comment;
  }
}
