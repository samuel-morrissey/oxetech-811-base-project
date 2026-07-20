import type { Database, Ticket, TicketComment, User } from "../types";
import { readDatabase, writeDatabase } from "./database";

export function loadDatabase(): Database {
  return readDatabase();
}

export function saveDatabase(database: Database): void {
  writeDatabase(database);
}

export function findAllTickets(database: Database): Ticket[] {
  return database.tickets;
}

export function findTicketById(database: Database, id: string): Ticket | undefined {
  return database.tickets.find((ticket) => ticket.id === id);
}

export function findUserById(database: Database, id: string): User | undefined {
  return database.users.find((user) => user.id === id);
}

export function findCommentsByTicketId(database: Database, ticketId: string): TicketComment[] {
  return database.comments.filter((comment) => comment.ticketId === ticketId);
}

export function addTicket(database: Database, ticket: Ticket): void {
  database.tickets.push(ticket);
}

export function addComment(database: Database, comment: TicketComment): void {
  database.comments.push(comment);
}

export function touchTicket(ticket: Ticket): void {
  ticket.updatedAt = new Date().toISOString();
}

export function buildUserMap(database: Database): Map<string, User> {
  return new Map(database.users.map((user) => [user.id, user]));
}

export function buildCommentCountByTicket(database: Database): Map<string, number> {
  const counts = new Map<string, number>();

  for (const comment of database.comments) {
    counts.set(comment.ticketId, (counts.get(comment.ticketId) ?? 0) + 1);
  }

  return counts;
}

/**
 * Repository pattern (interface): abstrai o armazenamento. jsonTicketRepository
 * e a impl atual (JSON em disco); em testes, injetamos um fake que satisfaz
 * a mesma interface. Ver docs/DESIGN_PATTERNS.md#2-repository-interface.
 */
export interface TicketRepository {
  load(): Database;
  save(database: Database): void;
  findAllTickets(database: Database): Ticket[];
  findTicketById(database: Database, id: string): Ticket | undefined;
  findUserById(database: Database, id: string): User | undefined;
  findCommentsByTicketId(database: Database, ticketId: string): TicketComment[];
  addTicket(database: Database, ticket: Ticket): void;
  addComment(database: Database, comment: TicketComment): void;
  touchTicket(ticket: Ticket): void;
  buildUserMap(database: Database): Map<string, User>;
  buildCommentCountByTicket(database: Database): Map<string, number>;
}

/**
 * Repository pattern: implementacao concreta baseada em JSON file.
 * Ver docs/DESIGN_PATTERNS.md#2-repository-interface.
 */
export const jsonTicketRepository: TicketRepository = {
  load: loadDatabase,
  save: saveDatabase,
  findAllTickets,
  findTicketById,
  findUserById,
  findCommentsByTicketId,
  addTicket,
  addComment,
  touchTicket,
  buildUserMap,
  buildCommentCountByTicket,
};
