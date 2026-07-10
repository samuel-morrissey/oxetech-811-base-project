import { readDatabase, writeDatabase } from "./database";
import type { Ticket, TicketComment } from "./types";

export function findAllTickets(): Ticket[] {
  const database = readDatabase();
  return database.tickets;
}

export function findTicketById(id: string): Ticket | undefined {
  const database = readDatabase();
  return database.tickets.find((ticket) => ticket.id === id);
}

export function saveTicket(ticket: Ticket): void {
  const database = readDatabase();
  database.tickets.push(ticket);
  writeDatabase(database);
}

export function updateTicket(updatedTicket: Ticket): void {
  const database = readDatabase();
  const index = database.tickets.findIndex((ticket) => ticket.id === updatedTicket.id);
  if (index !== -1) {
    database.tickets[index] = updatedTicket;
    writeDatabase(database);
  }
}

export function updateTicketWithComment(updatedTicket: Ticket, comment?: TicketComment): void {
  const database = readDatabase();
  const index = database.tickets.findIndex((ticket) => ticket.id === updatedTicket.id);

  if (index === -1) {
    return;
  }

  database.tickets[index] = updatedTicket;

  if (comment) {
    database.comments.push(comment);
  }

  writeDatabase(database);
}
